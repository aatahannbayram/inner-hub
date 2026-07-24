import { Fragment, useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

function RevealChar({
  char,
  progress,
  range,
}: {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }}>{char}</motion.span>;
}

export function ScrollTextReveal({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });

  if (reduce) {
    return (
      <p className={className} style={style}>
        {text}
      </p>
    );
  }

  const words = text.split(" ");
  const total = text.length;
  let charIndex = 0;

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, wi) => {
        const wordEl = (
          <span className="inline-block">
            {word.split("").map((char) => {
              const i = charIndex;
              charIndex += 1;
              return (
                <RevealChar
                  key={i}
                  char={char}
                  progress={scrollYProgress}
                  range={[i / total - 0.08, i / total + 0.04]}
                />
              );
            })}
          </span>
        );
        const isLast = wi === words.length - 1;
        if (!isLast) charIndex += 1;
        return (
          <Fragment key={wi}>
            {wordEl}
            {!isLast ? " " : null}
          </Fragment>
        );
      })}
    </p>
  );
}
