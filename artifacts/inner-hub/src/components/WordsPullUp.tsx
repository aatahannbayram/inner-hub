import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function WordsPullUp({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return <h2 className={className}>{text}</h2>;
  }

  return (
    <h2 ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-1 pr-1 mr-[0.2em] last:mr-0 align-top">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: delay + i * 0.08 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}
