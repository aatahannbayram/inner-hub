import { Router } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { applicationsTable, invitationRequestsTable } from "@workspace/db/schema";
import { requireAdmin } from "../lib/auth";
import {
  notifyApplicantInvitationApproved,
  notifyApplicantInvitationRejected,
  roleLabelOf,
} from "../lib/mail";
import {
  issueInviteCodeForApproval,
  revokeUnusedInviteCodes,
} from "../lib/inviteCodes";
import { once } from "../lib/ensureSchema";

const router = Router();

type UiStatus = "beklemede" | "onaylandı" | "reddedildi";

function toUiStatus(status: "pending" | "approved" | "rejected" | null | undefined): UiStatus {
  if (status === "approved") return "onaylandı";
  if (status === "rejected") return "reddedildi";
  return "beklemede";
}

function toDbStatus(status: string): "pending" | "approved" | "rejected" | null {
  if (status === "onaylandı" || status === "approved") return "approved";
  if (status === "reddedildi" || status === "rejected") return "rejected";
  if (status === "beklemede" || status === "pending") return "pending";
  return null;
}

/** Onay/red mailini gönderir (approve/reject anında ve manuel "tekrar gönder" için ortak). */
async function sendDecisionMail(params: {
  invite: { name: string; email: string; role: string | null };
  invitationRequestId: number;
  applicationId?: number | null;
  next: "approved" | "rejected";
}): Promise<{ ok: boolean; error?: string }> {
  const applicant = {
    name: params.invite.name,
    email: params.invite.email,
    roleLabel: roleLabelOf(params.invite.role),
  };
  if (params.next === "approved") {
    try {
      const inviteCode = await issueInviteCodeForApproval({
        email: params.invite.email,
        invitationRequestId: params.invitationRequestId,
        applicationId: params.applicationId,
      });
      return await notifyApplicantInvitationApproved({ ...applicant, inviteCode });
    } catch (err: any) {
      console.error("invite code issue failed", err);
      return await notifyApplicantInvitationApproved(applicant);
    }
  }
  void revokeUnusedInviteCodes(params.invitationRequestId);
  return await notifyApplicantInvitationRejected(applicant);
}

/** Eski DB'lerde role/linkedin/org kolonlarını ekle (idempotent). */
const ensureInvitationColumns = once(async () => {
  await db.execute(sql`ALTER TABLE invitation_requests ADD COLUMN IF NOT EXISTS role text`);
  await db.execute(sql`ALTER TABLE invitation_requests ADD COLUMN IF NOT EXISTS linkedin text`);
  await db.execute(sql`ALTER TABLE invitation_requests ADD COLUMN IF NOT EXISTS organization text`);
  await db.execute(sql`ALTER TABLE invitation_requests ADD COLUMN IF NOT EXISTS organization_domain text`);
  await db.execute(sql`ALTER TABLE invitation_requests ADD COLUMN IF NOT EXISTS organization_logo text`);
});

/** Dev'de boş inbox olmasın diye birkaç örnek başvuru. Prod'da dokunulmaz. */
async function ensureDemoInvites() {
  if (process.env.NODE_ENV === "production") return;
  const [row] = await db.select({ id: invitationRequestsTable.id }).from(invitationRequestsTable).limit(1);
  if (row) return;

  await db.insert(invitationRequestsTable).values([
    {
      name: "Alara Demir",
      email: "alara@techstart.io",
      role: "CEO",
      linkedin: "linkedin.com/in/alarademir",
      whoYouAre:
        "AI ve topluluk kesişiminde çalışıyorum. inner·hub kurucularıyla fikir paylaşmak istiyorum.",
      whoIntroduced: "Ata Han Bayram",
      link: null,
      ipAddress: "127.0.0.1",
    },
    {
      name: "Baran Şahin",
      email: "baran@buildco.io",
      role: "CTO",
      linkedin: "linkedin.com/in/baransahin",
      whoYouAre: "Teknik kurucular için kaliteli bir topluluk arıyorum.",
      whoIntroduced: null,
      link: null,
      ipAddress: "127.0.0.1",
    },
  ]);
}

