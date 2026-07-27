import { Router } from "express";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { stageProductsTable, stageVotesTable, usersTable } from "@workspace/db/schema";
import { requireAuth } from "../lib/auth";
import { ensureStageSchema } from "../lib/ensureSchema";

const router = Router();

function mapProduct(
  product: typeof stageProductsTable.$inferSelect,
  voteCount: number,
  myVote: boolean,
  author?: { name: string; handle: string | null } | null,
) {
  return {
    id: product.id,
    title: product.title,
    url: product.url,
    pitch: product.pitch,
    status: product.status,
    createdAt: product.createdAt.toISOString(),
    userId: product.userId,
    authorName: author?.name ?? null,
    authorHandle: author?.handle ?? null,
    votes: voteCount,
    myVote,
  };
}

/** GET /api/stage/products — yayınlanmış ürünler + oy sayıları */
router.get("/stage/products", requireAuth, async (req, res) => {
  try {
    await ensureStageSchema();
    const userId = req.user!.id;

    const products = await db
      .select({
        product: stageProductsTable,
        authorName: usersTable.name,
        authorHandle: usersTable.handle,
        votes: sql<number>`coalesce(count(${stageVotesTable.id}), 0)::int`,
      })
      .from(stageProductsTable)
      .leftJoin(usersTable, eq(usersTable.id, stageProductsTable.userId))
      .leftJoin(stageVotesTable, eq(stageVotesTable.productId, stageProductsTable.id))
      .where(eq(stageProductsTable.status, "published"))
      .groupBy(stageProductsTable.id, usersTable.name, usersTable.handle)
      .orderBy(desc(stageProductsTable.createdAt));

    const myVotes = await db
      .select({ productId: stageVotesTable.productId })
      .from(stageVotesTable)
      .where(eq(stageVotesTable.userId, userId));
    const myVoteSet = new Set(myVotes.map((v) => v.productId));

    res.json({
      products: products.map((row) =>
        mapProduct(
          row.product,
          Number(row.votes) || 0,
          myVoteSet.has(row.product.id),
          { name: row.authorName ?? "", handle: row.authorHandle },
        ),
      ),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Ürünler yüklenemedi" });
  }
});

/** POST /api/stage/products — üye ürün gönderimi */
router.post("/stage/products", requireAuth, async (req, res) => {
  try {
    await ensureStageSchema();
    const userId = req.user!.id;
    const { title, url, pitch } = req.body as {
      title?: string;
      url?: string;
      pitch?: string;
    };

    const t = title?.trim() ?? "";
    const u = url?.trim() ?? "";
    const p = pitch?.trim() ?? "";

    if (!t || !u || !p) {
      res.status(400).json({ error: "title, url ve pitch zorunlu" });
      return;
    }
    if (t.length > 120 || p.length > 500) {
      res.status(400).json({ error: "Başlık veya pitch çok uzun" });
      return;
    }

    const [created] = await db
      .insert(stageProductsTable)
      .values({
        userId,
        title: t,
        url: u,
        pitch: p,
        status: "published",
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

/** GET /api/stage/showcase — son 7 günde en çok oy alanlar */
router.get("/stage/showcase", requireAuth, async (req, res) => {
  try {
    await ensureStageSchema();
    const userId = req.user!.id;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const products = await db
      .select({
        product: stageProductsTable,
        authorName: usersTable.name,
        authorHandle: usersTable.handle,
        votes: sql<number>`coalesce(count(${stageVotesTable.id}), 0)::int`,
      })
      .from(stageProductsTable)
      .leftJoin(usersTable, eq(usersTable.id, stageProductsTable.userId))
      .leftJoin(stageVotesTable, eq(stageVotesTable.productId, stageProductsTable.id))
      .where(
        and(
          eq(stageProductsTable.status, "published"),
          gte(stageProductsTable.createdAt, weekAgo),
        ),
      )
      .groupBy(stageProductsTable.id, usersTable.name, usersTable.handle)
      .orderBy(sql`coalesce(count(${stageVotesTable.id}), 0) desc`, desc(stageProductsTable.createdAt))
      .limit(20);

    const myVotes = await db
      .select({ productId: stageVotesTable.productId })
      .from(stageVotesTable)
      .where(eq(stageVotesTable.userId, userId));
    const myVoteSet = new Set(myVotes.map((v) => v.productId));

    res.json({
      products: products.map((row) =>
        mapProduct(
          row.product,
          Number(row.votes) || 0,
          myVoteSet.has(row.product.id),
          { name: row.authorName ?? "", handle: row.authorHandle },
        ),
      ),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Showcase yüklenemedi" });
  }
});

export default router;
