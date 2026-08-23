import { Router } from "express";
import { and, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  talentApplicationsTable,
  talentPostsTable,
  usersTable,
} from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { ensureTalentSchema, ensureUserMembershipColumns } from "../lib/ensureSchema";
import { isTestOrSystemAccount } from "../lib/directoryMembers";

const router = Router();

const APP_STATUSES = new Set(["pending", "shortlisted", "hired", "rejected"]);

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
  extras?: {
    applicationCount?: number;
    myApplication?: {
      id: number;
      status: string;
      invoiceRef: string | null;
      createdAt: string;
    } | null;
    applications?: Array<{
      id: number;
      status: string;
      message: string | null;
      invoiceRef: string | null;
      createdAt: string;
      applicant: { id: number; name: string; initials: string; company: string | null; handle: string | null };
    }>;
  },
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
    imageUrl: post.imageUrl ?? null,
    company: post.company ?? null,
    location: post.location ?? null,
    employmentType: post.employmentType ?? null,
    link: post.link ?? null,
    status: post.status ?? "open",
    postedAt: relativeTr(post.createdAt),
    createdAt: post.createdAt.toISOString(),
    mine,
    applicationCount: extras?.applicationCount ?? 0,
    myApplication: extras?.myApplication ?? null,
    applications: extras?.applications,
  };
}

async function ensureTalentSeed(fallbackUserId: number) {
  const [row] = await db.select({ id: talentPostsTable.id }).from(talentPostsTable).limit(1);
  if (row) return;

  const candidates = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      isSystem: usersTable.isSystem,
    })
    .from(usersTable)
    .limit(40);
  const owner =
    candidates.find((u) => !isTestOrSystemAccount(u))?.id ?? fallbackUserId;

  await db.insert(talentPostsTable).values([
    {
      userId: owner,
      postType: "arıyor",
      role: "Fullstack Developer (React + Node.js)",
      description:
        "Ürünü şekillendirmeye katkı sağlayacak fullstack developer arıyoruz. Remote, equity var.",
      tags: JSON.stringify(["React", "Node.js", "Remote", "Equity"]),
      status: "open",
    },
    {
      userId: owner,
      postType: "arıyor",
      role: "AI/ML Engineer (Part-time)",
      description:
        "Yan proje için haftalık 10-15 saat çalışabilecek ML mühendisi. LLM fine-tuning deneyimi şart.",
      tags: JSON.stringify(["AI", "LLM", "Part-time"]),
      status: "open",
    },
    {
      userId: owner,
      postType: "sunuyor",
      role: "CTO Danışmanlığı — Erken Aşama Startuplar",
      description:
        "Pre-seed ve seed aşamasındaki girişimlere teknik liderlik ve mühendislik ekibi kurulumu konusunda destek.",
      tags: JSON.stringify(["CTO", "Danışmanlık", "Teknik"]),
      status: "open",
    },
    {
      userId: owner,
      postType: "sunuyor",
      role: "Startup Hukuk Danışmanlığı",
      description:
        "Kuruluş sözleşmeleri, SAFE/KISS notları, yatırımcı süreçlerinde inner·hub üyelerine %20 indirim.",
      tags: JSON.stringify(["Hukuk", "SAFE", "Yatırım"]),
      status: "open",
    },
    {
      userId: owner,
      postType: "arıyor",
      role: "Co-founder (Sales & Marketing)",
      description:
        "Yan proje için satış ve pazarlamaya odaklanacak co-founder arıyoruz. B2B SaaS deneyimi artı.",
      tags: JSON.stringify(["Co-founder", "B2B", "Satış"]),
      status: "open",
    },
  ]);
}

async function hasAnyHiredInvoice(): Promise<boolean> {
  const [row] = await db
    .select({ id: talentApplicationsTable.id })
    .from(talentApplicationsTable)
    .where(
      and(
        eq(talentApplicationsTable.status, "hired"),
        isNotNull(talentApplicationsTable.invoiceRef),
        sql`${talentApplicationsTable.invoiceRef} <> ''`,
      ),
    )
    .limit(1);
  return Boolean(row);
}

