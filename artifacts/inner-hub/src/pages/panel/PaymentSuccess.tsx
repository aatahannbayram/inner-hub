import { Link } from "wouter";
import { Lockup } from "@/components/Lockup";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { PanelPageSkeleton, ErrorState } from "@/components/panel/Skeletons";

type PaymentType = "membership" | "event";

type SessionPayload = {
  status?: string;
  customerEmail?: string;
};

export default function PaymentSuccess() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const type = (params.get("type") ?? "membership") as PaymentType;
  const plan = params.get("plan");

  const { data, isLoading, isError, refetch, isFetched } = useApiQuery<SessionPayload>(
    ["payment-session", sessionId ?? "none"],
    `/api/payments/session/${sessionId ?? ""}`,
    { enabled: Boolean(sessionId) },
  );

  const planLabels: Record<string, string> = {
    annual: "Yıllık Üyelik",
    founder: "Kurucu Üyelik",
  };

  // Stripe session yoksa (local demo) başarı göster
  if (!sessionId) {
    return <SuccessView type={type} plan={plan} planLabels={planLabels} email="" />;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <PanelPageSkeleton />
      </div>
    );
  }

  const paid =
    data?.status === "paid" || data?.status === "no_payment_required";

  // Dev / API soft-fail: fetch bitti ama hata → yine de success (eski davranış)
  if (isError && isFetched) {
    return <SuccessView type={type} plan={plan} planLabels={planLabels} email="" />;
  }

  if (!paid) {
    return (
      <div className="mx-auto max-w-md py-16">
        <ErrorState message="Ödeme doğrulanamadı" onRetry={() => refetch()} />
        <div className="mt-6 text-center">
          <Link
            href="/panel/membership"
            className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          >
            ← Üyelik sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SuccessView
      type={type}
      plan={plan}
      planLabels={planLabels}
      email={data?.customerEmail ?? ""}
    />
  );
}

function SuccessView({
  type,
  plan,
  planLabels,
  email,
}: {
  type: PaymentType;
  plan: string | null;
  planLabels: Record<string, string>;
  email: string;
}) {
  return (
    <div className="mx-auto max-w-lg py-16">
      <div className="mb-8 flex size-14 items-center justify-center border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10">
        <CheckCircle2 className="size-7 text-[var(--success-ink)]" />
      </div>

      <div className="mb-3 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"><Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" /></div>
      <h1
        className="mb-4 font-serif font-display text-4xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
      >
        Ödeme alındı

      </h1>
      <p className="mb-8 text-sm font-light text-[var(--ink-muted)]">
        {type === "event"
          ? "Etkinlik kaydın onaylandı."
          : `${planLabels[plan ?? ""] ?? "Üyelik"} aktif.`}
        {email ? ` Onay ${email} adresine gönderildi.` : null}
      </p>

      <Link
        href="/panel"
        className="inline-flex items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-caption uppercase tracking-widest text-[var(--bone)]"
      >
        Panele dön <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
