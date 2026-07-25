import { useRef, type ElementType } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function WordsPullUp({
  text,
  className,
  delay = 0,
  showAsterisk = false,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  /** Brand green square after the final word. */
  showAsterisk?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "div";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const Comp = Tag as ElementType;

  if (reduce) {
    return (
      <Comp className={className}>
        {text}
        {showAsterisk ? <Asterisk /> : null}
      </Comp>
    );
  }

  return (
    <Comp ref={ref} className={className}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <span
            key={`${word}-${i}`}
            className="relative mr-[0.2em] inline-block overflow-hidden pb-1 pr-1 align-top last:mr-0"
          >
            <motion.span
              className="inline-block"
              initial={{ y: 20, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: delay + i * 0.08 }}
            >
              {word}
              {showAsterisk && isLast ? <Asterisk /> : null}
            </motion.span>
          </span>
        );
      })}
    </Comp>
  );
}

function Asterisk() {
  return (
    <span
      className="ml-[0.08em] inline-block size-[0.32em] shrink-0 translate-y-[0.05em] bg-[var(--inner-green)] animate-beacon align-baseline shadow-[0_0_12px_rgba(24,255,133,0.45)]"
      aria-hidden
    />
  );
}

export type PullUpSegment = { text: string; className?: string };

/** Multi-segment pull-up — each segment can carry its own type style (serif italic vs sans). */
export function WordsPullUpMultiStyle({
  segments,
  className,
  delay = 0,
}: {
  segments: PullUpSegment[];
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  const words = segments.flatMap((seg, si) =>
    seg.text.split(" ").map((word, wi) => ({
      word,
      className: seg.className,
      key: `${si}-${wi}-${word}`,
    })),
  );

  if (reduce) {
    return (
      <h2 className={className}>
        {segments.map((seg, i) => (
          <span key={i} className={seg.className}>
            {seg.text}
            {i < segments.length - 1 ? " " : ""}
          </span>
        ))}
      </h2>
    );
  }

  return (
    <h2 ref={ref} className={`inline-flex flex-wrap gap-x-[0.28em] ${className ?? ""}`}>
      {words.map((item, i) => (
        <span key={item.key} className="inline-block overflow-hidden pb-1 align-top">
          <motion.span
            className={`inline-block ${item.className ?? ""}`}
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: delay + i * 0.08 }}
          >
            {item.word}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}
