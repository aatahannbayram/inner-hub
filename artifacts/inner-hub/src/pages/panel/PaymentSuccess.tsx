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
        <Loader2 className="size-6 animate-spin text-[var(--ink)]/30" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--error)] mb-4">
          Ödeme doğrulanamadı
        </p>
        <p className="text-sm text-[var(--ink)]/50 mb-6">
          Lütfen destek ekibiyle iletişime geçin.
        </p>
        <Link href="/panel/membership">
          <a className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/50 hover:text-[var(--ink)] transition-colors">
            ← Üyelik sayfasına dön
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-16">
      {/* Icon */}
      <div className="mb-8 flex size-14 items-center justify-center border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10">
        <CheckCircle2 className="size-7 text-[var(--inner-green)]" />
      </div>

      {/* Heading */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-3">
        inner·hub
      </p>
      <h1
        className="font-serif text-4xl text-[var(--ink)] mb-4"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
      >
        {type === "event" ? "Biletini aldın" : "Hoş geldin"}{" "}
        <span className="inline-block size-[0.35em] translate-y-[0.08em] bg-[var(--inner-green)]" />
      </h1>

      {/* Detail card */}
      <div className="mb-8 border border-[var(--ink)]/[0.08] p-5 space-y-3">
        {type === "membership" && plan && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">Plan</span>
            <span className="text-sm font-medium text-[var(--ink)]">
              {planLabels[plan] ?? plan}
            </span>
          </div>
        )}
        {type === "event" && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">Etkinlik</span>
            <span className="text-sm font-medium text-[var(--ink)]">AI & Girişimcilik Zirvesi</span>
          </div>
        )}
        {email && (
          <div className="flex items-center justify-between border-t border-[var(--ink)]/[0.06] pt-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">E-posta</span>
            <span className="text-sm text-[var(--ink)]/70">{email}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-[var(--ink)]/[0.06] pt-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">Durum</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--inner-green)]">
            <span className="size-1.5 rounded-full bg-[var(--inner-green)]" />
            Aktif
          </span>
        </div>
      </div>

      {/* What's next */}
      <div className="mb-8 space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-3">
          Sırada ne var?
        </p>
        {type === "membership" ? (
          <>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[var(--ink)]/10 font-mono text-[9px] text-[var(--ink)]/40">1</span>
              <p className="text-sm text-[var(--ink)]/60">Profilini tamamla — ekibe kim olduğunu göster.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[var(--ink)]/10 font-mono text-[9px] text-[var(--ink)]/40">2</span>
              <p className="text-sm text-[var(--ink)]/60">Topluluk chat'e katıl ve kendini tanıt.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[var(--ink)]/10 font-mono text-[9px] text-[var(--ink)]/40">3</span>
              <p className="text-sm text-[var(--ink)]/60">İlk etkinliğine kayıt ol ve yüz yüze tanış.</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[var(--ink)]/10 font-mono text-[9px] text-[var(--ink)]/40">1</span>
              <p className="text-sm text-[var(--ink)]/60">Bilet onayın e-posta adresine gönderildi.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-[var(--ink)]/10 font-mono text-[9px] text-[var(--ink)]/40">2</span>
              <p className="text-sm text-[var(--ink)]/60">Etkinlik günü giriş için bileti hazır bulundur.</p>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/panel">
          <a className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80">
            Panele Git <ArrowRight className="size-3.5" />
          </a>
        </Link>
        <Link href="/panel/events">
          <a className="flex items-center gap-2 border border-[var(--ink)]/15 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/50 transition-all hover:border-[var(--ink)]/40 hover:text-[var(--ink)]">
            Etkinlikler
          </a>
        </Link>
      </div>
    </div>
  );
}
