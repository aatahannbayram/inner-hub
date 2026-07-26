import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotate: number;
  delay: number;
  duration: number;
  tone: "green" | "bone" | "outline";
};

function seeded(i: number, salt: number) {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Marka konfetisi: yuvarlak değil, keskin yeşil / bone kareler.
 * Başarı anında ortadan patlar, sonra erir.
 */
export function SquareBurst({
  count = 36,
  className = "",
  originY = "42%",
  startDelay = 0,
}: {
  count?: number;
  className?: string;
  /** Patlamanın dikey merkezi (CSS top) */
  originY?: string;
  /** Tüm parçacıklar için ekstra gecikme */
  startDelay?: number;
}) {
  const reduce = useReducedMotion();

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + seeded(i, 1) * 0.55;
      const dist = 90 + seeded(i, 2) * 220;
      const toneRoll = seeded(i, 3);
      const tone: Particle["tone"] =
        toneRoll > 0.72 ? "outline" : toneRoll > 0.45 ? "bone" : "green";
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist * 0.72 - 40 - seeded(i, 4) * 80,
        size: tone === "green" ? 5 + seeded(i, 5) * 9 : 3 + seeded(i, 5) * 7,
        rotate: (seeded(i, 6) - 0.5) * 420,
        delay: startDelay + seeded(i, 7) * 0.18,
        duration: 1.15 + seeded(i, 8) * 0.75,
        tone,
      };
    });
  }, [count, startDelay]);

  if (reduce) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 block"
          style={{
            top: originY,
            width: p.size,
            height: p.size,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            backgroundColor:
              p.tone === "green"
                ? "#18FF85"
                : p.tone === "bone"
                  ? "rgba(245,240,232,0.85)"
                  : "transparent",
            border: p.tone === "outline" ? "1px solid rgba(24,255,133,0.7)" : undefined,
            boxShadow: p.tone === "green" ? "0 0 10px rgba(24,255,133,0.35)" : undefined,
          }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.2, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: p.x,
            y: p.y,
            scale: [0.2, 1.05, 1, 0.4],
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.16, 1, 0.3, 1],
            times: [0, 0.12, 0.7, 1],
          }}
        />
      ))}
    </div>
  );
}
