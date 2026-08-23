import express, { Router } from "express";
import Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { passLedgerTable, usersTable } from "@workspace/db/schema";
import { creditPasses, monthlyPassGrant, MONTHLY_PASS_GRANT } from "../lib/passes";
import { ensureUserMembershipColumns } from "../lib/ensureSchema";

const router = Router();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY ortam değişkeni tanımlı değil");
  return new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
}

const PLANS = {
  annual: {
    name: "inner·hub Yıllık Üyelik",
    amount: 49900,
    currency: "try",
    interval: "year" as const,
    priceId: process.env.STRIPE_PRICE_ANNUAL,
  },
  founder: {
    name: "inner·hub Kurucu Üyelik",
    amount: 99900,
    currency: "try",
    interval: "year" as const,
    priceId: process.env.STRIPE_PRICE_FOUNDER,
  },
};

const PASS_AMOUNT_TRY = 14900;

async function alreadyCredited(userId: number, refId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: passLedgerTable.id })
    .from(passLedgerTable)
    .where(and(eq(passLedgerTable.userId, userId), eq(passLedgerTable.refId, refId)))
    .limit(1);
  return Boolean(row);
}

async function grantMembershipPasses(userId: number, refId: string, reason: string) {
  if (await alreadyCredited(userId, refId)) return;
  await creditPasses({
    userId,
    amount: MONTHLY_PASS_GRANT,
    reason,
    refType: "stripe",
    refId,
  });
}

/** Yenileme / aylık hak: idempotent `monthly:{userId}:{YYYY-MM}`. */
export { monthlyPassGrant };

function periodEndFromSubscription(sub: Stripe.Subscription): Date | null {
  const end = (sub as { current_period_end?: number }).current_period_end;
  if (typeof end === "number" && Number.isFinite(end)) {
    return new Date(end * 1000);
  }
  return null;
}

// ─── POST /api/payments/checkout-session ─────────────────────────────────────
// Body: { type: "membership" | "pass", planId?: string, userId?: string }
router.post("/checkout-session", async (req, res) => {
  try {
    const stripe = getStripe();
    const { type, planId, successUrl, cancelUrl } = req.body as {
      type: "membership" | "pass";
      planId?: keyof typeof PLANS;
      userId?: string | number;
      successUrl?: string;
      cancelUrl?: string;
    };

    const userId =
      (req.body.userId != null && String(req.body.userId)) ||
      (req.user?.id != null ? String(req.user.id) : "");

    const origin =
      req.headers.origin ??
      process.env.APP_URL ??
      "https://inner.digital";
    const success = successUrl ?? `${origin}/panel/payment/success`;
    const cancel = cancelUrl ?? `${origin}/panel/membership`;

    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (type === "membership" && planId) {
      const plan = PLANS[planId];
      if (!plan) return res.status(400).json({ error: "Geçersiz plan" });

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = plan.priceId
        ? [{ price: plan.priceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: plan.currency,
                product_data: { name: plan.name },
                recurring: { interval: plan.interval },
                unit_amount: plan.amount,
              },
              quantity: 1,
            },
          ];

      sessionParams = {
        mode: "subscription",
        line_items: lineItems,
        success_url: `${success}?session_id={CHECKOUT_SESSION_ID}&type=membership&plan=${planId}`,
        cancel_url: cancel,
        metadata: { userId, planId, type: "membership" },
        subscription_data: {
          metadata: { userId, planId },
        },
      };
    } else if (type === "pass") {
      if (!userId) {
        return res.status(400).json({ error: "Pass satın almak için userId gerekli" });
      }
      sessionParams = {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "try",
              product_data: { name: "inner·hub Circle Pass" },
              unit_amount: PASS_AMOUNT_TRY,
            },
            quantity: 1,
          },
        ],
        success_url: `${success}?session_id={CHECKOUT_SESSION_ID}&type=pass`,
        cancel_url: cancel,
        metadata: { type: "pass", userId },
      };
    } else {
      return res.status(400).json({ error: "Geçersiz istek parametreleri" });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    const status = err.message?.includes("ortam değişkeni") ? 503 : 500;
    return res.status(status).json({ error: err.message });
  }
});

// ─── POST /api/payments/webhook ───────────────────────────────────────────────
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret || !sig) {
      return res.status(400).json({ error: "Webhook secret veya imza eksik" });
    }

    let event: Stripe.Event;
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err: any) {
      return res.status(400).json({ error: `Webhook imzası doğrulanamadı: ${err.message}` });
    }

    try {
      await ensureUserMembershipColumns();

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const { userId, planId, type } = session.metadata ?? {};
          const uid = Number(userId);

          if (type === "pass" && Number.isFinite(uid) && uid > 0) {
            if (!(await alreadyCredited(uid, session.id))) {
              await creditPasses({
                userId: uid,
                amount: 1,
                reason: "purchase",
                refType: "stripe",
                refId: session.id,
              });
            }
          } else if (type === "membership" && Number.isFinite(uid) && uid > 0) {
            let periodEnd: Date | null = null;
            if (session.subscription) {
              const stripe = getStripe();
              const subId =
                typeof session.subscription === "string"
                  ? session.subscription
                  : session.subscription.id;
              const sub = await stripe.subscriptions.retrieve(subId);
              periodEnd = periodEndFromSubscription(sub);
            }

            await db
              .update(usersTable)
              .set({
                membershipPlan: planId ?? "annual",
                membershipStatus: "active",
                ...(periodEnd ? { membershipPeriodEnd: periodEnd } : {}),
              })
              .where(eq(usersTable.id, uid));

            await grantMembershipPasses(uid, session.id, "membership_grant");
          }
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          const stripe = getStripe();
          const invAny = invoice as unknown as {
            subscription?: string | { id: string } | null;
            metadata?: Record<string, string>;
            billing_reason?: string;
          };
          // İlk abonelik grant'ı checkout.session.completed'da; burada yalnızca yenileme
          if (invAny.billing_reason === "subscription_create") break;

          let userId = invAny.metadata?.userId;

          const subRaw = invAny.subscription;
          const subId = typeof subRaw === "string" ? subRaw : subRaw?.id;

          if (subId) {
            const sub = await stripe.subscriptions.retrieve(subId);
            userId = userId || sub.metadata?.userId;
            const uid = Number(userId);
            if (Number.isFinite(uid) && uid > 0) {
              const periodEnd = periodEndFromSubscription(sub);
              await db
                .update(usersTable)
                .set({
                  membershipStatus: "active",
                  ...(periodEnd ? { membershipPeriodEnd: periodEnd } : {}),
                })
                .where(eq(usersTable.id, uid));
            }
          }

          const uid = Number(userId);
          if (Number.isFinite(uid) && uid > 0) {
            await monthlyPassGrant(uid);
          }
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const uid = Number(sub.metadata?.userId);
          if (Number.isFinite(uid) && uid > 0) {
            await db
              .update(usersTable)
              .set({ membershipStatus: "cancelled" })
              .where(eq(usersTable.id, uid));
          }
          break;
        }

        case "invoice.payment_failed": {
          break;
        }
      }
    } catch (err: any) {
      console.error("Stripe webhook handler error:", err?.message ?? err);
      return res.status(500).json({ error: "Webhook işlenemedi" });
    }

    return res.json({ received: true });
  },
);

// ─── GET /api/payments/session/:id ───────────────────────────────────────────
router.get("/session/:id", async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    return res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      metadata: session.metadata,
    });
  } catch {
    return res.status(404).json({ error: "Oturum bulunamadı" });
  }
});

export default router;
