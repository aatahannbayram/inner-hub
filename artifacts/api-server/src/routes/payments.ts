import express, { Router } from "express";
import Stripe from "stripe";

const router = Router();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY ortam değişkeni tanımlı değil");
  return new Stripe(key, { apiVersion: "2025-06-30.basil" });
}

// ─── Fiyat tablosu ────────────────────────────────────────────────────────────
// Stripe Price ID'leri production'da Dashboard'dan alınır.
// TEST modunda her seferinde fiyat oluşturuluyor (STRIPE_PRICE_* env var yoksa).
const PLANS = {
  annual: {
    name: "inner·hub Yıllık Üyelik",
    amount: 49900, // 499 TRY (kuruş cinsinden)
    currency: "try",
    interval: "year" as const,
    priceId: process.env.STRIPE_PRICE_ANNUAL,
  },
  founder: {
    name: "inner·hub Kurucu Üyelik",
    amount: 99900, // 999 TRY
    currency: "try",
    interval: "year" as const,
    priceId: process.env.STRIPE_PRICE_FOUNDER,
  },
};

// ─── POST /api/payments/checkout-session ─────────────────────────────────────
// Body: { type: "membership" | "event", planId?: string, eventId?: number, userId?: string }
router.post("/checkout-session", async (req, res) => {
  try {
    const stripe = getStripe();
    const { type, planId, eventId, userId, successUrl, cancelUrl } = req.body as {
      type: "membership" | "event";
      planId?: keyof typeof PLANS;
      eventId?: number;
      userId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    const origin = req.headers.origin ?? "http://localhost:5173";
    const success = successUrl ?? `${origin}/panel/payment/success`;
    const cancel = cancelUrl ?? `${origin}/panel/membership`;

    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (type === "membership" && planId) {
      const plan = PLANS[planId];
      if (!plan) return res.status(400).json({ error: "Geçersiz plan" });

      // Eğer Stripe Price ID varsa onu kullan, yoksa inline fiyat yarat
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
        metadata: { userId: userId ?? "", planId, type: "membership" },
        subscription_data: {
          metadata: { userId: userId ?? "", planId },
        },
      };
    } else if (type === "event" && eventId) {
      sessionParams = {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "try",
              product_data: { name: `inner·hub Etkinlik Bileti #${eventId}` },
              unit_amount: 19900, // 199 TRY
            },
            quantity: 1,
          },
        ],
        success_url: `${success}?session_id={CHECKOUT_SESSION_ID}&type=event&eventId=${eventId}`,
        cancel_url: cancel,
        metadata: { userId: userId ?? "", eventId: String(eventId), type: "event" },
      };
    } else {
      return res.status(400).json({ error: "Geçersiz istek parametreleri" });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    const status = err.message?.includes("ortam değişkeni") ? 503 : 500;
    res.status(status).json({ error: err.message });
  }
});

// ─── POST /api/payments/webhook ───────────────────────────────────────────────
// Express'in JSON middleware'ini bu route için atla — ham body gerekiyor.
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

    // Olayları işle
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId, type } = session.metadata ?? {};
        // TODO: users tablosunda role/subscription_status güncelle
        console.log(`Ödeme tamamlandı — user: ${userId}, type: ${type}, plan: ${planId}`);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        // TODO: kullanıcının üyeliğini pasife al
        console.log(`Abonelik iptal — user: ${userId}`);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Ödeme başarısız — customer: ${invoice.customer}`);
        break;
      }
    }

    res.json({ received: true });
  },
);

// ─── GET /api/payments/session/:id ───────────────────────────────────────────
router.get("/session/:id", async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      metadata: session.metadata,
    });
  } catch (err: any) {
    res.status(404).json({ error: "Oturum bulunamadı" });
  }
});

export default router;
