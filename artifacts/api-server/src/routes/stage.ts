import { Router } from "express";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { stageProductsTable, stageVotesTable, usersTable } from "@workspace/db/schema";
import { requireAuth, requireAdmin } from "../lib/auth";
import { ensureStageSchema } from "../lib/ensureSchema";
import { fetchLinkPreview } from "../lib/linkPreview";
import {
  fetchGithubSocialPreview,
  fetchLinkedinSocialPreview,
} from "../lib/socialPreview";
import {
  fetchProductHuntPost,
  isPhSyncStale,
  parseProductHuntUrl,
  resolveProductHuntLink,
} from "../lib/productHunt";
import { parseYoutubeId, youtubeThumbnailUrl, youtubeWatchUrl } from "../lib/youtube";

const router = Router();

export type StagePeriod = "week" | "month" | "year" | "all";

function parsePeriod(raw: unknown, fallback: StagePeriod = "week"): StagePeriod {
  const v = String(raw ?? "").toLowerCase();
  if (v === "week" || v === "month" || v === "year" || v === "all") return v;
  return fallback;
}

function periodStart(period: StagePeriod): Date | null {
  if (period === "all") return null;
  const now = Date.now();
  if (period === "week") return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (period === "month") return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return new Date(now - 365 * 24 * 60 * 60 * 1000);
}

function parseTags(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  const s = raw.trim();
  if (s.startsWith("[")) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 8);
      }
    } catch {
      /* fall through */
    }
  }
  return s
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function serializeTags(tags: string[]): string | null {
  if (!tags.length) return null;
  return JSON.stringify(tags);
}

