import { useMemo, useState } from "react";
import { Lockup } from "@/components/Lockup";
import { Check, ArrowRight, Star, Crown, Ticket } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { CurrencyValue } from "@/components/panel/CurrencyValue";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
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

type PassMe = {
  balance: number;
  monthlyGrant: number;
  passPriceTry: number;
  membershipPlan?: string | null;
  membershipStatus?: string | null;
};
type AuthMe = {
  user: {
    id: number;
    membershipPlan?: string | null;
    membershipStatus?: string | null;
  };
};

async function createCheckoutSession(
  type: "membership" | "pass",
  opts?: { planId?: "annual" | "founder"; userId?: number },
) {
  const res = await fetch(apiUrl("/api/payments/checkout-session"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      planId: opts?.planId,
      userId: opts?.userId,
      successUrl: `${window.location.origin}/panel/payment/success?type=${type}`,
      cancelUrl: `${window.location.origin}/panel/membership`,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "checkout");
  }

  const { url } = await res.json();
  if (url) window.location.href = url;
}

function PlanCard({
  plan,
  isCurrent,
}: {
  plan: Plan;
  isCurrent: boolean;
}) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const Icon = plan.icon;
  const badge = isCurrent ? t("membership.current") : plan.badge;

  const handleBuy = async () => {
    if (isCurrent) return;
    setLoading(true);
    setError("");
    try {
      await createCheckoutSession("membership", { planId: plan.id });
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
          ? "border-[var(--surface-inverted)] bg-[var(--surface-inverted)] text-[var(--on-inverted)]"
          : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/20",
      ].join(" ")}
    >
      {plan.highlighted && <AmbientCardBackground />}
      {badge && (
        <span
          className={[
            "absolute right-4 top-4 border px-2 py-0.5 font-mono text-label uppercase tracking-widest",
            isCurrent
              ? plan.highlighted
                ? "border-[var(--on-inverted-success)]/40 bg-[var(--on-inverted-success)]/15 text-[var(--on-inverted-success)]"
                : "border-[var(--success-ink)]/30 bg-[var(--success-ink)]/10 text-[var(--success-ink)]"
              : plan.highlighted
                ? "border-[var(--on-inverted-success)]/40 bg-[var(--on-inverted-success)]/15 text-[var(--on-inverted-success)]"
                : "border-[var(--ink)]/15 text-[var(--ink-body)]",
          ].join(" ")}
        >
          {badge}
        </span>
      )}

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mb-5">
          <div
            className={[
              "mb-3 flex size-9 items-center justify-center border",
              plan.highlighted ? "border-[var(--on-inverted)]/20" : "border-[var(--ink)]/10",
            ].join(" ")}
          >
            <Icon
              className={[
                "size-4",
                plan.highlighted ? "text-[var(--on-inverted-muted)]" : "text-[var(--ink-body)]",
              ].join(" ")}
            />
          </div>
          <p
            className={[
              "font-mono text-label uppercase tracking-widest",
              plan.highlighted ? "text-[var(--on-inverted-muted)]" : "text-[var(--ink-body)]",
            ].join(" ")}
          >
            {plan.name}
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={[
                "font-serif text-4xl",
                plan.highlighted ? "text-[var(--on-inverted)]" : "text-[var(--ink)]",
              ].join(" ")}
              style={{ fontWeight: 600 }}
            >
              <CurrencyValue value={plan.price} />
            </span>
            <span
              className={[
                "font-mono text-caption",
                plan.highlighted ? "text-[var(--on-inverted-muted)]" : "text-[var(--ink-muted)]",
              ].join(" ")}
            >
              {plan.period}
            </span>
          </div>
          <p
            className={[
              "mt-2 text-sm leading-relaxed",
              plan.highlighted ? "text-[var(--on-inverted-muted)]" : "text-[var(--ink-muted)]",
            ].join(" ")}
          >
            {plan.description}
          </p>
        </div>

        <ul className="mb-6 flex-1 space-y-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check
                className={[
                  "mt-0.5 size-3.5 shrink-0",
                  plan.highlighted ? "text-[var(--on-inverted-success)]" : "text-[var(--ink-body)]",
                ].join(" ")}
              />
              <span
                className={[
                  "text-sm",
                  plan.highlighted ? "text-[var(--on-inverted)]" : "text-[var(--ink-body)]",
                ].join(" ")}
              >
                {f}
              </span>
            </li>
          ))}
        </ul>

        {error && (
          <p className="mb-3 font-mono text-label uppercase tracking-widest text-[var(--error-ink)]">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleBuy}
          disabled={loading}
          aria-current={isCurrent ? "true" : undefined}
          className={[
            "flex w-full items-center justify-between border px-5 py-3 font-mono text-caption uppercase tracking-widest transition-opacity disabled:opacity-40 hover:opacity-80",
            isCurrent
              ? plan.highlighted
                ? "border-[var(--on-inverted)]/35 bg-transparent text-[var(--on-inverted)]"
                : "border-[var(--ink)]/25 bg-transparent text-[var(--ink)]"
              : plan.highlighted
                ? "border-[var(--on-inverted)]/20 bg-[var(--on-inverted)] text-[var(--surface-inverted)]"
                : "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]",
          ].join(" ")}
        >
          <span>
            {loading
              ? t("membership.redirecting")
              : isCurrent
                ? t("membership.manage")
                : t("membership.buy")}
          </span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function CirclePassCard() {
  const t = useT();
  const { data: passData } = useApiQuery<PassMe>(["passes-me"], "/api/passes/me");
  const { data: meData } = useApiQuery<AuthMe>(["auth-me"], "/api/auth/me");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const balance = passData?.balance ?? 0;
  const monthlyGrant = passData?.monthlyGrant ?? 3;
  const price = passData?.passPriceTry ?? 149;

  const buyPass = async () => {
    setLoading(true);
    setError("");
    try {
      const userId = meData?.user?.id;
      await createCheckoutSession("pass", { userId });
    } catch (e: any) {
      setError(e.message === "checkout" ? t("membership.checkoutFailed") : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-[var(--ink)]/[0.08] pt-8">
      <div className="flex flex-col gap-4 panel-glass p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-9 items-center justify-center panel-glass">
            <Ticket className="size-4 text-[var(--ink-body)]" />
          </div>
          <div>
            <p className="mb-0.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("membership.circlePass")}
            </p>
            <p className="text-sm font-medium text-[var(--ink)]">
              {t("membership.passBalance", { n: balance })}
            </p>
            <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
              {t("membership.passMonthly", { balance, grant: monthlyGrant })}
            </p>
            <p className="mt-1 font-mono text-label text-[var(--ink-subtle)]">
              {t("membership.passHint")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={() => void buyPass()}
            disabled={loading || !meData?.user?.id}
            className="flex items-center gap-2 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {loading
              ? t("membership.redirecting")
              : t("membership.buyPass", { price: `₺${price}` })}
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-2 font-mono text-label uppercase tracking-widest text-[var(--error-ink)]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Membership() {
  const t = useT();
  const { data: passData } = useApiQuery<PassMe>(["passes-me"], "/api/passes/me");
  const { data: meData } = useApiQuery<AuthMe>(["auth-me"], "/api/auth/me");

  const membershipPlan =
    passData?.membershipPlan ?? meData?.user?.membershipPlan ?? null;
  const membershipStatus =
    passData?.membershipStatus ?? meData?.user?.membershipStatus ?? null;
  const hasActivePlan = membershipStatus === "active" && Boolean(membershipPlan);

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
          t("membership.featPasses"),
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
          t("membership.featPasses"),
        ],
      },
    ],
    [t],
  );

  return (
    <div className="min-w-0 max-w-4xl space-y-10 overflow-x-hidden">
      <FadeIn>
        <div>
          <div className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            <Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" />
          </div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontWeight: 600 }}
          >
            {t("membership.title")}
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">{t("membership.subtitle")}</p>
        </div>
      </FadeIn>

      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={hasActivePlan && membershipPlan === plan.id}
            />
          ))}
        </div>
      </div>

      <CirclePassCard />

      <div className="border-t border-[var(--ink)]/[0.08] pt-4 space-y-1">
        <p className="text-center font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          {t("membership.vatNote")}
        </p>
        <p className="text-center font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          {t("membership.trust")}
        </p>
      </div>
    </div>
  );
}
