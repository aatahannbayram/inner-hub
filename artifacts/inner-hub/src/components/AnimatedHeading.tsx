import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

const CHAR_DELAY = 0.03;
const INITIAL_DELAY = 0.2;
const CHAR_DURATION = 0.5;
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

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block">
          {line.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: CHAR_DURATION,
                ease: EASE,
                delay: INITIAL_DELAY + lineIndex * line.length * CHAR_DELAY + charIndex * CHAR_DELAY,
              }}
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
}