// ─── GET /api/talent ─────────────────────────────────────────────────────────
router.get("/talent", requireAuth, async (req, res) => {
  try {
    await ensureTalentSchema();
    await ensureUserMembershipColumns();
    const userId = req.user!.id;
    const isAdmin = req.user!.role === "admin";
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
        email: usersTable.email,
        isSystem: usersTable.isSystem,
      })
      .from(talentPostsTable)
      .innerJoin(usersTable, eq(talentPostsTable.userId, usersTable.id))
      .orderBy(desc(talentPostsTable.createdAt));

    const visible = rows.filter(
      ({ email, name, isSystem }) =>
        !isTestOrSystemAccount({ email, name, isSystem }),
    );

    const postIds = visible.map(({ post }) => post.id);
    const apps =
      postIds.length === 0
        ? []
        : await db
            .select({
              app: talentApplicationsTable,
              applicantName: usersTable.name,
              applicantCompany: usersTable.company,
              applicantHandle: usersTable.handle,
            })
            .from(talentApplicationsTable)
            .innerJoin(usersTable, eq(talentApplicationsTable.userId, usersTable.id))
            .where(inArray(talentApplicationsTable.postId, postIds))
            .orderBy(desc(talentApplicationsTable.createdAt));

    const byPost = new Map<number, typeof apps>();
    for (const row of apps) {
      const list = byPost.get(row.app.postId) ?? [];
      list.push(row);
      byPost.set(row.app.postId, list);
    }

    const posts = visible.map(({ post, name, company, handle }) => {
      const mine = post.userId === userId;
      const list = byPost.get(post.id) ?? [];
      const myApp = list.find((a) => a.app.userId === userId);
      const extras: Parameters<typeof mapPost>[3] = {
        applicationCount: list.length,
        myApplication: myApp
          ? {
              id: myApp.app.id,
              status: myApp.app.status,
              invoiceRef: myApp.app.invoiceRef,
              createdAt: myApp.app.createdAt.toISOString(),
            }
          : null,
      };
      if (mine || isAdmin) {
        extras.applications = list.map(({ app, applicantName, applicantCompany, applicantHandle }) => ({
          id: app.id,
          status: app.status,
          message: app.message,
          invoiceRef: app.invoiceRef,
          createdAt: app.createdAt.toISOString(),
          applicant: {
            id: app.userId,
            name: applicantName,
            initials: initialsOf(applicantName),
            company: applicantCompany,
            handle: applicantHandle,
          },
        }));
      }
      return mapPost(post, { name, company, handle }, mine, extras);
    });

    res.json({
      posts,
      /** Komisyon metni yalnızca hire + fatura kaydı varsa */
      commissionVisible: await hasAnyHiredInvoice(),
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
    const imageUrl =
      typeof req.body?.imageUrl === "string" && req.body.imageUrl.trim()
        ? req.body.imageUrl.trim()
        : null;
    const company =
      typeof req.body?.company === "string" && req.body.company.trim()
        ? req.body.company.trim().slice(0, 120)
        : null;
    const location =
      typeof req.body?.location === "string" && req.body.location.trim()
        ? req.body.location.trim().slice(0, 120)
        : null;
    const employmentType =
      typeof req.body?.employmentType === "string" &&
      ["full_time", "part_time", "contract", "internship"].includes(req.body.employmentType)
        ? req.body.employmentType
        : null;
    const link =
      typeof req.body?.link === "string" && req.body.link.trim()
        ? req.body.link.trim().slice(0, 500)
        : null;

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
        imageUrl,
        company,
        location,
        employmentType,
        link,
        status: "open",
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
        { applicationCount: 0, myApplication: null, applications: [] },
      ),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "İlan oluşturulamadı" });
  }
});

