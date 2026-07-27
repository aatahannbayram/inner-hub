import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

const WORD_DELAY = 0.045;
const INITIAL_DELAY = 0.2;
const CHAR_DURATION = 0.5;
const MAX_STAGGER = 0.35; // toplam gecikme tavanı - birincil CTA'nın etkileşilebilir olması gecikmesin
const EASE = [0.16, 1, 0.3, 1] as const;

export function AnimatedHeading({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const lines = text.split("\n");

  if (reduce) {
    return (
      <h1 className={className} style={style}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </h1>
    );
  }

  // Kelime bazlı split - harf bazlıya göre daha kısa toplam stagger süresi
  // ve tam metin ekran okuyucular için aria-label'da (span'ler aria-hidden).
  let globalWordIndex = 0;

  return (
    <h1 className={className} style={style} aria-label={lines.join(" ")}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block" aria-hidden="true">
          {line.split(" ").map((word, wordIndex, arr) => {
            const delay = INITIAL_DELAY + Math.min(globalWordIndex * WORD_DELAY, MAX_STAGGER);
            globalWordIndex += 1;
            return (
              <motion.span
                key={wordIndex}
                className="inline-block"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: CHAR_DURATION, ease: EASE, delay }}
              >
                {word}
                {wordIndex < arr.length - 1 ? " " : ""}
              </motion.span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