function normalizeOptionalHttpUrl(raw: string | undefined | null, max = 500): string | null {
  const u = (raw ?? "").trim();
  if (!u) return null;
  if (u.length > max) return null;
  try {
    const withProto = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    const parsed = new URL(withProto);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function mapProduct(
  product: typeof stageProductsTable.$inferSelect,
  voteCount: number,
  myVote: boolean,
  author?: { name: string; handle: string | null } | null,
) {
  const ytId = product.youtubeUrl ? parseYoutubeId(product.youtubeUrl) : null;
  return {
    id: product.id,
    title: product.title,
    url: product.url,
    pitch: product.pitch,
    status: product.status,
    featured: product.featured,
    imageUrl: product.imageUrl,
    productHuntUrl: product.productHuntUrl ?? null,
    productHuntId: product.productHuntId ?? null,
    phVotesCount: product.phVotesCount ?? null,
    youtubeUrl: product.youtubeUrl ?? null,
    youtubeThumbnail: ytId ? youtubeThumbnailUrl(ytId) : null,
    demoUrl: product.demoUrl ?? null,
    pitchDeckUrl: product.pitchDeckUrl ?? null,
    tags: parseTags(product.tags),
    lookingFor: product.lookingFor ?? null,
    createdAt: product.createdAt.toISOString(),
    userId: product.userId,
    authorName: author?.name ?? null,
    authorHandle: author?.handle ?? null,
    votes: voteCount,
    myVote,
  };
}

/** Stale PH bağları için votesCount yenile (en fazla 5). */
async function refreshStalePhVotes(
  products: (typeof stageProductsTable.$inferSelect)[],
): Promise<Map<number, typeof stageProductsTable.$inferSelect>> {
  const updated = new Map<number, typeof stageProductsTable.$inferSelect>();
  const stale = products
    .filter((p) => p.productHuntUrl && isPhSyncStale(p.phSyncedAt))
    .slice(0, 5);

  await Promise.all(
    stale.map(async (p) => {
      const parsed = parseProductHuntUrl(p.productHuntUrl!);
      if (!parsed) return;
      const post = await fetchProductHuntPost(parsed.slug);
      if (!post) return;
      const [row] = await db
        .update(stageProductsTable)
        .set({
          productHuntId: post.id,
          productHuntUrl: post.url,
          phVotesCount: post.votesCount,
          phSyncedAt: new Date(),
        })
        .where(eq(stageProductsTable.id, p.id))
        .returning();
      if (row) updated.set(row.id, row);
    }),
  );
  return updated;
}

async function loadPeriodProducts(userId: number, period: StagePeriod, opts?: { showcase?: boolean }) {
  const start = periodStart(period);

  const voteJoin =
    start != null
      ? and(eq(stageVotesTable.productId, stageProductsTable.id), gte(stageVotesTable.createdAt, start))
      : eq(stageVotesTable.productId, stageProductsTable.id);

  const products = await db
    .select({
      product: stageProductsTable,
      authorName: usersTable.name,
      authorHandle: usersTable.handle,
      votes: sql<number>`coalesce(count(${stageVotesTable.id}), 0)::int`,
    })
    .from(stageProductsTable)
    .leftJoin(usersTable, eq(usersTable.id, stageProductsTable.userId))
    .leftJoin(stageVotesTable, voteJoin)
    .where(eq(stageProductsTable.status, "published"))
    .groupBy(stageProductsTable.id, usersTable.name, usersTable.handle)
    .orderBy(
      desc(stageProductsTable.featured),
      sql`coalesce(count(${stageVotesTable.id}), 0) desc`,
      desc(stageProductsTable.createdAt),
    );

  let rows = products;

  if (opts?.showcase) {
    rows = products
      .filter((row) => row.product.featured || Number(row.votes) > 0)
      .slice(0, 20);
  }

  const phUpdates = await refreshStalePhVotes(rows.map((r) => r.product));
  rows = rows.map((row) => ({
    ...row,
    product: phUpdates.get(row.product.id) ?? row.product,
  }));

  const myVotes = await db
    .select({ productId: stageVotesTable.productId })
    .from(stageVotesTable)
    .where(eq(stageVotesTable.userId, userId));
  const myVoteSet = new Set(myVotes.map((v) => v.productId));

  const mapped = rows.map((row) =>
    mapProduct(
      row.product,
      Number(row.votes) || 0,
      myVoteSet.has(row.product.id),
      { name: row.authorName ?? "", handle: row.authorHandle },
    ),
  );

  const totalVotes = mapped.reduce((sum, p) => sum + p.votes, 0);
  const productsWithVotes = mapped.filter((p) => p.votes > 0).length;

  return {
    products: mapped,
    stats: {
      products: period === "all" ? mapped.length : productsWithVotes,
      votes: totalVotes,
      showcase: mapped.filter((p) => p.featured || p.votes > 0).length,
    },
    period,
  };
}

/** GET /api/stage/link-preview?url=... — ürün formunda URL girilince başlık/açıklama/görsel öner. */
router.get("/stage/link-preview", requireAuth, async (req, res) => {
  const url = String(req.query.url ?? "").trim();
  if (!url) {
    res.status(400).json({ error: "url zorunlu" });
    return;
  }
  try {
    const preview = await fetchLinkPreview(url);
    res.json(preview);
  } catch (err: any) {
    res.status(422).json({ error: err.message ?? "Önizleme alınamadı" });
  }
});

/** GET /api/social-preview?network=linkedin|github&handle=... */
router.get("/social-preview", requireAuth, async (req, res) => {
  const network = String(req.query.network ?? "").toLowerCase();
  const handle = String(req.query.handle ?? "").trim();
  if (!handle) {
    res.status(400).json({ error: "handle zorunlu" });
    return;
  }
  try {
    if (network === "github") {
      const preview = await fetchGithubSocialPreview(handle);
      if (!preview) {
        res.status(404).json({ error: "GitHub kullanıcısı bulunamadı" });
        return;
      }
      res.json(preview);
      return;
    }
    if (network === "linkedin") {
      const preview = await fetchLinkedinSocialPreview(handle);
      if (!preview) {
        res.status(404).json({ error: "LinkedIn profili bulunamadı" });
        return;
      }
      res.json(preview);
      return;
    }
    res.status(400).json({ error: "network linkedin veya github olmalı" });
  } catch (err: any) {
    res.status(422).json({ error: err.message ?? "Önizleme alınamadı" });
  }
});

async function loadPublishedProduct(productId: number, userId: number | null) {
  await ensureStageSchema();
  const [row] = await db
    .select({
      product: stageProductsTable,
      authorName: usersTable.name,
      authorHandle: usersTable.handle,
    })
    .from(stageProductsTable)
    .leftJoin(usersTable, eq(usersTable.id, stageProductsTable.userId))
    .where(and(eq(stageProductsTable.id, productId), eq(stageProductsTable.status, "published")))
    .limit(1);
  if (!row) return null;

  const [voteRow] = await db
    .select({ n: sql<number>`coalesce(count(${stageVotesTable.id}), 0)::int` })
    .from(stageVotesTable)
    .where(eq(stageVotesTable.productId, productId));
  const votes = Number(voteRow?.n) || 0;

  let myVote = false;
  if (userId != null) {
    const [mine] = await db
      .select({ id: stageVotesTable.id })
      .from(stageVotesTable)
      .where(and(eq(stageVotesTable.productId, productId), eq(stageVotesTable.userId, userId)))
      .limit(1);
    myVote = Boolean(mine);
  }

  return mapProduct(row.product, votes, myVote, {
    name: row.authorName ?? "",
    handle: row.authorHandle,
  });
}

/** GET /api/stage/products/:id — tek ürün (overlay / derin link) */
router.get("/stage/products/:id", requireAuth, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) {
      res.status(400).json({ error: "Geçersiz ürün" });
      return;
    }
    const product = await loadPublishedProduct(productId, req.user!.id);
    if (!product) {
      res.status(404).json({ error: "Ürün bulunamadı" });
      return;
    }
    res.json({ product });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Ürün alınamadı" });
  }
});

