import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
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

// ─── Topluluk mock verisi (gerçek sistemde DB'den gelir) ──────────────────────
const COMMUNITY_CONTEXT = `
inner·hub topluluğu — İstanbul merkezli, AI odaklı, özel davet ile katılınan kurucu/yatırımcı topluluğu.
34 kurucu üye. Sektörler: B2B SaaS, Fintech, HR Tech, AI/ML, E-ticaret.

Bu haftaki kanal aktivitesi:
- #ai-tools: Claude 4 Opus, Cursor AI, Bolt.new, Runway Gen-3 tartışmaları
- #girisimler: Hipo 50. müşteri milestone, AWS Activate başvuruları
- #genel: Eylül Zirvesi hazırlığı, workshop talebi
- #tavsiyeler: "The Mom Test" kitabı, Acquired podcast

Üyeler:
- Ata Han Bayram (Founder, inner·hub) — Ürün, AI, topluluk
- Zeynep Arslan (Co-founder, Hipo) — B2B SaaS, liderlik, satış
- Mert Demir (AI PM, Insider) — AI, Ürün, Growth
- Ayşe Kaya (HR Tech Lead, Getir) — HR Tech, dijital dönüşüm
- Berk Yılmaz (Angel Investor) — Fintech, SaaS, AI yatırım
- Selin Çelik (CTO, Dopigo) — Teknik liderlik, DevOps
- Ozan Kırmızı (Growth Lead, Pazarama) — E-ticaret, pazarlama
- Deniz Alp (Legal, Alp Hukuk) — Startup hukuku, yatırım
`;

