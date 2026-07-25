import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { talentPostsTable, usersTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { ensureTalentSchema } from "../lib/ensureSchema";

const router = Router();

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((t) => typeof t === "string").slice(0, 12);
  } catch {
    /* fallthrough */
  }
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function relativeTr(d: Date): string {
  const days = Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
  if (days === 0) return "bugün";
  if (days === 1) return "1 gün önce";
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 hafta önce";
  if (weeks < 5) return `${weeks} hafta önce`;
  const months = Math.floor(days / 30);
  if (months <= 1) return "1 ay önce";
  return `${months} ay önce`;
}

function mapPost(
  post: typeof talentPostsTable.$inferSelect,
  user: { name: string; company: string | null; handle: string | null },
  mine: boolean,
) {
  return {
    id: post.id,
    postedBy: user.name,
    postedByInitials: initialsOf(user.name),
    postedByCompany: user.company || "—",
    postedByHandle: user.handle,
    type: post.postType as "arıyor" | "sunuyor",
    role: post.role,
    description: post.description,
    tags: parseTags(post.tags),
    postedAt: relativeTr(post.createdAt),
    createdAt: post.createdAt.toISOString(),
    mine,
  };
}

async function ensureTalentSeed(adminUserId: number) {
  const [row] = await db.select({ id: talentPostsTable.id }).from(talentPostsTable).limit(1);
  if (row) return;

  await db.insert(talentPostsTable).values([
    {
      userId: adminUserId,
      postType: "arıyor",
      role: "Fullstack Developer (React + Node.js)",
      description:
        "Ürünü şekillendirmeye katkı sağlayacak fullstack developer arıyoruz. Remote, equity var.",
      tags: JSON.stringify(["React", "Node.js", "Remote", "Equity"]),
    },
    {
      userId: adminUserId,
      postType: "arıyor",
      role: "AI/ML Engineer (Part-time)",
      description:
        "Yan proje için haftalık 10-15 saat çalışabilecek ML mühendisi. LLM fine-tuning deneyimi şart.",
      tags: JSON.stringify(["AI", "LLM", "Part-time"]),
    },
    {
      userId: adminUserId,
      postType: "sunuyor",
      role: "CTO Danışmanlığı — Erken Aşama Startuplar",
      description:
        "Pre-seed ve seed aşamasındaki girişimlere teknik liderlik ve mühendislik ekibi kurulumu konusunda destek.",
      tags: JSON.stringify(["CTO", "Danışmanlık", "Teknik"]),
    },
    {
      userId: adminUserId,
      postType: "sunuyor",
      role: "Startup Hukuk Danışmanlığı",
      description:
        "Kuruluş sözleşmeleri, SAFE/KISS notları, yatırımcı süreçlerinde inner·hub üyelerine %20 indirim.",
      tags: JSON.stringify(["Hukuk", "SAFE", "Yatırım"]),
    },
    {
      userId: adminUserId,
      postType: "arıyor",
      role: "Co-founder (Sales & Marketing)",
      description:
        "Yan proje için satış ve pazarlamaya odaklanacak co-founder arıyoruz. B2B SaaS deneyimi artı.",
      tags: JSON.stringify(["Co-founder", "B2B", "Satış"]),
    },
  ]);
}

// ─── GET /api/talent ─────────────────────────────────────────────────────────
router.get("/talent", requireAuth, async (req, res) => {
  try {
    await ensureTalentSchema();
    const userId = req.user!.id;
    const [admin] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"))
      .limit(1);
    await ensureTalentSeed(admin?.id ?? userId);

    const rows = await db
      .select({
        post: talentPostsTable,
        name: usersTable.name,
        company: usersTable.company,
        handle: usersTable.handle,
      })
      .from(talentPostsTable)
      .innerJoin(usersTable, eq(talentPostsTable.userId, usersTable.id))
      .orderBy(desc(talentPostsTable.createdAt));

    res.json({
      posts: rows.map(({ post, name, company, handle }) =>
        mapPost(post, { name, company, handle }, post.userId === userId),
      ),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Talent board yüklenemedi" });
  }
});

// ─── POST /api/talent ────────────────────────────────────────────────────────
router.post("/talent", requireAuth, async (req, res) => {
  try {
    await ensureTalentSchema();
    const userId = req.user!.id;
    const postType =
      req.body?.type === "sunuyor" || req.body?.type === "arıyor" ? req.body.type : null;
    const role = typeof req.body?.role === "string" ? req.body.role.trim().slice(0, 160) : "";
    const description =
      typeof req.body?.description === "string" ? req.body.description.trim().slice(0, 1200) : "";
    const tags = Array.isArray(req.body?.tags)
      ? req.body.tags.filter((t: unknown) => typeof t === "string").slice(0, 12)
      : [];

    if (!postType) {
      res.status(400).json({ error: "Tür arıyor veya sunuyor olmalı" });
      return;
    }
    if (!role || !description) {
      res.status(400).json({ error: "Rol ve açıklama zorunlu" });
      return;
    }

    const [inserted] = await db
      .insert(talentPostsTable)
      .values({
        userId,
        postType,
        role,
        description,
        tags: JSON.stringify(tags),
      })
      .returning();

    const [user] = await db
      .select({ name: usersTable.name, company: usersTable.company, handle: usersTable.handle })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    res.status(201).json({
      post: mapPost(
        inserted,
        {
          name: user?.name ?? req.user!.name,
          company: user?.company ?? null,
          handle: user?.handle ?? null,
        },
        true,
      ),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "İlan oluşturulamadı" });
  }
});

// ─── DELETE /api/talent/:id ──────────────────────────────────────────────────
router.delete("/talent/:id", requireAuth, async (req, res) => {
  try {
    await ensureTalentSchema();
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Geçersiz id" });
      return;
    }

    const [post] = await db
      .select()
      .from(talentPostsTable)
      .where(eq(talentPostsTable.id, id))
      .limit(1);
    if (!post) {
      res.status(404).json({ error: "İlan bulunamadı" });
      return;
    }
    if (post.userId !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ error: "Bu ilanı silemezsiniz" });
      return;
    }

    await db.delete(talentPostsTable).where(eq(talentPostsTable.id, id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "İlan silinemedi" });
  }
});

export default router;
