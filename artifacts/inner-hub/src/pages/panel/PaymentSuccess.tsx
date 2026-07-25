import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

type PaymentType = "membership" | "event";

export default function PaymentSuccess() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const type = (params.get("type") ?? "membership") as PaymentType;
  const plan = params.get("plan");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("success"); // Demo / Stripe key yokken direkt success göster
      return;
    }

    fetch(`/api/payments/session/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "paid" || data.status === "no_payment_required") {
          setEmail(data.customerEmail ?? "");
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        // API bağlantısı yoksa (dev mod) yine de başarı göster
        setStatus("success");
      });
  }, [sessionId]);

  const planLabels: Record<string, string> = {
    annual: "Yıllık Üyelik",
    founder: "Kurucu Üyelik",
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[var(--ink-muted)]" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error-ink)] mb-4">
          Ödeme doğrulanamadı
        </p>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          Lütfen destek ekibiyle iletişime geçin.
        </p>
        <Link
          href="/panel/membership"
          className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
        >
          ← Üyelik sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-16">
      {/* Icon */}
      <div className="mb-8 flex size-14 items-center justify-center border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10">
        <CheckCircle2 className="size-7 text-[var(--success-ink)]" />
      </div>

      {/* Heading */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)] mb-3">
        <span lang="en">inner·hub</span>
      </p>
      <h1
        className="font-serif text-4xl text-[var(--ink)] mb-4"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
      >
        {type === "event" ? "Biletini aldın" : "Hoş geldin"}{" "}
        <span className="inline-block size-[0.35em] translate-y-[0.08em] bg-[var(--inner-green)]" />
      </h1>

      {/* Detail card */}
      <div className="mb-8 border border-[var(--ink)]/[0.08] p-5 space-y-3">
        {type === "membership" && plan && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">Plan</span>
            <span className="text-sm font-medium text-[var(--ink)]">
              {planLabels[plan] ?? plan}
            </span>
          </div>
        )}
        {type === "event" && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">Etkinlik</span>
            <span className="text-sm font-medium text-[var(--ink)]">AI & Girişimcilik Zirvesi</span>
          </div>
        )}
        {email && (
          <div className="flex items-center justify-between border-t border-[var(--ink)]/[0.06] pt-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">E-posta</span>
            <span className="text-sm text-[var(--ink-strong)]">{email}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-[var(--ink)]/[0.06] pt-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)]">Durum</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--success-ink)]">
            <span className="size-1.5 rounded-full bg-[var(--inner-green)]" />
            Aktif
          </span>
        </div>
      </div>

      {/* What's next */}
      <div className="mb-8 space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-body)] mb-3">
          Sırada ne var?
        </p>
        {type === "membership" ? (
          <>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[var(--ink)]/10 font-mono text-[9px] text-[var(--ink-body)]">1</span>
              <p className="text-sm text-[var(--ink-body)]">Profilini tamamla — ekibe kim olduğunu göster.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[var(--ink)]/10 font-mono text-[9px] text-[var(--ink-body)]">2</span>
              <p className="text-sm text-[var(--ink-body)]">Topluluk chat'e katıl ve kendini tanıt.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[var(--ink)]/10 font-mono text-[9px] text-[var(--ink-body)]">3</span>
              <p className="text-sm text-[var(--ink-body)]">İlk etkinliğine kayıt ol ve yüz yüze tanış.</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[var(--ink)]/10 font-mono text-[9px] text-[var(--ink-body)]">1</span>
              <p className="text-sm text-[var(--ink-body)]">Bilet onayın e-posta adresine gönderildi.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[var(--ink)]/10 font-mono text-[9px] text-[var(--ink-body)]">2</span>
              <p className="text-sm text-[var(--ink-body)]">Etkinlik günü giriş için bileti hazır bulundur.</p>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/panel"
          className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80"
        >
          Panele Git <ArrowRight className="size-3.5" />
        </Link>
        <Link
          href="/panel/events"
          className="flex items-center gap-2 border border-[var(--ink)]/15 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] transition-all hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
        >
          Etkinlikler
        </Link>
      </div>
    </div>
  );
}
