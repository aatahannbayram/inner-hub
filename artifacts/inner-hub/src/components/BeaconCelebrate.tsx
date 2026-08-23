import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SquareBurst } from "@/components/SquareBurst";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Başarı sinyali: yeşil nokta (■) iki kez yanıp söner, ping halkası atar,
 * sonra karelere patlar. Markanın “period” metaforunun kutlama hali.
 */
export function BeaconCelebrate({
  className = "",
  burstCount = 40,
}: {
  className?: string;
  burstCount?: number;
}) {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const t = window.setTimeout(() => setBurst(true), 1080);
    return () => window.clearTimeout(t);
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-visible ${className}`}
    >
      {/* Merkez nokta + ping */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
        <motion.span
          className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 border border-[#18FF85]"
          initial={{ scale: 0.6, opacity: 0.7 }}
          animate={{ scale: [0.6, 3.2, 3.2], opacity: [0.55, 0.2, 0] }}
          transition={{ duration: 0.85, delay: 0.12, ease: EASE }}
        />
        <motion.span
          className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 border border-[#18FF85]/60"
          initial={{ scale: 0.6, opacity: 0.5 }}
          animate={{ scale: [0.6, 4.4, 4.4], opacity: [0.4, 0.12, 0] }}
          transition={{ duration: 1.05, delay: 0.28, ease: EASE }}
        />

        <motion.span
          className="relative block size-3 bg-[#18FF85] shadow-[0_0_28px_rgba(24,255,133,0.55)]"
          initial={{ scale: 0, opacity: 0 }}
          animate={
            burst
              ? { scale: [1, 1.65, 0], opacity: [1, 1, 0] }
              : {
                  scale: [0, 1.15, 1, 1, 0.15, 1, 1, 0.15, 1],
                  opacity: [0, 1, 1, 1, 0.12, 1, 1, 0.12, 1],
                }
          }
          transition={
            burst
              ? { duration: 0.28, ease: EASE }
              : {
                  duration: 1.05,
                  times: [0, 0.18, 0.28, 0.42, 0.5, 0.58, 0.72, 0.8, 1],
                  ease: "easeInOut",
                }
          }
        />
      </div>

      <AnimatePresence>
        {burst && (
          <motion.div key="burst" className="absolute inset-0" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
            <SquareBurst count={burstCount} originY="38%" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Cümle sonu noktası: yeşil kare yukarıdan iner, oturur, bir kez yanıp söner.
 * `If it fits…■` gibi markalı cümle sonları için.
 */
export function BeaconPeriod({
  className = "",
  size = "0.22em",
  delay = 0.35,
}: {
  className?: string;
  size?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <span
        aria-hidden
        className={`ml-[0.06em] inline-block shrink-0 bg-[#18FF85] align-baseline ${className}`}
        style={{ width: size, height: size, marginBottom: "0.08em" }}
      />
    );
  }

  return (
    <motion.span
      aria-hidden
      className={`ml-[0.06em] inline-block shrink-0 bg-[#18FF85] align-baseline shadow-[0_0_14px_rgba(24,255,133,0.4)] ${className}`}
      style={{ width: size, height: size, marginBottom: "0.08em" }}
      initial={{ opacity: 0, y: "-0.45em", scale: 0.4 }}
      animate={{
        opacity: [0, 1, 1, 0.12, 1],
        y: ["-0.45em", "0.04em", "0em", "0em", "0em"],
        scale: [0.4, 1.15, 1, 1, 1],
      }}
      transition={{
        delay,
        duration: 1.1,
        times: [0, 0.35, 0.5, 0.72, 1],
        ease: EASE,
      }}
    />
  );
}

/** Kart üstünde küçük “sinyal alındı” satırı: inner ■ signal */
export function BeaconReceivedMark({ delay = 0 }: { delay?: number }) {
  const reduce = useReducedMotion();
  const bits = useMemo(() => ["inner", "signal"] as const, []);

  return (
    <motion.p
      lang="en"
      className="mb-5 flex items-baseline gap-[0.08em] font-serif text-sm text-white/55"
      style={{ fontWeight: 600 }}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: EASE }}
    >
      <span>{bits[0]}</span>
      <BeaconPeriod size="0.28em" delay={delay + 0.15} />
      <span>{bits[1]}</span>
    </motion.p>
  );
}
