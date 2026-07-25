import { Router } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  faqTable,
  introductionRequestsTable,
  usersTable,
} from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { createNotification } from "./notifications";
import { ensureMatchAndFaqSchema } from "../lib/ensureSchema";

const router = Router();

const FAQ_SEED: { category: string; question: string; answer: string; order: number }[] = [
  {
    category: "Üyelik",
    order: 1,
    question: "inner·hub'a nasıl üye olabilirim?",
    answer:
      "inner·hub davet bazlı bir topluluktur. Mevcut üyelerden referans alarak başvurabilir veya web sitesindeki başvuru formunu doldurabilirsiniz. Başvurular inner·hub ekibi tarafından değerlendirilir.",
  },
  {
    category: "Üyelik",
    order: 2,
    question: "Üyelik ücretli mi?",
    answer:
      "Evet. Kurucu üyeler için özel bir fiyatlandırma söz konusudur. Sonraki dalgalar için standart yıllık üyelik planları mevcuttur. Ayrıntılar için Üyelik sayfasını inceleyebilirsiniz.",
  },
  {
    category: "Üyelik",
    order: 3,
    question: "Üyeliğimi iptal edebilir miyim?",
    answer:
      "Yıllık üyeliğinizi dönem sonunda iptal edebilirsiniz. İptal taleplerini destek ekibimize iletebilirsiniz. Dönem içi iade yapılmamaktadır.",
  },
  {
    category: "Üyelik",
    order: 4,
    question: "Kurumsal koltuk nedir?",
    answer:
      "Bir şirket adına birden fazla çalışanın üyeliği için kurumsal koltuk planları mevcuttur. Bu plan dahilinde ekibinizin tamamı inner·hub ekosisteminden yararlanabilir.",
  },
  {
    category: "Platform",
    order: 5,
    question: "inner·signal nedir?",
    answer:
      "inner·signal, etkileşimlerinizi analiz ederek size özel haftalık temalar, bağlantı önerileri ve ekosistem içgörüleri üreten AI katmanıdır. Profil verileriniz ve platform aktiviteniz temel alınır.",
  },
  {
    category: "Platform",
    order: 6,
    question: "inner·match nasıl çalışır?",
    answer:
      "inner·match, profil bilgilerinizi ve AI analizini kullanarak size uygun co-founder, mentor, yatırımcı veya iş birliği önerileri sunar. Tanıştır talebi sonrası inner ekibi süreci yönetir.",
  },
  {
    category: "Platform",
    order: 7,
    question: "inner·vault'taki belgeler güvende mi?",
    answer:
      "Evet. inner·vault'a yüklenen belgeler yalnızca siz veya seçtiğiniz izin seviyesine göre topluluk üyeleri tarafından görülebilir. Hiçbir içerik dışarıya açık değildir.",
  },
  {
    category: "Platform",
    order: 8,
    question: "inner·id'i nerede kullanabilirim?",
    answer:
      "inner·id rozetini LinkedIn, GitHub ve kişisel sitenize ekleyebilirsiniz. Ayrıca partner platformlar API üzerinden üyeliğinizi doğrulayabilir.",
  },
  {
    category: "Etkinlikler & İçerik",
    order: 9,
    question: "Etkinliklere nasıl kayıt olabilirim?",
    answer:
      "Etkinlikler sayfasından açık etkinlikleri görebilir, doğrudan kayıt olabilirsiniz. Üyeler için etkinlik biletleri genellikle indirimlidir.",
  },
  {
    category: "Etkinlikler & İçerik",
    order: 10,
    question: "Kursları sonradan izleyebilir miyim?",
    answer:
      "Cohort bazlı kurslar belirli bir takvimde ilerler, ancak kayıt olduktan sonra içeriklere dilediğiniz zaman erişebilirsiniz. Canlı oturumlar kaydedilir ve platform üzerinden paylaşılır.",
  },
  {
    category: "Etkinlikler & İçerik",
    order: 11,
    question: "Ben de içerik üretip paylaşabilir miyim?",
    answer:
      "Evet. inner·vault üzerinden belgelerinizi paylaşabilir; workshop teklifi için destek ekibiyle iletişime geçebilirsiniz.",
  },
  {
    category: "Teknik & API",
    order: 12,
    question: "inner·api'ye nasıl erişebilirim?",
    answer:
      "inner·api sayfasından API anahtarınızı görüntüleyebilir, kullanım istatistiklerinizi takip edebilir ve endpoint dokümantasyonuna ulaşabilirsiniz.",
  },
  {
    category: "Teknik & API",
    order: 13,
    question: "API rate limitleri nelerdir?",
    answer:
      "Starter planda saatte 100 istek, Builder planda saatte 1.000 istek, Scale planda saatte 10.000 istek limitiniz vardır. Limitler aşıldığında 429 döner.",
  },
  {
    category: "Teknik & API",
    order: 14,
    question: "Webhook kurulumu nasıl yapılır?",
    answer:
      "inner·api sayfasından Webhooks bölümüne gidin. HTTPS endpoint URL'inizi ekleyin ve dinlemek istediğiniz olayları seçin.",
  },
];