// ─── POST /api/talent/:id/apply ──────────────────────────────────────────────
router.post("/talent/:id/apply", requireAuth, async (req, res) => {
  try {
    await ensureTalentSchema();
    const postId = Number(req.params.id);
    if (!Number.isFinite(postId)) {
      res.status(400).json({ error: "Geçersiz id" });
      return;
    }

    const [post] = await db
      .select()
      .from(talentPostsTable)
      .where(eq(talentPostsTable.id, postId))
      .limit(1);
    if (!post) {
      res.status(404).json({ error: "İlan bulunamadı" });
      return;
    }
    if (post.userId === req.user!.id) {
      res.status(400).json({ error: "Kendi ilanınıza başvuramazsınız" });
      return;
    }
    if (post.status && post.status !== "open") {
      res.status(400).json({ error: "Bu ilan başvuruya kapalı" });
      return;
    }

    const message =
      typeof req.body?.message === "string" ? req.body.message.trim().slice(0, 800) : null;

    const [existing] = await db
      .select({ id: talentApplicationsTable.id })
      .from(talentApplicationsTable)
      .where(
        and(
          eq(talentApplicationsTable.postId, postId),
          eq(talentApplicationsTable.userId, req.user!.id),
        ),
      )
      .limit(1);
    if (existing) {
      res.status(409).json({ error: "Bu ilana zaten başvurdunuz" });
      return;
    }

    const [inserted] = await db
      .insert(talentApplicationsTable)
      .values({
        postId,
        userId: req.user!.id,
        message: message || null,
        status: "pending",
      })
      .returning();

    res.status(201).json({
      application: {
        id: inserted.id,
        status: inserted.status,
        message: inserted.message,
        invoiceRef: inserted.invoiceRef,
        createdAt: inserted.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Başvuru kaydedilemedi" });
  }
});

// ─── PATCH /api/talent/applications/:id ──────────────────────────────────────
router.patch("/talent/applications/:id", requireAuth, async (req, res) => {
  try {
    await ensureTalentSchema();
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Geçersiz id" });
      return;
    }

    const statusRaw = typeof req.body?.status === "string" ? req.body.status.trim() : "";
    if (!APP_STATUSES.has(statusRaw) || statusRaw === "pending") {
      res.status(400).json({ error: "status shortlisted, hired veya rejected olmalı" });
      return;
    }

    const [app] = await db
      .select()
      .from(talentApplicationsTable)
      .where(eq(talentApplicationsTable.id, id))
      .limit(1);
    if (!app) {
      res.status(404).json({ error: "Başvuru bulunamadı" });
      return;
    }

    const [post] = await db
      .select()
      .from(talentPostsTable)
      .where(eq(talentPostsTable.id, app.postId))
      .limit(1);
    if (!post) {
      res.status(404).json({ error: "İlan bulunamadı" });
      return;
    }

    const isAuthor = post.userId === req.user!.id;
    const isAdmin = req.user!.role === "admin";
    if (!isAuthor && !isAdmin) {
      res.status(403).json({ error: "Bu başvuruyu güncelleyemezsiniz" });
      return;
    }

    const invoiceRef =
      typeof req.body?.invoiceRef === "string"
        ? req.body.invoiceRef.trim().slice(0, 120) || null
        : undefined;

    const patch: Partial<typeof talentApplicationsTable.$inferInsert> = {
      status: statusRaw,
      updatedAt: new Date(),
    };
    if (statusRaw === "hired" && invoiceRef !== undefined) {
      patch.invoiceRef = invoiceRef;
    }
    if (statusRaw !== "hired") {
      patch.invoiceRef = null;
    }

    const [updated] = await db
      .update(talentApplicationsTable)
      .set(patch)
      .where(eq(talentApplicationsTable.id, id))
      .returning();

    if (statusRaw === "hired") {
      await db
        .update(talentPostsTable)
        .set({ status: "filled" })
        .where(eq(talentPostsTable.id, post.id));
    }

    res.json({
      application: {
        id: updated.id,
        status: updated.status,
        message: updated.message,
        invoiceRef: updated.invoiceRef,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
      commissionVisible: await hasAnyHiredInvoice(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Başvuru güncellenemedi" });
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

    await db.delete(talentApplicationsTable).where(eq(talentApplicationsTable.postId, id));
    await db.delete(talentPostsTable).where(eq(talentPostsTable.id, id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "İlan silinemedi" });
  }
});

export default router;
