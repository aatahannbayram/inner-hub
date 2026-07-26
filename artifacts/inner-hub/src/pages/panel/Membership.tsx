import { useMemo, useState } from "react";
import { Lockup } from "@/components/Lockup";
import { Check, ArrowRight, Zap, Star, Crown } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { CurrencyValue } from "@/components/panel/CurrencyValue";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import { useT } from "@/i18n";

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
    throw new Error(err.error ?? "checkout");
  }

  const { url } = await res.json();
  if (url) window.location.href = url;
}

function PlanCard({ plan }: { plan: Plan }) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const Icon = plan.icon;

  const handleBuy = async () => {
    setLoading(true);
    setError("");
    try {
      await createCheckoutSession("membership", plan.id);
    } catch (e: any) {
      setError(e.message === "checkout" ? t("membership.checkoutFailed") : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={[
        "relative flex flex-col overflow-hidden border p-6 transition-all duration-200",
        plan.highlighted
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
          : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/20",
      ].join(" ")}
    >
      {plan.highlighted && <AmbientCardBackground />}
      {plan.badge && (
        <span
          className={[
            "absolute right-4 top-4 border px-2 py-0.5 font-mono text-label uppercase tracking-widest",
            plan.highlighted
              ? "border-[var(--inner-green)]/50 bg-[var(--inner-green)]/20 text-[var(--success-ink)]"
              : "border-[var(--ink)]/15 text-[var(--ink-body)]",
          ].join(" ")}
        >
          {plan.badge}
        </span>
      )}

      <div className="relative z-10 flex flex-1 flex-col">
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
              plan.highlighted ? "text-[var(--bone)]/70" : "text-[var(--ink-body)]",
            ].join(" ")}
          />
        </div>
        <p
          className={[
            "font-mono text-label uppercase tracking-widest",
            plan.highlighted ? "text-[var(--bone)]/50" : "text-[var(--ink-body)]",
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
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            <CurrencyValue value={plan.price} />
          </span>
          <span
            className={[
              "font-mono text-caption",
              plan.highlighted ? "text-[var(--bone)]/57" : "text-[var(--ink-muted)]",
            ].join(" ")}
          >
            {plan.period}
          </span>
        </div>
        <p
          className={[
            "mt-2 text-sm leading-relaxed",
            plan.highlighted ? "text-[var(--bone)]/60" : "text-[var(--ink-muted)]",
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
                plan.highlighted ? "text-[var(--success-ink)]" : "text-[var(--ink-body)]",
              ].join(" ")}
            />
            <span
              className={[
                "text-sm",
                plan.highlighted ? "text-[var(--bone)]/70" : "text-[var(--ink-body)]",
              ].join(" ")}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      {/* Error */}
      {error && (
        <p className="mb-3 font-mono text-label uppercase tracking-widest text-[var(--error-ink)]">
          {error}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handleBuy}
        disabled={loading}
        className={[
          "flex w-full items-center justify-between border px-5 py-3 font-mono text-caption uppercase tracking-widest transition-opacity disabled:opacity-40 hover:opacity-80",
          plan.highlighted
            ? "border-[var(--bone)]/20 bg-[var(--bone)] text-[var(--ink)]"
            : "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]",
        ].join(" ")}
      >
        <span>{loading ? t("membership.redirecting") : t("membership.buy")}</span>
        <ArrowRight className="size-3.5" />
      </button>
      </div>
    </div>
  );
}

export default function Membership() {
  const t = useT();
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState("");

  const PLANS: Plan[] = useMemo(
    () => [
      {
        id: "annual",
        icon: Star,
        name: t("membership.planAnnual"),
        price: "₺499",
        period: t("membership.perYear"),
        description: t("membership.planAnnualDesc"),
        features: [
          t("membership.feat1"),
          t("membership.feat2"),
          t("membership.feat3"),
          t("membership.feat4"),
          t("membership.feat5"),
          t("membership.feat6"),
          t("membership.feat7"),
        ],
        highlighted: true,
        badge: t("membership.popular"),
      },
      {
        id: "founder",
        icon: Crown,
        name: t("membership.planFounder"),
        price: "₺999",
        period: t("membership.perYear"),
        description: t("membership.planFounderDesc"),
        features: [
          t("membership.featF1"),
          t("membership.featF2"),
          t("membership.featF3"),
          t("membership.featF4"),
          t("membership.featF5"),
          t("membership.featF6"),
          t("membership.featF7"),
        ],
      },
    ],
    [t],
  );

  const handleEventTicket = async () => {
    setTicketLoading(true);
    setTicketError("");
    try {
      await createCheckoutSession("event", undefined, 1);
    } catch (e: any) {
      setTicketError(e.message === "checkout" ? t("membership.checkoutFailed") : e.message);
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="min-w-0 space-y-10 max-w-4xl overflow-x-hidden">
      {/* Header */}
      <FadeIn>
        <div>
          <div className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)] mb-2"><Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" /></div>
          <h1
            className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("membership.title")}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)] font-light">
            {t("membership.subtitle")}
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between panel-glass p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-9 items-center justify-center panel-glass">
                <Zap className="size-4 text-[var(--ink-body)]" />
              </div>
              <div>
                <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)] mb-0.5">
                  {t("membership.oneTime")}
                </p>
                <p className="text-sm font-medium text-[var(--ink)]">{t("membership.eventTicket")}</p>
                <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{t("membership.eventTicketDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span
                className="font-serif text-2xl text-[var(--ink)]"
                style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
              >
                <CurrencyValue value="₺199" />
              </span>
              <button
                onClick={handleEventTicket}
                disabled={ticketLoading}
                className="flex items-center gap-2 panel-glass px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-all hover:border-[var(--ink)] hover:text-[var(--ink)] disabled:opacity-40"
              >
                {ticketLoading ? t("membership.redirecting") : t("membership.buyTicket")}
                <ArrowRight className="size-3" />
              </button>
            </div>
          </div>
          {ticketError && (
            <p className="mt-2 font-mono text-label uppercase tracking-widest text-[var(--error-ink)]">
              {ticketError}
            </p>
          )}
        </div>
      </div>

      {/* Trust note */}
      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)] text-center">
          {t("membership.trust")}
        </p>
      </div>
    </div>
  );
}