/** GET /api/public/stage/:id — paylaşılabilir künye (üyelik gerektirmez) */
router.get("/public/stage/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) {
      res.status(400).json({ error: "Geçersiz ürün" });
      return;
    }
    const product = await loadPublishedProduct(productId, null);
    if (!product) {
      res.status(404).json({ error: "Ürün bulunamadı" });
      return;
    }
    const { myVote: _myVote, userId: _userId, status: _status, ...kunye } = product;
    res.json({ product: kunye });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Künye alınamadı" });
  }
});

/** GET /api/stage/products?period=week|month|year|all */
router.get("/stage/products", requireAuth, async (req, res) => {
  try {
    await ensureStageSchema();
    const userId = req.user!.id;
    const period = parsePeriod(req.query.period, "all");
    const data = await loadPeriodProducts(userId, period);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Ürünler yüklenemedi" });
  }
});

/** POST /api/stage/products — üye ürün gönderimi */
router.post("/stage/products", requireAuth, async (req, res) => {
  try {
    await ensureStageSchema();
    const userId = req.user!.id;
    const { title, url, pitch, imageUrl, productHuntUrl, youtubeUrl, demoUrl, pitchDeckUrl, tags, lookingFor } =
      req.body as {
        title?: string;
        url?: string;
        pitch?: string;
        imageUrl?: string;
        productHuntUrl?: string;
        youtubeUrl?: string;
        demoUrl?: string;
        pitchDeckUrl?: string;
        tags?: string | string[];
        lookingFor?: string;
      };

    const t = title?.trim() ?? "";
    const u = url?.trim() ?? "";
    const p = pitch?.trim() ?? "";
    const rawImage = imageUrl?.trim() ?? "";
    // Sürükle-bırak / dosya seçimiyle yüklenen kapak görselleri base64 data
    // URL olarak gelir (avatar yüklemedeki desenle aynı) - ayrı dosya
    // depolama altyapısı gerekmez, doğrudan sütuna yazılır.
    let img = rawImage.startsWith("data:image/")
      ? rawImage.length <= 300_000
        ? rawImage
        : null
      : rawImage.length <= 500 &&
          (rawImage.startsWith("http://") ||
            rawImage.startsWith("https://") ||
            rawImage.startsWith("/api/org-logos/"))
        ? rawImage
        : null;

    if (!t || !u || !p) {
      res.status(400).json({ error: "title, url ve pitch zorunlu" });
      return;
    }
    if (t.length > 120 || p.length > 500) {
      res.status(400).json({ error: "Başlık veya pitch çok uzun" });
      return;
    }

    let ph: Awaited<ReturnType<typeof resolveProductHuntLink>> = null;
    const rawPh = productHuntUrl?.trim() ?? "";
    if (rawPh) {
      ph = await resolveProductHuntLink(rawPh);
      if (!ph) {
        res.status(400).json({ error: "Geçersiz Product Hunt URL" });
        return;
      }
    }

    let ytCanonical: string | null = null;
    const rawYoutube = youtubeUrl?.trim() ?? "";
    if (rawYoutube) {
      const ytId = parseYoutubeId(rawYoutube);
      if (!ytId) {
        res.status(400).json({ error: "Geçersiz YouTube linki" });
        return;
      }
      ytCanonical = youtubeWatchUrl(ytId);
      // Kapak görseli seçilmemişse video kapağını otomatik kullan.
      if (!img) img = youtubeThumbnailUrl(ytId);
    }

    const demo = normalizeOptionalHttpUrl(demoUrl);
    const deck = normalizeOptionalHttpUrl(pitchDeckUrl);
    if (demoUrl?.trim() && !demo) {
      res.status(400).json({ error: "Geçersiz demo linki" });
      return;
    }
    if (pitchDeckUrl?.trim() && !deck) {
      res.status(400).json({ error: "Geçersiz pitch deck linki" });
      return;
    }

    const tagList = Array.isArray(tags)
      ? tags
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 8)
      : parseTags(typeof tags === "string" ? tags : "");
    const looking = (lookingFor ?? "").trim().slice(0, 120) || null;

    const [created] = await db
      .insert(stageProductsTable)
      .values({
        userId,
        title: t,
        url: u,
        pitch: p,
        imageUrl: img,
        status: "published",
        productHuntUrl: ph?.productHuntUrl ?? null,
        productHuntId: ph?.productHuntId ?? null,
        phVotesCount: ph?.phVotesCount ?? null,
        phSyncedAt: ph?.phSyncedAt ?? null,
        youtubeUrl: ytCanonical,
        demoUrl: demo,
        pitchDeckUrl: deck,
        tags: serializeTags(tagList),
        lookingFor: looking,
      })
      .returning();

    res.status(201).json(
      mapProduct(created!, 0, false, {
        name: req.user!.name,
        handle: req.user!.handle,
      }),
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Ürün eklenemedi" });
  }
});

