import { motion, useReducedMotion } from "framer-motion";

/** Shimmer sadece transform/opacity — layout tetiklemez, GPU'da çalışır. */
function Shimmer({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={`${className} bg-[var(--ink)]/[0.05]`} />;
  }
  return (
    <div className={`${className} bg-[var(--ink)]/[0.05] relative overflow-hidden`} aria-hidden="true">
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-[var(--ink)]/[0.06]"
        initial={{ x: "-100%" }}
        animate={{ x: "220%" }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/** Ölçülmüş gerçek yükseklik: istatistik kartı 105px. */
export function StatCardSkeleton() {
  return <Shimmer className="h-[105px] border border-[var(--ink)]/[0.08]" />;
}

/** Ölçülmüş gerçek yükseklik: kurs listesi satırı 207px. */
export function CourseCardSkeleton() {
  return <Shimmer className="h-[207px] border border-[var(--ink)]/[0.08]" />;
}

/** Route-level Suspense fallback (kod bölme). Panel kabuğu zaten mount
 *  olmuş durumda görünür — sadece içerik alanı için genel bir iskelet. */
export function PanelPageSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl" role="status" aria-busy="true">
      <span className="sr-only">Sayfa yükleniyor…</span>
      <div aria-hidden="true" className="space-y-8">
        <Shimmer className="h-10 w-1/3" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <Shimmer className="h-40 w-full" />
      </div>
    </div>
  );
}

export function LoadingBlock({
  label = "Yükleniyor",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{`${label}…`}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="border border-[var(--error-ink)]/30 bg-[var(--error-ink)]/5 p-4">
      <p className="text-sm text-[var(--error-ink)]">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 font-mono text-[11px] uppercase tracking-widest text-[var(--error-ink)] underline"
      >
        Tekrar dene
      </button>
    </div>
  );
}
