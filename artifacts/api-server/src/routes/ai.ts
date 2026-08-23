import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import {
  getPulseSnapshot,
  listMatchableMembers,
  MATCH_MIN_COMPLETE_PROFILES,
  parseSkills,
  scoreMemberMatch,
} from "../lib/panelMetrics";
import {
  buildSignalVisualPrompt,
  getGenerationStatus,
  HF_EFFICIENT,
  isHiggsfieldConfigured,
  submitImageGeneration,
} from "../lib/higgsfield";

const router = Router();

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY ortam değişkeni tanımlı değil");
  return new Anthropic({ apiKey: key });
}

function topChannelSource(snapshot: Awaited<ReturnType<typeof getPulseSnapshot>>) {
  const top = snapshot.channels.filter((c) => c.messages7d > 0).slice(0, 3);
  const channelNames = top.map((c) => `#${c.name}`).join(", ") || "#genel";
  const dateRange = `${snapshot.weekAgoIso.slice(0, 10)} — ${snapshot.nowIso.slice(0, 10)}`;
  return {
    messageCount: snapshot.messages7d,
    channels: channelNames,
    dateRange,
    label: `${snapshot.messages7d} mesaj · ${channelNames} · ${dateRange}`,
  };
}

// ─── POST /api/ai/signal ─────────────────────────────────────────────────────
router.post("/signal", requireAuth, async (req, res) => {
  try {
    const snapshot = await getPulseSnapshot();
    const source = topChannelSource(snapshot);

    if (!snapshot.sufficient) {
      return res.json({
        empty: true,
        insufficientData: true,
        source,
        weeklyThemes: [],
        connections: [],
        insight: null,
        pulse: {
          messages7d: snapshot.messages7d,
          activeMembers7d: snapshot.activeMembers7d,
          minMessages: Number(process.env.PULSE_MIN_MESSAGES_7D ?? 20),
          minActiveMembers: Number(process.env.PULSE_MIN_ACTIVE_MEMBERS_7D ?? 5),
        },
      });
    }

    const userId = req.user!.id;
    const members = await listMatchableMembers(userId);
    const [me] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const connections = members
      .map((m) => ({
        userId: m.id,
        name: m.name,
        handle: m.handle,
        reason:
          (m.title || m.company)
            ? `${[m.title, m.company].filter(Boolean).join(" · ")} — profil ve becerilerinle örtüşüyor.`
            : "Tamamlanmış profil; tanışma potansiyeli yüksek.",
        matchScore: scoreMemberMatch(
          {
            skills: parseSkills(me?.skills),
            persona: me?.persona,
            title: me?.title,
            company: me?.company,
          },
          m,
        ),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 2);

    let weeklyThemes: { topic: string; momentum: string; summary: string; source?: string }[] = [];
    let insight: string | null = null;

    try {
      const client = getClient();
      const prompt = `Sen inner·hub topluluğunun AI asistanısın. Yalnızca aşağıdaki GERÇEK aktivite özetine dayanarak JSON üret. Uydurma kişi, kanal veya istatistik ekleme.

Aktivite özeti:
${snapshot.contextText}

Şu JSON yapısında yanıt ver (başka açıklama ekleme):
{
  "weeklyThemes": [
    { "topic": "string", "momentum": "yüksek|orta|düşük", "summary": "2 cümle özet — yalnızca özet verisine dayalı" }
  ],
  "insight": "string (1-2 cümle)"
}

weeklyThemes için en fazla 3 tema. Türkçe yaz.`;

      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = (message.content[0] as { text: string }).text.trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        weeklyThemes = (parsed.weeklyThemes ?? []).map((t: { topic: string; momentum: string; summary: string }) => ({
          ...t,
          source: source.label,
        }));
        insight = typeof parsed.insight === "string" ? parsed.insight : null;
      }
    } catch {
      const top = snapshot.channels.find((c) => c.messages7d > 0);
      weeklyThemes = top
        ? [
            {
              topic: `#${top.name} aktivitesi`,
              momentum: top.messages7d >= 10 ? "yüksek" : "orta",
              summary: `Son 7 günde #${top.name} kanalında ${top.messages7d} mesaj var.`,
              source: source.label,
            },
          ]
        : [];
      insight = `Son 7 günde ${snapshot.messages7d} mesaj ve ${snapshot.activeMembers7d} aktif üye kaydedildi.`;
    }

    return res.json({
      empty: false,
      insufficientData: false,
      source,
      weeklyThemes,
      connections,
      insight,
      insightSource: source.label,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? "Signal üretilemedi" });
  }
});

// ─── POST /api/ai/match ──────────────────────────────────────────────────────
router.post("/match", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const members = await listMatchableMembers(userId);

    if (members.length < MATCH_MIN_COMPLETE_PROFILES) {
      return res.json({
        empty: true,
        insufficientProfiles: true,
        minRequired: MATCH_MIN_COMPLETE_PROFILES,
        available: members.length,
        matches: [],
      });
    }

    const [me] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const preferences = Array.isArray(req.body?.preferences)
      ? (req.body.preferences as string[])
      : [];

    const scored = members
      .map((m) => {
        let score = scoreMemberMatch(
          {
            skills: parseSkills(me?.skills),
            persona: me?.persona,
            title: me?.title,
            company: me?.company,
          },
          m,
        );
        for (const pref of preferences) {
          const p = String(pref).toLowerCase();
          if (m.skills.some((s) => s.toLowerCase().includes(p))) score += 4;
          if ((m.title ?? "").toLowerCase().includes(p)) score += 3;
        }
        const matchType =
          m.persona === "investor" || /yatırımcı|investor|angel/i.test(`${m.title} ${m.persona}`)
            ? "Yatırımcı"
            : m.persona === "founder" || /founder|kurucu/i.test(`${m.title}`)
              ? "Co-founder"
              : m.persona === "mentor" || /mentor/i.test(`${m.title}`)
                ? "Mentor"
                : "İş birliği";

        return {
          userId: m.id,
          name: m.name,
          handle: m.handle,
          company: m.company || "—",
          matchType,
          score: Math.min(98, score),
          why: (m.bio ?? "").trim().slice(0, 180) || `${m.title ?? "Üye"} · ${m.company ?? "inner·hub"}`,
          commonGround: m.skills.slice(0, 3),
          avatarUrl: m.avatarUrl,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return res.json({ empty: false, matches: scored });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? "Eşleşme üretilemedi" });
  }
});