/** POST /api/stage/products/:id/vote — oy aç/kapa (ürün başına tek oy) */
router.post("/stage/products/:id/vote", requireAuth, async (req, res) => {
  try {
    await ensureStageSchema();
    const userId = req.user!.id;
    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) {
      res.status(400).json({ error: "Geçersiz ürün" });
      return;
    }

    const [product] = await db
      .select()
      .from(stageProductsTable)
      .where(and(eq(stageProductsTable.id, productId), eq(stageProductsTable.status, "published")))
      .limit(1);
    if (!product) {
      res.status(404).json({ error: "Ürün bulunamadı" });
      return;
    }

    const [existing] = await db
      .select()
      .from(stageVotesTable)
      .where(and(eq(stageVotesTable.productId, productId), eq(stageVotesTable.userId, userId)))
      .limit(1);

    let myVote: boolean;
    if (existing) {
      await db.delete(stageVotesTable).where(eq(stageVotesTable.id, existing.id));
      myVote = false;
    } else {
      await db.insert(stageVotesTable).values({ productId, userId });
      myVote = true;
    }

    const [agg] = await db
      .select({ n: count() })
      .from(stageVotesTable)
      .where(eq(stageVotesTable.productId, productId));

    res.json({ productId, myVote, votes: Number(agg?.n ?? 0) });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Oy kaydedilemedi" });
  }
});

/** GET /api/stage/showcase?period=week|month|year|all — dönem oylarına göre vitrin */
router.get("/stage/showcase", requireAuth, async (req, res) => {
  try {
    await ensureStageSchema();
    const userId = req.user!.id;
    const period = parsePeriod(req.query.period, "week");
    const data = await loadPeriodProducts(userId, period, { showcase: true });
    // Showcase stats: ürün sayısı dönem oylu + featured sayısı
    res.json({
      ...data,
      stats: {
        products: data.stats.products,
        votes: data.stats.votes,
        showcase: data.products.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Showcase yüklenemedi" });
  }
});

/** PATCH /api/stage/products/:id — admin: vitrine sabitle/kaldır (featured) */
router.patch("/stage/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureStageSchema();
    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) {
      res.status(400).json({ error: "Geçersiz ürün" });
      return;
    }
    const { featured } = req.body as { featured?: boolean };
    if (typeof featured !== "boolean") {
      res.status(400).json({ error: "featured (boolean) zorunlu" });
      return;
    }

    const [updated] = await db
      .update(stageProductsTable)
      .set({ featured })
      .where(eq(stageProductsTable.id, productId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Ürün bulunamadı" });
      return;
    }

    res.json({ id: updated.id, featured: updated.featured });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Güncellenemedi" });
  }
});

/** DELETE /api/stage/products/:id — admin: ürünü kaldır (soft) */
router.delete("/stage/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureStageSchema();
    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) {
      res.status(400).json({ error: "Geçersiz ürün" });
      return;
    }

    const [updated] = await db
      .update(stageProductsTable)
      .set({ status: "hidden" })
      .where(eq(stageProductsTable.id, productId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Ürün bulunamadı" });
      return;
    }

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Kaldırılamadı" });
  }
});

export default router;