// ─── POST /api/ai/signal ─────────────────────────────────────────────────────
// Haftanın sinyallerini ve bağlantı önerilerini üretir
router.post("/signal", async (req, res) => {
  try {
    const client = getClient();
    const { userId } = req.body as { userId?: string };

    const prompt = `Sen inner·hub topluluğunun AI asistanısın. Aşağıdaki topluluk verisini analiz et ve JSON formatında haftalık sinyal raporu üret.

Topluluk verisi:
${COMMUNITY_CONTEXT}

Hedef kullanıcı ID: ${userId ?? "genel"}

Şu JSON yapısında yanıt ver (başka açıklama ekleme):
{
  "weeklyThemes": [
    { "topic": "string", "momentum": "yüksek|orta|düşük", "summary": "2 cümle özet" }
  ],
  "connections": [
    { "name": "string", "reason": "string (neden tanışmalılar — 1 cümle)", "matchScore": 85 }
  ],
  "insight": "string (bu haftanın en önemli topluluik içgörüsü — 1-2 cümle)"
}

weeklyThemes için 3 tema, connections için 2 kişi öneri sun. Türkçe yaz.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { text: string }).text.trim();
    // JSON bloğunu çıkar
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Geçersiz AI yanıtı");

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err: any) {
    const isConfig = err.message?.includes("API_KEY") || err.message?.includes("ortam");
    if (isConfig) {
      // Demo yanıt — API key yokken
      return res.json({
        weeklyThemes: [
          { topic: "Claude 4 & Cursor AI Adoptasyonu", momentum: "yüksek", summary: "Toplulukta Claude 4 Opus ve Cursor kombinasyonu hızla yaygınlaşıyor. Üyeler %40 verim artışı raporluyor." },
          { topic: "Eylül Zirvesi Hazırlığı", momentum: "orta", summary: "AI & Girişimcilik Zirvesi için pitch deck workshop talebi var. 12+ üye katılım niyetinde." },
          { topic: "AWS Activate Başvuruları", momentum: "orta", summary: "Birden fazla üye AWS Activate için başvurmuş durumda. Deneyim paylaşımı bu haftanın gündeminde." },
        ],
        connections: [
          { name: "Berk Yılmaz", reason: "AI yatırımcısı olarak ürün vizyonunuzu değerlendirmeye açık ve Zirve'ye katılacak.", matchScore: 91 },
          { name: "Mert Demir", reason: "AI ürün geliştirme sürecinizde Insider deneyimini paylaşmak istiyor.", matchScore: 87 },
        ],
        insight: "Bu hafta toplulukta AI araç adoptasyonu öne çıkıyor. Deneyimleri sistematik paylaşmak için #ai-tools kanalında haftalık 'Aracın Anatomisi' formatı önerilir.",
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/ai/match ──────────────────────────────────────────────────────
// Kullanıcıya özel eşleşme önerileri üretir
router.post("/match", async (req, res) => {
  try {
    const client = getClient();
    const { userId, preferences } = req.body as {
      userId?: string;
      preferences?: string[];
    };

    const prompt = `Sen inner·hub topluluğunun eşleştirme AI'ısın. Kullanıcı için en uygun topluluk eşleşmelerini bul.

Topluluk verisi:
${COMMUNITY_CONTEXT}

Kullanıcı tercihleri: ${preferences?.join(", ") ?? "belirtilmemiş"}

Şu JSON yapısında yanıt ver (başka açıklama ekleme):
{
  "matches": [
    {
      "name": "string",
      "company": "string",
      "matchType": "Co-founder|Mentor|Yatırımcı|İş birliği",
      "score": 85,
      "why": "string (neden uyumlu — 2 cümle)",
      "commonGround": ["string", "string"]
    }
  ]
}

4 farklı eşleşme öner, farklı matchType'lardan seç. Türkçe yaz.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { text: string }).text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Geçersiz AI yanıtı");

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err: any) {
    const isConfig = err.message?.includes("API_KEY") || err.message?.includes("ortam");
    if (isConfig) {
      return res.json({
        matches: [
          {
            name: "Berk Yılmaz",
            company: "Bağımsız Yatırımcı",
            matchType: "Yatırımcı",
            score: 94,
            why: "AI ve SaaS odaklı portföyüyle tam örtüşüyor. Pre-seed ve seed aşamasında aktif yatırım yapıyor.",
            commonGround: ["AI/ML", "B2B SaaS", "İstanbul ekosistemi"],
          },
          {
            name: "Selin Çelik",
            company: "Dopigo",
            matchType: "Co-founder",
            score: 88,
            why: "Teknik liderlik boşluğunu kapatabilir. Startup ekibi kurma konusunda kanıtlanmış deneyimi var.",
            commonGround: ["Teknik mimari", "Erken ekip inşası", "DevOps"],
          },
          {
            name: "Zeynep Arslan",
            company: "Hipo",
            matchType: "Mentor",
            score: 85,
            why: "B2B SaaS'ta 0'dan 50 müşteriye giden yolda öğrendiklerini paylaşmaya açık.",
            commonGround: ["B2B büyümesi", "Kurucu deneyimi", "İstanbul startup sahnesi"],
          },
          {
            name: "Ozan Kırmızı",
            company: "Pazarama",
            matchType: "İş birliği",
            score: 79,
            why: "E-ticaret kanallarında ortak proje potansiyeli var. Growth hacking konusunda destek sunabilir.",
            commonGround: ["Growth", "Kullanıcı edinimi", "Performans pazarlama"],
          },
        ],
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/ai/image ──────────────────────────────────────────────────────
// Higgsfield text-to-image (kredi-tasarruflu: 720p, 1 görsel, cooldown)
router.post("/image", async (req, res) => {
  try {
    if (!isHiggsfieldConfigured()) {
      return res.status(503).json({
        error: "Higgsfield yapılandırılmadı",
        hint: "HF_API_KEY ve HF_API_SECRET ekleyin",
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

    res.json({
      ...result,
      meta: {
        model: HF_EFFICIENT.modelId,
        resolution: HF_EFFICIENT.resolution,
        aspectRatio: HF_EFFICIENT.aspectRatio,
        creditMode: "efficient",
      },
    });
  } catch (err: any) {
    const isCooldown = String(err.message).includes("Kredi koruması");
    res.status(isCooldown ? 429 : 500).json({ error: err.message });
  }
});

// ─── GET /api/ai/image/:requestId ────────────────────────────────────────────
router.get("/image/:requestId", async (req, res) => {
  try {
    if (!isHiggsfieldConfigured()) {
      return res.status(503).json({
        error: "Higgsfield yapılandırılmadı",
        hint: "HF_API_KEY ve HF_API_SECRET ekleyin",
      });
    }

    const requestId = req.params.requestId;
    if (!requestId) {
      return res.status(400).json({ error: "requestId gerekli" });
    }

    const result = await getGenerationStatus(requestId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