// ─── POST /api/ai/image ──────────────────────────────────────────────────────
router.post("/image", requireAuth, async (req, res) => {
  try {
    if (!isHiggsfieldConfigured()) {
      return res.status(503).json({
        error: "Görsel üretimi şu an kullanılamıyor",
      });
    }

    const { prompt, insight, force, cacheKey } = req.body as {
      prompt?: string;
      insight?: string;
      force?: boolean;
      cacheKey?: string;
    };

    const finalPrompt = insight?.trim()
      ? buildSignalVisualPrompt(insight)
      : prompt?.trim();

    if (!finalPrompt) {
      return res.status(400).json({ error: "prompt veya insight gerekli" });
    }

    const rateLimitKey = cacheKey ?? finalPrompt.slice(0, 120);

    const result = await submitImageGeneration({
      prompt: finalPrompt,
      aspectRatio: HF_EFFICIENT.aspectRatio,
      resolution: HF_EFFICIENT.resolution,
      modelId: HF_EFFICIENT.modelId,
      rateLimitKey,
      force: Boolean(force),
    });

    return res.json({
      ...result,
      ...(process.env.NODE_ENV !== "production"
        ? { meta: { model: HF_EFFICIENT.modelId, resolution: HF_EFFICIENT.resolution } }
        : {}),
    });
  } catch (err: any) {
    const isCooldown = String(err.message).includes("Kredi koruması");
    return res.status(isCooldown ? 429 : 500).json({ error: err.message });
  }
});

// ─── GET /api/ai/image/:requestId ────────────────────────────────────────────
router.get("/image/:requestId", requireAuth, async (req, res) => {
  try {
    if (!isHiggsfieldConfigured()) {
      return res.status(503).json({ error: "Görsel üretimi şu an kullanılamıyor" });
    }

    const requestId = req.params.requestId;
    if (!requestId) {
      return res.status(400).json({ error: "requestId gerekli" });
    }

    const result = await getGenerationStatus(requestId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/** POST /api/ai/coach — profil + persona bazlı aksiyon önerileri */
router.post("/coach", requireAuth, async (req, res) => {
  try {
    const profile = (req.body?.profile ?? {}) as {
      name?: string;
      persona?: string | null;
      title?: string | null;
      company?: string | null;
      university?: string | null;
      skills?: string[];
      profileCompletionPct?: number;
      missing?: string[];
    };

    const missing = Array.isArray(profile.missing) ? profile.missing : [];
    const persona = profile.persona || "builder";
    const pct = profile.profileCompletionPct ?? 0;

    const fallback = {
      actions: [
        missing.includes("university")
          ? {
              id: "university",
              title: "Üniversite ekle",
              reason: "Eğitim ağı eşleşmelerini güçlendirir.",
              href: "/panel/profile",
            }
          : {
              id: "skills",
              title: "2+ beceri ekle",
              reason: "Match ve Signal önerileri becerilerine göre çalışır.",
              href: "/panel/profile",
            },
        {
          id: "org",
          title: "Şirketini bağla",
          reason: "Slack tarzı org rozeti ve kampanya hakkı açılır.",
          href: "/panel/org",
        },
        persona === "investor"
          ? {
              id: "capital",
              title: "Capital akışına bak",
              reason: "Yatırımcı odasında deal görünürlüğü artar.",
              href: "/panel/capital",
            }
          : persona === "company"
            ? {
                id: "campaign",
                title: "Ekosistem kampanyası yayınla",
                reason: "Perks’te inner·only ayrıcalık oluştur (1 Pass).",
                href: "/panel/perks",
              }
            : {
                id: "stage",
                title: "Stage’e ürün koy",
                reason: "Haftalık vitrinde görünürlük kazan.",
                href: "/panel/stage",
              },
      ].slice(0, 3),
      insight:
        pct < 80
          ? `Profilin %${pct}. Tamamlama eşleşmeyi ve canlı oturum keşfini hızlandırır.`
          : `Profilin güçlü (${pct}%). Bir sonraki adım: odana göre bir aksiyon seç.`,
      persona,
    };

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json(fallback);
    }

    const client = getClient();
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `inner·hub üye coach'usun. JSON üret (başka metin yok):
{"actions":[{"id":"string","title":"string","reason":"string","href":"/panel/..."}],"insight":"string","persona":"${persona}"}
En fazla 3 aksiyon. Türkçe. Profil: ${JSON.stringify(profile)}`,
        },
      ],
    });
    const raw = (message.content[0] as { text: string }).text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.json(fallback);
    return res.json(JSON.parse(jsonMatch[0]));
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? "Coach başarısız" });
  }
});

export default router;