async function ensureFaqSeed() {
  const [row] = await db.select({ id: faqTable.id }).from(faqTable).limit(1);
  if (row) return;
  await db.insert(faqTable).values(FAQ_SEED);
}

// ─── GET /api/faq ────────────────────────────────────────────────────────────
router.get("/faq", requireAuth, async (_req, res) => {
  try {
    await ensureMatchAndFaqSchema();
    await ensureFaqSeed();
    const rows = await db.select().from(faqTable).orderBy(asc(faqTable.order), asc(faqTable.id));

    const byCategory = new Map<string, { question: string; answer: string }[]>();
    for (const r of rows) {
      const cat = r.category || "Genel";
      const list = byCategory.get(cat) ?? [];
      list.push({ question: r.question, answer: r.answer });
      byCategory.set(cat, list);
    }

    res.json({
      categories: [...byCategory.entries()].map(([category, items]) => ({
        category,
        items,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "SSS yüklenemedi" });
  }
});

// ─── POST /api/match/introduce ───────────────────────────────────────────────
router.post("/match/introduce", requireAuth, async (req, res) => {
  try {
    await ensureMatchAndFaqSchema();
    const userId = req.user!.id;
    const targetName = typeof req.body?.targetName === "string" ? req.body.targetName.trim() : "";
    const targetCompany =
      typeof req.body?.targetCompany === "string" ? req.body.targetCompany.trim().slice(0, 120) : "";
    const matchType = typeof req.body?.matchType === "string" ? req.body.matchType.trim().slice(0, 60) : "";
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 500) : "";
    const score = Number.isFinite(Number(req.body?.score)) ? Math.round(Number(req.body.score)) : null;

    if (!targetName || targetName.length > 120) {
      res.status(400).json({ error: "Geçersiz eşleşme hedefi" });
      return;
    }

    const [existing] = await db
      .select()
      .from(introductionRequestsTable)
      .where(
        and(
          eq(introductionRequestsTable.fromUserId, userId),
          eq(introductionRequestsTable.targetName, targetName),
          eq(introductionRequestsTable.status, "pending"),
        ),
      )
      .limit(1);

    if (existing) {
      res.json({
        request: {
          id: existing.id,
          targetName: existing.targetName,
          status: existing.status,
          createdAt: existing.createdAt.toISOString(),
        },
        alreadyRequested: true,
      });
      return;
    }

    const [inserted] = await db
      .insert(introductionRequestsTable)
      .values({
        fromUserId: userId,
        targetName,
        targetCompany: targetCompany || null,
        matchType: matchType || null,
        reason: reason || null,
        score,
        status: "pending",
      })
      .returning();

    await createNotification({
      userId,
      title: "Tanışma talebin alındı",
      body: `${targetName} için talebin inner ekibine iletildi. Kısa sürede dönüş yapılır.`,
      kind: "match",
    });

    const admins = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"));
    const fromName = req.user!.name || req.user!.email;
    await Promise.all(
      admins.map((a) =>
        createNotification({
          userId: a.id,
          title: "Yeni tanışma talebi",
          body: `${fromName}, ${targetName}${matchType ? ` (${matchType})` : ""} ile tanışmak istiyor.`,
          kind: "request",
        }),
      ),
    );

    res.status(201).json({
      request: {
        id: inserted.id,
        targetName: inserted.targetName,
        status: inserted.status,
        createdAt: inserted.createdAt.toISOString(),
      },
      alreadyRequested: false,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Talep gönderilemedi" });
  }
});

// ─── GET /api/match/introductions ────────────────────────────────────────────
router.get("/match/introductions", requireAuth, async (req, res) => {
  try {
    await ensureMatchAndFaqSchema();
    const rows = await db
      .select()
      .from(introductionRequestsTable)
      .where(eq(introductionRequestsTable.fromUserId, req.user!.id));
    res.json({
      introductions: rows.map((r) => ({
        id: r.id,
        targetName: r.targetName,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Talepler yüklenemedi" });
  }
});

export default router;