// ─── GET /api/applications ────────────────────────────────────────────────────
router.get("/applications", requireAdmin, async (_req, res) => {
  try {
    await ensureInvitationColumns();
    await ensureDemoInvites();

    const requests = await db
      .select()
      .from(invitationRequestsTable)
      .orderBy(desc(invitationRequestsTable.createdAt));

    const reviews = await db.select().from(applicationsTable);
    const byInvite = new Map(
      reviews
        .filter((r) => r.invitationRequestId != null)
        .map((r) => [r.invitationRequestId!, r]),
    );

    res.json({
      applications: requests.map((r) => {
        const review = byInvite.get(r.id);
        const roleRaw = r.role ?? "—";
        const roleLabel =
          roleRaw === "operator" || roleRaw === "builder"
            ? "Builder"
            : roleRaw === "investor"
              ? "Yatırımcı"
              : roleRaw === "founder"
                ? "Girişimci"
                : roleRaw === "company"
                  ? "Şirket"
                  : roleRaw;
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          role: roleLabel,
          company: r.organization ?? "",
          companyLogo: r.organizationLogo ?? "",
          companyDomain: r.organizationDomain ?? "",
          why: r.whoYouAre,
          referrer: r.whoIntroduced,
          appliedAt: r.createdAt.toISOString().slice(0, 10),
          status: toUiStatus(review?.status ?? "pending"),
          linkedinUrl: r.linkedin ?? "",
          tags: r.role ? [roleLabel] : [],
          reviewNote: review?.reviewNote ?? null,
        };
      }),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Başvurular yüklenemedi" });
  }
});

// ─── PATCH /api/applications/:id ──────────────────────────────────────────────
// :id = invitation_requests.id
router.patch("/applications/:id", requireAdmin, async (req, res) => {
  try {
    const invitationRequestId = Number(req.params.id);
    if (!Number.isFinite(invitationRequestId)) {
      res.status(400).json({ error: "Geçersiz id" });
      return;
    }

    const next = toDbStatus(String(req.body?.status ?? ""));
    if (!next) {
      res.status(400).json({ error: "Geçersiz status" });
      return;
    }

    const [invite] = await db
      .select()
      .from(invitationRequestsTable)
      .where(eq(invitationRequestsTable.id, invitationRequestId))
      .limit(1);

    if (!invite) {
      res.status(404).json({ error: "Başvuru bulunamadı" });
      return;
    }

    const [existing] = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.invitationRequestId, invitationRequestId))
      .limit(1);

    const prevStatus = existing?.status ?? "pending";
    const reviewedAt = next === "pending" ? null : new Date();

    let applicationId = existing?.id;
    if (existing) {
      await db
        .update(applicationsTable)
        .set({ status: next, reviewedAt })
        .where(eq(applicationsTable.id, existing.id));
    } else {
      const [created] = await db
        .insert(applicationsTable)
        .values({
          invitationRequestId,
          status: next,
          reviewedAt,
          term: 1,
        })
        .returning({ id: applicationsTable.id });
      applicationId = created?.id;
    }

    // Otomasyon: yalnızca gerçek durum değişiminde başvuran maili
    if (prevStatus !== next && (next === "approved" || next === "rejected")) {
      void sendDecisionMail({ invite, invitationRequestId, applicationId, next });
    }

    res.json({ id: invitationRequestId, status: toUiStatus(next) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Durum güncellenemedi" });
  }
});

// ─── POST /api/applications/:id/resend ────────────────────────────────────────
// Onaylanmış/reddedilmiş bir başvuru için mail'i durumu değiştirmeden tekrar gönderir
// (spam'e düşme gibi teslimat sorunlarında admin'in elle tetiklemesi için).
router.post("/applications/:id/resend", requireAdmin, async (req, res) => {
  try {
    const invitationRequestId = Number(req.params.id);
    if (!Number.isFinite(invitationRequestId)) {
      res.status(400).json({ error: "Geçersiz id" });
      return;
    }

    const [invite] = await db
      .select()
      .from(invitationRequestsTable)
      .where(eq(invitationRequestsTable.id, invitationRequestId))
      .limit(1);
    if (!invite) {
      res.status(404).json({ error: "Başvuru bulunamadı" });
      return;
    }

    const [existing] = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.invitationRequestId, invitationRequestId))
      .limit(1);

    if (existing?.status !== "approved" && existing?.status !== "rejected") {
      res.status(400).json({ error: "Yalnızca onaylanmış veya reddedilmiş başvurular için mail tekrar gönderilebilir" });
      return;
    }

    const result = await sendDecisionMail({
      invite,
      invitationRequestId,
      applicationId: existing.id,
      next: existing.status,
    });
    res.json({ sent: result.ok, error: result.error });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Mail gönderilemedi" });
  }
});

export default router;
