import { useState } from "react";
import { Check, ArrowRight, Zap, Star, Crown } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

interface Plan {
  id: "annual" | "founder";
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "annual",
    icon: Star,
    name: "Yıllık Üyelik",
    price: "₺499",
    period: "/ yıl",
    description: "inner·hub'a tam erişim. Etkinlikler, kurslar, ayrıcalıklar ve topluluk.",
    features: [
      "Tüm etkinliklere öncelikli kayıt",
      "Tüm kurs içeriklerine erişim",
      "Ayrıcalıklar kataloğu",
      "Topluluk chat kanalları",
      "Katılımcı dizini",
      "Talent Board ilanları",
      "Aylık networking kahvaltısı",
    ],
    highlighted: true,
    badge: "En Popüler",
  },
  {
    id: "founder",
    icon: Crown,
    name: "Kurucu Üyelik",
    price: "₺999",
    period: "/ yıl",
    description: "inner·hub'un ilk katmanı. Kurucu topluluğa özel ekstra avantajlar.",
    features: [
      "Yıllık üyeliğin tüm özellikleri",
      "Kurucu rozeti ve profil etiketi",
      "inner·capital deal flow erişimi",
      "Özel kurucu dinner davetleri",
      "inner·studio öncelikli danışmanlık",
      "Demo Day'e sunum hakkı",
      "Co-founder matching önceliği",
    ],
  },
];

const EVENT_TICKET = {
  name: "Etkinlik Bileti",
  price: "₺199",
  description: "Tek seferlik etkinlik erişimi. Üye olmadan da katılabilirsin.",
};

async function createCheckoutSession(
  type: "membership" | "event",
  planId?: "annual" | "founder",
  eventId?: number,
) {
  const res = await fetch("/api/payments/checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      planId,
      eventId,
      successUrl: `${window.location.origin}/panel/payment/success`,
      cancelUrl: `${window.location.origin}/panel/membership`,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Ödeme başlatılamadı");
  }

  const { url } = await res.json();
  if (url) window.location.href = url;
}

function PlanCard({ plan }: { plan: Plan }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const Icon = plan.icon;

  const handleBuy = async () => {
    setLoading(true);
    setError("");
    try {
      await createCheckoutSession("membership", plan.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={[
        "relative flex flex-col border p-6 transition-all duration-200",
        plan.highlighted
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
          : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/20",
      ].join(" ")}
    >
      {plan.badge && (
        <span
          className={[
            "absolute right-4 top-4 border px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest",
            plan.highlighted
              ? "border-[var(--inner-green)]/50 bg-[var(--inner-green)]/20 text-[var(--inner-green)]"
              : "border-[var(--ink)]/15 text-[var(--ink)]/40",
          ].join(" ")}
        >
          {plan.badge}
        </span>
      )}

      {/* Header */}
      <div className="mb-5">
        <div
          className={[
            "mb-3 flex size-9 items-center justify-center border",
            plan.highlighted
              ? "border-[var(--bone)]/20"
              : "border-[var(--ink)]/10",
          ].join(" ")}
        >
          <Icon
            className={[
              "size-4",
              plan.highlighted ? "text-[var(--bone)]/70" : "text-[var(--ink)]/40",
            ].join(" ")}
          />
        </div>
        <p
          className={[
            "font-mono text-[10px] uppercase tracking-widest",
            plan.highlighted ? "text-[var(--bone)]/50" : "text-[var(--ink)]/40",
          ].join(" ")}
        >
          {plan.name}
        </p>
        <div className="mt-1 flex items-baseline gap-1">
          <span
            className={[
              "font-serif text-4xl",
              plan.highlighted ? "text-[var(--bone)]" : "text-[var(--ink)]",
            ].join(" ")}
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
          >
            {plan.price}
          </span>
          <span
            className={[
              "font-mono text-[11px]",
              plan.highlighted ? "text-[var(--bone)]/40" : "text-[var(--ink)]/30",
            ].join(" ")}
          >
            {plan.period}
          </span>
        </div>
        <p
          className={[
            "mt-2 text-sm leading-relaxed",
            plan.highlighted ? "text-[var(--bone)]/60" : "text-[var(--ink)]/50",
          ].join(" ")}
        >
          {plan.description}
        </p>
      </div>

      {/* Features */}
      <ul className="mb-6 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check
              className={[
                "mt-0.5 size-3.5 shrink-0",
                plan.highlighted ? "text-[var(--inner-green)]" : "text-[var(--ink)]/40",
              ].join(" ")}
            />
            <span
              className={[
                "text-xs",
                plan.highlighted ? "text-[var(--bone)]/70" : "text-[var(--ink)]/60",
              ].join(" ")}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      {/* Error */}
      {error && (
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">
          {error}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handleBuy}
        disabled={loading}
        className={[
          "flex w-full items-center justify-between border px-5 py-3 font-mono text-[11px] uppercase tracking-widest transition-opacity disabled:opacity-40 hover:opacity-80",
          plan.highlighted
            ? "border-[var(--bone)]/20 bg-[var(--bone)] text-[var(--ink)]"
            : "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]",
        ].join(" ")}
      >
        <span>{loading ? "Yönlendiriliyor…" : "Satın Al"}</span>
        <ArrowRight className="size-3.5" />
      </button>
    </div>
  );
}

export default function Membership() {
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState("");

  const handleEventTicket = async () => {
    setTicketLoading(true);
    setTicketError("");
    try {
      await createCheckoutSession("event", undefined, 1);
    } catch (e: any) {
      setTicketError(e.message);
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Header */}
      <FadeIn>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
            inner·hub
          </p>
          <h1
            className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
          >
            Üyelik
            <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
            inner·hub'a katıl. Yıllık planını seç, toplulukla büyü.
          </p>
        </div>
      </FadeIn>

      {/* Plans */}
      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>

      {/* Event ticket section */}
      <div>
        <div className="border-t border-[var(--ink)]/[0.08] pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-[var(--ink)]/[0.08] p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-9 items-center justify-center border border-[var(--ink)]/10">
                <Zap className="size-4 text-[var(--ink)]/40" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-0.5">
                  Tek Seferlik
                </p>
                <p className="text-sm font-medium text-[var(--ink)]">{EVENT_TICKET.name}</p>
                <p className="text-xs text-[var(--ink)]/50 mt-0.5">{EVENT_TICKET.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span
                className="font-serif text-2xl text-[var(--ink)]"
                style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
              >
                {EVENT_TICKET.price}
              </span>
              <button
                onClick={handleEventTicket}
                disabled={ticketLoading}
                className="flex items-center gap-2 border border-[var(--ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/50 transition-all hover:border-[var(--ink)] hover:text-[var(--ink)] disabled:opacity-40"
              >
                {ticketLoading ? "Yönlendiriliyor…" : "Bilet Al"}
                <ArrowRight className="size-3" />
              </button>
            </div>
          </div>
          {ticketError && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--error)]">
              {ticketError}
            </p>
          )}
        </div>
      </div>

      {/* Trust note */}
      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/25 text-center">
          Ödemeler Stripe ile güvenli şekilde işlenir · SSL şifreli · İstediğinde iptal et
        </p>
      </div>
    </div>
  );
}
