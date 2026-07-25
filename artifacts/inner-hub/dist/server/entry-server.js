import { jsx, jsxs, Fragment as Fragment$1 } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { useRef, Fragment, useState, useEffect } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArrowRight, ArrowUpRight, Check, Zap, Users, TrendingUp, BookOpen, Radio, Fingerprint, Code2, Target, Mail, Linkedin, Instagram } from "lucide-react";
import { useReducedMotion, motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { g as gsapWithCSS } from "./assets/motion-vendor-BFM2_-H6.js";
import Lenis from "lenis";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const ease = [0.16, 1, 0.3, 1];
function FadeIn({
  children,
  className,
  delay = 0
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return /* @__PURE__ */ jsx("div", { className, children });
  }
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-40px" },
      transition: { duration: 0.55, ease, delay: Math.min(delay, 0.3) },
      className,
      children
    }
  );
}
const EASE$2 = [0.16, 1, 0.3, 1];
function WordsPullUp({
  text,
  className,
  delay = 0,
  showAsterisk = false,
  as: Tag = "h2"
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const Comp = Tag;
  if (reduce) {
    return /* @__PURE__ */ jsxs(Comp, { className, children: [
      text,
      showAsterisk ? /* @__PURE__ */ jsx(Asterisk, {}) : null
    ] });
  }
  return /* @__PURE__ */ jsx(Comp, { ref, className, children: words.map((word, i) => {
    const isLast = i === words.length - 1;
    return /* @__PURE__ */ jsx(
      "span",
      {
        className: "relative mr-[0.2em] inline-block overflow-hidden pb-1 pr-1 align-top last:mr-0",
        children: /* @__PURE__ */ jsxs(
          motion.span,
          {
            className: "inline-block",
            initial: { y: 20, opacity: 0 },
            animate: inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 },
            transition: { duration: 0.6, ease: EASE$2, delay: delay + i * 0.08 },
            children: [
              word,
              showAsterisk && isLast ? /* @__PURE__ */ jsx(Asterisk, {}) : null
            ]
          }
        )
      },
      `${word}-${i}`
    );
  }) });
}
function Asterisk() {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: "ml-[0.08em] inline-block size-[0.32em] shrink-0 translate-y-[0.05em] bg-[var(--inner-green)] animate-beacon align-baseline shadow-[0_0_12px_rgba(24,255,133,0.45)]",
      "aria-hidden": true
    }
  );
}
function WordsPullUpMultiStyle({
  segments,
  className,
  delay = 0
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const words = segments.flatMap(
    (seg, si) => seg.text.split(" ").map((word, wi) => ({
      word,
      className: seg.className,
      key: `${si}-${wi}-${word}`
    }))
  );
  if (reduce) {
    return /* @__PURE__ */ jsx("h2", { className, children: segments.map((seg, i) => /* @__PURE__ */ jsxs("span", { className: seg.className, children: [
      seg.text,
      i < segments.length - 1 ? " " : ""
    ] }, i)) });
  }
  return /* @__PURE__ */ jsx("h2", { ref, className: `inline-flex flex-wrap gap-x-[0.28em] ${className ?? ""}`, children: words.map((item, i) => /* @__PURE__ */ jsx("span", { className: "inline-block overflow-hidden pb-1 align-top", children: /* @__PURE__ */ jsx(
    motion.span,
    {
      className: `inline-block ${item.className ?? ""}`,
      initial: { y: 20, opacity: 0 },
      animate: inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 },
      transition: { duration: 0.55, ease: EASE$2, delay: delay + i * 0.08 },
      children: item.word
    }
  ) }, item.key)) });
}
function RevealChar({
  char,
  progress,
  range
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return /* @__PURE__ */ jsx(motion.span, { style: { opacity }, children: char });
}
function ScrollTextReveal({
  text,
  className,
  style
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });
  if (reduce) {
    return /* @__PURE__ */ jsx("p", { className, style, children: text });
  }
  const words = text.split(" ");
  const total = text.length;
  let charIndex = 0;
  return /* @__PURE__ */ jsx("p", { ref, className, style, children: words.map((word, wi) => {
    const wordEl = /* @__PURE__ */ jsx("span", { className: "inline-block", children: word.split("").map((char) => {
      const i = charIndex;
      charIndex += 1;
      return /* @__PURE__ */ jsx(
        RevealChar,
        {
          char,
          progress: scrollYProgress,
          range: [i / total - 0.08, i / total + 0.04]
        },
        i
      );
    }) });
    const isLast = wi === words.length - 1;
    if (!isLast) charIndex += 1;
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      wordEl,
      !isLast ? " " : null
    ] }, wi);
  }) });
}
function BeaconSquare({
  className = "",
  size = "0.28em",
  pulse = false
}) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: [
        "inline-block shrink-0 bg-[#18FF85]",
        pulse ? "animate-beacon" : "",
        className
      ].filter(Boolean).join(" "),
      style: {
        width: size,
        height: size,
        marginBottom: "0.08em",
        verticalAlign: "baseline"
      },
      "aria-hidden": true
    }
  );
}
function Lockup({
  suffix = "hub",
  className = "",
  fontSize,
  /** Dar chrome: `i` ■ */
  compact = false,
  /** @deprecated `compact` kullan */
  showHub = true,
  /** Yanıp sönme — yalnızca logo (nav ürün adlarında kapalı) */
  pulse = false
}) {
  const isCompact = compact || !showHub;
  const label = isCompact ? "inner.hub" : `inner.${suffix}`;
  const textStyle = {
    fontFamily: "'Fraunces', serif",
    fontStyle: "normal",
    fontWeight: 300,
    fontVariationSettings: "'opsz' 144, 'WONK' 1",
    letterSpacing: "-0.02em",
    ...fontSize ? { fontSize } : {}
  };
  if (isCompact) {
    return /* @__PURE__ */ jsxs("span", { lang: "en", className: `inline-flex items-baseline leading-none ${className}`, "aria-label": label, children: [
      /* @__PURE__ */ jsx("span", { style: textStyle, children: "i" }),
      /* @__PURE__ */ jsx(BeaconSquare, { className: "ml-[0.08em]", size: "0.32em", pulse })
    ] });
  }
  return /* @__PURE__ */ jsxs("span", { lang: "en", className: `inline-flex items-baseline leading-none ${className}`, "aria-label": label, children: [
    /* @__PURE__ */ jsx("span", { style: textStyle, children: "inner" }),
    /* @__PURE__ */ jsx(BeaconSquare, { className: "mx-[0.06em]", size: "0.28em", pulse }),
    /* @__PURE__ */ jsx("span", { style: textStyle, children: suffix })
  ] });
}
function Grain() {
  return /* @__PURE__ */ jsx("div", { className: "grain-overlay", "aria-hidden": "true" });
}
const SECTIONS = [
  { id: "section-01", label: "01" },
  { id: "section-02", label: "02" },
  { id: "section-03", label: "03" },
  { id: "section-04", label: "04" },
  { id: "section-05", label: "05" },
  { id: "section-06", label: "06" },
  { id: "section-07", label: "07" }
];
function IndexRail() {
  const [active, setActive] = useState("section-01");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsx(
    "nav",
    {
      "aria-label": "Section index",
      className: "hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4",
      children: SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return /* @__PURE__ */ jsxs(
          "a",
          {
            href: `#${id}`,
            className: "flex items-center gap-2 font-mono text-caption tabular-nums tracking-widest transition-opacity duration-500",
            style: { opacity: isActive ? 1 : 0.35 },
            children: [
              isActive && /* @__PURE__ */ jsx(
                "span",
                {
                  className: "w-[5px] h-[5px] bg-[var(--inner-green)] flex-shrink-0",
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: isActive ? "text-foreground" : "text-muted-foreground", children: label })
            ]
          },
          id
        );
      })
    }
  );
}
const TOTAL = 34;
const RADIUS = 130;
const SIZE = 7;
const VIEWBOX = 320;
const CENTER = VIEWBOX / 2;
function DiagramCircle() {
  const squares = Array.from({ length: TOTAL }, (_, i) => {
    const angle = i / TOTAL * Math.PI * 2 - Math.PI / 2;
    const x = CENTER + RADIUS * Math.cos(angle);
    const y = CENTER + RADIUS * Math.sin(angle);
    return { x, y, isGreen: i === 0 };
  });
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-6", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx(
      "svg",
      {
        viewBox: `0 0 ${VIEWBOX} ${VIEWBOX}`,
        className: "w-full max-w-[320px] h-auto animate-diagram-spin",
        role: "presentation",
        focusable: "false",
        children: squares.map((s, i) => /* @__PURE__ */ jsx(
          "rect",
          {
            x: s.x - SIZE / 2,
            y: s.y - SIZE / 2,
            width: SIZE,
            height: SIZE,
            fill: s.isGreen ? "var(--inner-green)" : "var(--bone)",
            opacity: s.isGreen ? 1 : 0.85
          },
          i
        ))
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "font-mono text-label uppercase tracking-widest opacity-50", children: "34 · One circle" }),
    /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Thirty-four squares forming one circle." })
  ] });
}
function Preloader() {
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("inner_preloader_seen");
    if (reduced || seen) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem("inner_preloader_seen", "1");
    setPhase("in");
    const t1 = setTimeout(() => setPhase("out"), 500);
    const t2 = setTimeout(() => setPhase("done"), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  if (phase === "done") return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": "true",
      className: "fixed inset-0 z-[9998] bg-[var(--ink)] flex items-center justify-center",
      style: {
        transition: "transform 400ms var(--ease-expo), visibility 0ms 400ms",
        transform: phase === "out" ? "translateY(-110%)" : "translateY(0)",
        visibility: phase === "out" ? "hidden" : "visible"
      },
      children: /* @__PURE__ */ jsx(
        "span",
        {
          className: "w-[14px] h-[14px] bg-[var(--inner-green)]",
          style: {
            animation: phase === "in" ? "preloader-pulse 500ms ease-in-out" : void 0
          }
        }
      )
    }
  );
}
const BY_FRAGMENT = {
  "hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994": "/posters/courses-hero.jpg",
  "hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959": "/posters/capital-events.jpg",
  "hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4": "/posters/gathering.jpg",
  "hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711": "/posters/match-hero.jpg",
  "hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08": "/posters/perks-ambient.jpg"
};
function posterForVideo(src, fallback = "/posters/courses-hero.jpg") {
  for (const [fragment, poster] of Object.entries(BY_FRAGMENT)) {
    if (src.includes(fragment)) return poster;
  }
  return fallback;
}
function HeroVideo({ src, poster, className, style }) {
  const resolvedPoster = poster ?? posterForVideo(src);
  const ref = useRef(null);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  useEffect(() => {
    if (reduce || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  if (reduce) {
    return /* @__PURE__ */ jsx("img", { src: resolvedPoster, alt: "", "aria-hidden": "true", className, style });
  }
  return /* @__PURE__ */ jsx(
    "video",
    {
      ref,
      muted: true,
      loop: true,
      playsInline: true,
      poster: resolvedPoster,
      preload: "none",
      className,
      style,
      src
    }
  );
}
function FeatureCard$1({ feature, index, setRef }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: (el) => {
        ref.current = el;
        setRef(el);
      },
      "data-feature-index": index,
      className: `border border-[var(--bone)]/15 bg-[var(--bone)]/[0.06] p-6 backdrop-blur-sm transition-all duration-700 ease-out md:p-10 ${inView ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`,
      children: [
        /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-label uppercase tracking-widest text-[var(--bone)]/57", children: feature.tag }),
        /* @__PURE__ */ jsx("h3", { className: "mb-6 font-serif text-xl italic text-[var(--bone)] md:text-2xl", children: feature.name }),
        /* @__PURE__ */ jsx("div", { className: "mb-6 aspect-video overflow-hidden bg-black/30", children: feature.media.type === "video" ? /* @__PURE__ */ jsx(
          HeroVideo,
          {
            src: feature.media.src,
            poster: posterForVideo(feature.media.src),
            className: "size-full object-cover"
          }
        ) : /* @__PURE__ */ jsx("img", { src: feature.media.src, alt: feature.name, className: "size-full object-cover", loading: "lazy" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-[var(--bone)]/60 md:text-base", children: feature.desc })
      ]
    }
  );
}
function PlatformFeatures({
  features,
  restModules
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef(/* @__PURE__ */ new Map());
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.featureIndex);
            setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.6 }
    );
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [features.length]);
  const scrollToCard = (index) => {
    cardRefs.current.get(index)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return /* @__PURE__ */ jsx("div", { className: "bg-[var(--ink)] px-6 py-20 text-[var(--bone)] md:px-12 md:py-40 lg:px-[10%] lg:py-48", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-16 lg:grid-cols-[400px_1fr] lg:gap-24 xl:grid-cols-[460px_1fr] xl:gap-48", children: [
    /* @__PURE__ */ jsxs("div", { className: "lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:py-32", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-xs uppercase tracking-widest text-[var(--bone)]/57", children: "03 · The platform" }),
        /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-2xl leading-[1.2] sm:text-3xl lg:text-[46px]", children: "Built for the pace of a closed circle." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 hidden flex-col gap-2 lg:flex", children: features.map((f, i) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => scrollToCard(i),
          className: `border px-4 py-3 text-left font-mono text-xs uppercase tracking-widest transition-colors ${activeIndex === i ? "border-[var(--bone)]/20 bg-[var(--bone)]/10 text-[var(--bone)]" : "border-transparent text-[var(--bone)]/57 hover:text-[var(--bone)]/70"}`,
          children: f.name
        },
        f.id
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 hidden lg:block", children: [
        /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-[var(--bone)]/60", children: "Access is by invitation. Always." }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/invitation",
            className: "inline-flex items-center gap-2 border border-[var(--bone)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[var(--bone)] transition-colors hover:bg-[var(--bone)] hover:text-[var(--ink)]",
            children: [
              "Request an invitation ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "size-3" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
      features.map((f, i) => /* @__PURE__ */ jsx(
        FeatureCard$1,
        {
          feature: f,
          index: i,
          setRef: (el) => {
            if (el) cardRefs.current.set(i, el);
            else cardRefs.current.delete(i);
          }
        },
        f.id
      )),
      restModules.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 border-t border-[var(--bone)]/15 pt-10", children: [
        /* @__PURE__ */ jsxs("p", { className: "mb-6 font-mono text-label uppercase tracking-widest text-[var(--bone)]/57", children: [
          "+",
          restModules.length,
          " more tools"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-px bg-[var(--bone)]/10 sm:grid-cols-2", children: restModules.map((mod) => {
          const Icon = mod.icon;
          return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 bg-[var(--ink)] p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Icon, { className: "size-4 text-[var(--bone)]/50", strokeWidth: 1.5 }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-label uppercase tracking-widest text-[var(--bone)]/47", children: mod.tag })
            ] }),
            /* @__PURE__ */ jsx("h4", { className: "font-serif italic text-lg text-[var(--bone)]/90", children: mod.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-[var(--bone)]/50", children: mod.desc })
          ] }, mod.id);
        }) })
      ] })
    ] })
  ] }) });
}
const NEXT_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4";
function WhatsNextCinematic() {
  const videoWrapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const reduceMotion = useRef(false);
  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    const wrap = videoWrapRef.current;
    if (!wrap || reduceMotion.current) return;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;
    const tick = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      gsapWithCSS.set(wrap, { x: currentX, y: currentY });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = (e.clientX - cx) / cx * 18;
      targetY = (e.clientY - cy) / cy * 18;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      gsapWithCSS.set(wrap, { clearProps: "x,y" });
    };
  }, []);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "section-07",
      className: "relative flex min-h-svh flex-col justify-end overflow-hidden bg-black px-4 pb-12 text-white sm:px-6 sm:pb-16 md:px-12 md:pb-24 lg:px-[10%]",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0 z-0 overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { ref: videoWrapRef, className: "absolute inset-0 origin-center scale-[1.08] will-change-transform", children: /* @__PURE__ */ jsx(
            "video",
            {
              className: "h-full w-full object-cover",
              src: NEXT_VIDEO,
              autoPlay: true,
              muted: true,
              loop: true,
              playsInline: true,
              preload: "metadata",
              onLoadedMetadata: (e) => {
                e.currentTarget.playbackRate = 1.25;
              }
            }
          ) }),
          /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "absolute inset-0 bg-black/25" }),
          /* @__PURE__ */ jsx(
            "div",
            {
              "aria-hidden": true,
              className: "absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/50"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: [
              "relative z-10 transition-all duration-1000",
              ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            ].join(" "),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/60 sm:mb-8 sm:text-xs", children: [
                /* @__PURE__ */ jsx("span", { className: "size-2 shrink-0 bg-[var(--inner-green)] animate-beacon sm:size-1.5" }),
                "07 · What's next · In time"
              ] }),
              /* @__PURE__ */ jsxs("h2", { className: "max-w-[14ch] text-balance font-display font-serif italic text-4xl leading-[1.05] sm:text-5xl md:text-7xl lg:text-8xl", children: [
                "What's next is already",
                " ",
                /* @__PURE__ */ jsx("span", { className: "italic", children: "forming." })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "mt-8 max-w-[48ch] text-base leading-[1.6] text-white/70 sm:mt-10 sm:text-lg md:mt-12 md:text-xl", children: [
                "We announce things when they are real.",
                /* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
                "The circle expands: gatherings, capital, and tools. One deliberate step at a time."
              ] }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: [
                    "liquid-glass mt-8 flex max-w-3xl flex-col gap-3 py-1 pl-4 pr-1 transition-all duration-1000 delay-300 sm:mt-10 sm:flex-row sm:items-center sm:gap-4 sm:pl-6 md:mt-12",
                    ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  ].join(" "),
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "hidden flex-1 text-sm font-medium text-white sm:block", children: "Access is by invitation. Always." }),
                    /* @__PURE__ */ jsx("p", { className: "flex-1 px-1 pt-2 text-sm font-medium text-white sm:hidden sm:px-0 sm:pt-0", children: "By invitation only." }),
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "/invitation",
                        className: "shrink-0 whitespace-nowrap bg-white px-5 py-3 text-center font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90 sm:py-2.5",
                        children: "Request an invitation"
                      }
                    )
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const LINKS = [
  { label: "Idea", href: "#section-01" },
  { label: "Circle", href: "#section-02" },
  { label: "Platform", href: "#section-03" },
  { label: "Gathering", href: "#section-06" },
  { label: "Next", href: "#section-07" }
];
const EASE$1 = [0.16, 1, 0.3, 1];
const HERO_CHROME = "#000000";
function FloatingNavbar() {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs(
    motion.header,
    {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7, ease: EASE$1, delay: 0.15 },
      className: "absolute inset-x-0 top-0 z-50",
      style: { backgroundColor: HERO_CHROME },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex h-[56px] items-center justify-between gap-3 px-3 py-2.5 sm:h-auto sm:gap-4 sm:px-5 sm:py-3.5 md:px-6", children: [
          /* @__PURE__ */ jsx("a", { href: "/", "aria-label": "inner hub home", className: "inline-flex shrink-0", children: /* @__PURE__ */ jsx(Lockup, { className: "text-[var(--bone)]", fontSize: "clamp(22px, 5.2vw, 32px)", pulse: true }) }),
          /* @__PURE__ */ jsx(
            "nav",
            {
              "aria-label": "Primary",
              className: "absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex lg:gap-1",
              children: LINKS.map((link) => /* @__PURE__ */ jsxs(
                "a",
                {
                  href: link.href,
                  className: "group relative px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--bone)]/70 transition-colors duration-300 hover:text-[var(--bone)] lg:px-4 lg:text-[11px]",
                  children: [
                    link.label,
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        "aria-hidden": true,
                        className: "absolute bottom-0.5 left-3 right-3 h-px origin-left scale-x-0 bg-[var(--inner-green)] transition-transform duration-300 ease-out group-hover:scale-x-100 lg:left-4 lg:right-4"
                      }
                    )
                  ]
                },
                link.href
              ))
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "/invitation",
                className: "hidden items-center gap-2.5 bg-[var(--bone)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-black transition-colors hover:bg-white sm:inline-flex lg:px-5 lg:text-[11px]",
                children: [
                  "Invitation",
                  /* @__PURE__ */ jsx("span", { className: "size-1.5 bg-[var(--inner-green)]", "aria-hidden": true })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                "aria-label": open ? "Menüyü kapat" : "Menüyü aç",
                "aria-expanded": open,
                onClick: () => setOpen((v) => !v),
                className: "flex items-center justify-center p-1.5 md:hidden",
                children: /* @__PURE__ */ jsxs("span", { className: "relative flex h-3.5 w-4 flex-col justify-between", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "block h-[1.5px] w-full origin-center bg-[var(--bone)] transition-transform duration-300",
                      style: {
                        transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                        transform: open ? "translateY(6px) rotate(45deg)" : "none"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "block h-[1.5px] w-full origin-center bg-[var(--bone)] transition-transform duration-300",
                      style: {
                        transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                        transform: open ? "translateY(-6px) rotate(-45deg)" : "none"
                      }
                    }
                  )
                ] })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: open ? /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: -6 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -6 },
            transition: { duration: 0.25, ease: EASE$1 },
            className: "border-t border-white/10 md:hidden",
            style: { backgroundColor: HERO_CHROME },
            children: [
              LINKS.map((link, i) => /* @__PURE__ */ jsxs(
                "a",
                {
                  href: link.href,
                  onClick: () => setOpen(false),
                  className: "flex items-center justify-between border-b border-white/10 px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-[var(--bone)]/80 transition-colors last:border-b-0 hover:text-[var(--bone)]",
                  children: [
                    /* @__PURE__ */ jsx("span", { children: link.label }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-[var(--bone)]/30", children: String(i + 1).padStart(2, "0") })
                  ]
                },
                link.label
              )),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "/invitation",
                  onClick: () => setOpen(false),
                  className: "flex items-center justify-between bg-[var(--bone)] px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-black",
                  children: [
                    "Request an invitation",
                    /* @__PURE__ */ jsx("span", { className: "size-1.5 bg-[var(--inner-green)]", "aria-hidden": true })
                  ]
                }
              )
            ]
          }
        ) : null })
      ]
    }
  );
}
const EASE = [0.16, 1, 0.3, 1];
const CARD_EASE = [0.22, 1, 0.36, 1];
const HERO_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const FEATURE_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";
const IDEA_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";
const SEAT_CARDS = [
  {
    id: "01",
    title: "Founders.",
    items: [
      "Building startups in AI and beyond",
      "Shipping before the noise arrives",
      "Looking for co-builders, not crowds",
      "Chosen one by one. Never open apply"
    ]
  },
  {
    id: "02",
    title: "Builders.",
    items: [
      "Engineers and researchers in serious AI",
      "Depth over demos. Craft that compounds",
      "Signal shared inside the circle first"
    ]
  },
  {
    id: "03",
    title: "Investors.",
    items: [
      "Angels and venture operators",
      "Early conviction, patient capital",
      "Access shaped by trust, not tickets"
    ]
  }
];
function HomeOpening() {
  return /* @__PURE__ */ jsxs(Fragment$1, { children: [
    /* @__PURE__ */ jsx(HeroInset, {}),
    /* @__PURE__ */ jsx(AboutIdea, {}),
    /* @__PURE__ */ jsx(FoundingSeats, {})
  ] });
}
function HeroInset() {
  return /* @__PURE__ */ jsx(
    "section",
    {
      className: "relative h-[100svh] p-2 sm:p-3 md:p-5 lg:p-6",
      style: { backgroundColor: HERO_CHROME },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative h-full w-full overflow-hidden border border-white/[0.08]",
          style: { backgroundColor: HERO_CHROME },
          children: [
            /* @__PURE__ */ jsx(
              HeroVideo,
              {
                src: HERO_VIDEO,
                className: "absolute inset-0 z-0 h-full w-full scale-[1.02] object-cover"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                "aria-hidden": true,
                className: "noise-overlay pointer-events-none absolute inset-0 z-[1] opacity-[0.55] mix-blend-overlay"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                "aria-hidden": true,
                className: "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/45 via-transparent to-black/70"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                "aria-hidden": true,
                className: "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              }
            ),
            /* @__PURE__ */ jsx(FloatingNavbar, {}),
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 bottom-0 z-10 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 sm:px-5 sm:pb-6 md:px-8 md:pb-9 lg:px-10", children: [
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { duration: 0.8, delay: 0.35, ease: EASE },
                  className: "mb-3 flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--bone)]/55 sm:mb-6 sm:gap-3 sm:text-[11px]",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "size-2 shrink-0 bg-[var(--inner-green)] animate-beacon sm:size-1.5" }),
                    "İstanbul → Global · Est. 2026"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 items-end gap-4 sm:gap-5 md:grid-cols-12 md:gap-10", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 md:col-span-8", children: [
                  /* @__PURE__ */ jsx("h1", { className: "text-[var(--bone)]", children: /* @__PURE__ */ jsx(
                    Lockup,
                    {
                      suffix: "hub",
                      className: "text-[var(--bone)]",
                      fontSize: "clamp(2.75rem, 14vw, 9.5rem)",
                      pulse: true
                    }
                  ) }),
                  /* @__PURE__ */ jsx("p", { className: "sr-only", children: "inner.hub private circle" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3.5 sm:gap-5 md:col-span-4 md:pb-3", children: [
                  /* @__PURE__ */ jsx(
                    motion.p,
                    {
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.8, delay: 0.5, ease: EASE },
                      className: "max-w-[36ch] text-[13px] leading-[1.45] text-[var(--bone)]/70 sm:text-sm md:text-[15px] md:leading-[1.35]",
                      children: "A private circle of founders, builders, and investors. Bound not by place or status, but by hunger to meet early and build what comes next."
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    motion.a,
                    {
                      href: "/invitation",
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.8, delay: 0.7, ease: EASE },
                      className: "group inline-flex w-full min-h-11 items-center justify-between gap-2.5 bg-[var(--bone)] py-1.5 pl-4 pr-1.5 text-sm font-medium text-black transition-[gap] duration-300 hover:gap-3.5 sm:w-fit sm:min-h-0 sm:pl-5 sm:text-base",
                      children: [
                        "Request an invitation",
                        /* @__PURE__ */ jsx("span", { className: "flex size-9 shrink-0 items-center justify-center bg-black transition-transform duration-300 group-hover:scale-110 sm:size-10", children: /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-4 text-[var(--bone)]", strokeWidth: 1.75 }) })
                      ]
                    }
                  )
                ] })
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function AboutIdea() {
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "section-01",
      className: "bg-[var(--ink)] px-3 py-12 sm:px-4 sm:py-16 md:px-6 md:py-28",
      children: /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-6xl overflow-hidden border border-white/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0 z-0", "aria-hidden": true, children: [
          /* @__PURE__ */ jsx(
            HeroVideo,
            {
              src: IDEA_VIDEO,
              className: "h-full w-full scale-[1.04] object-cover"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/55" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" }),
          /* @__PURE__ */ jsx("div", { className: "noise-overlay absolute inset-0 opacity-[0.3] mix-blend-overlay" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 px-5 py-14 text-center sm:px-8 sm:py-16 md:px-12 md:py-20", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-6 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/60 sm:mb-8 sm:text-xs", children: "01 · The idea" }),
          /* @__PURE__ */ jsx(
            WordsPullUpMultiStyle,
            {
              className: "mx-auto max-w-3xl justify-center text-3xl leading-[0.95] text-[var(--bone)] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl",
              segments: [
                { text: "AI is the center.", className: "font-normal" },
                {
                  text: "Around it: founders, builders, investors.",
                  className: "font-display font-serif italic"
                },
                {
                  text: "inner.hub brings them together early.",
                  className: "font-normal"
                }
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            ScrollTextReveal,
            {
              text: "It starts in İstanbul. Thirty-four people, chosen one by one, form the founding circle: not members of a platform, but the people who make what comes next possible.",
              className: "mx-auto mt-10 max-w-2xl text-xs leading-relaxed text-[var(--bone)]/70 sm:mt-12 sm:text-sm md:text-base"
            }
          )
        ] })
      ] })
    }
  );
}
function FoundingSeats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "section-02",
      ref,
      className: "relative min-h-0 overflow-hidden bg-black px-3 py-12 sm:px-4 sm:py-16 md:min-h-svh md:px-6 md:py-24",
      children: [
        /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 mx-auto max-w-7xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-10 max-w-3xl sm:mb-12 md:mb-14", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/50 sm:text-xs", children: "02 · The first thirty-four" }),
            /* @__PURE__ */ jsx(
              WordsPullUpMultiStyle,
              {
                className: "justify-start text-left text-xl leading-tight sm:text-2xl md:text-3xl lg:text-4xl",
                segments: [
                  {
                    text: "Founding seats for people who meet early.",
                    className: "font-normal text-[var(--bone)]"
                  },
                  {
                    text: "Not tickets. Not tiers. The circle.",
                    className: "font-normal text-white/40"
                  }
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1 lg:grid-cols-4 lg:h-[min(480px,70vh)]", children: [
            /* @__PURE__ */ jsxs(FeatureCard, { index: 0, inView, className: "relative min-h-[240px] overflow-hidden lg:min-h-0", children: [
              /* @__PURE__ */ jsx(HeroVideo, { src: FEATURE_VIDEO, className: "absolute inset-0 h-full w-full object-cover" }),
              /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }),
              /* @__PURE__ */ jsx(
                "p",
                {
                  className: "absolute bottom-4 left-4 right-4 font-medium sm:bottom-5 sm:left-5",
                  style: { color: "#F4F1EC" },
                  children: "Your circle starts here."
                }
              )
            ] }),
            SEAT_CARDS.map((card, i) => /* @__PURE__ */ jsxs(
              FeatureCard,
              {
                index: i + 1,
                inView,
                className: "flex min-h-[240px] flex-col bg-[#212121] p-4 sm:p-5 lg:min-h-0",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-white/40", children: card.id }),
                    /* @__PURE__ */ jsx("span", { className: "size-2.5 bg-[var(--inner-green)] animate-beacon", "aria-hidden": true })
                  ] }),
                  /* @__PURE__ */ jsx("h3", { className: "mb-4 text-lg font-medium text-[var(--bone)] sm:text-xl", children: card.title }),
                  /* @__PURE__ */ jsx("ul", { className: "flex flex-1 flex-col gap-2.5", children: card.items.map((item) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2.5 text-sm text-white/55", children: [
                    /* @__PURE__ */ jsx(
                      Check,
                      {
                        className: "mt-0.5 size-3.5 shrink-0 text-[var(--inner-green)]",
                        strokeWidth: 2
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { children: item })
                  ] }, item)) }),
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: "/invitation",
                      className: "mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/70 transition-colors hover:text-[var(--bone)]",
                      children: [
                        "Learn more",
                        /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5 -rotate-0", strokeWidth: 1.75 })
                      ]
                    }
                  )
                ]
              },
              card.id
            ))
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-8 max-w-2xl text-sm leading-relaxed text-white/50 sm:mt-10 sm:text-base", children: "These thirty-four are not just members. They are the founding members of inner.hub." })
        ] })
      ]
    }
  );
}
function FeatureCard({
  children,
  index,
  inView,
  className
}) {
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className,
      initial: { opacity: 0, scale: 0.95 },
      animate: inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 },
      transition: { duration: 0.65, delay: index * 0.15, ease: CARD_EASE },
      children
    }
  );
}
function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.4
    });
    let frame = 0;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled]);
}
function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 48);
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [inView, to]);
  return /* @__PURE__ */ jsxs("span", { ref, children: [
    val,
    suffix
  ] });
}
const MODULES = [
  {
    id: "signal",
    name: "inner·signal",
    desc: "AI-powered deal and opportunity feed. The right signals, before anyone else sees them.",
    icon: Zap,
    tag: "AI Layer"
  },
  {
    id: "match",
    name: "inner·match",
    desc: "Co-founder, mentor, and investor matching inside a closed circle. Trust-based connections.",
    icon: Users,
    tag: "Matching"
  },
  {
    id: "capital",
    name: "inner·capital",
    desc: "Private deal flow and investment pipeline. SPVs, demo days, and co-investment opportunities.",
    icon: TrendingUp,
    tag: "Investments"
  },
  {
    id: "vault",
    name: "inner·vault",
    desc: "Shared knowledge base. Pitch decks, market research, and documents. Permissioned and searchable.",
    icon: BookOpen,
    tag: "Knowledge"
  },
  {
    id: "pulse",
    name: "inner·pulse",
    desc: "Live ecosystem signal dashboard. What's moving, what's trending, what matters. Inside only.",
    icon: Radio,
    tag: "Intelligence"
  },
  {
    id: "id",
    name: "inner·id",
    desc: "Portable verified membership identity. Your inner.hub membership carries weight beyond the platform.",
    icon: Fingerprint,
    tag: "Identity"
  },
  {
    id: "api",
    name: "inner·api",
    desc: "Platform API for integrations and partners. Build on top of the inner.hub infrastructure.",
    icon: Code2,
    tag: "Platform"
  },
  {
    id: "bounty",
    name: "inner·bounty",
    desc: "Community task system. Companies post challenges, members solve them, platform facilitates.",
    icon: Target,
    tag: "Marketplace"
  }
];
const PLATFORM_FEATURES = [
  {
    id: "signal",
    name: "inner·signal",
    tag: "AI Layer",
    desc: "AI-powered deal and opportunity feed. The right signals, before anyone else sees them.",
    media: {
      type: "video",
      src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
    }
  },
  {
    id: "match",
    name: "inner·match",
    tag: "Matching",
    desc: "Co-founder, mentor, and investor matching inside a closed circle. Trust-based connections.",
    media: {
      type: "video",
      src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
    }
  },
  {
    id: "capital",
    name: "inner·capital",
    tag: "Investments",
    desc: "Private deal flow and investment pipeline. SPVs, demo days, and co-investment opportunities.",
    media: {
      type: "video",
      src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
    }
  }
];
const MARQUEE_MODULES = MODULES.map((m) => ({
  id: m.id,
  name: m.name,
  icon: m.icon,
  tag: m.tag
}));
function MarqueeStrip() {
  const loop = [...MARQUEE_MODULES, ...MARQUEE_MODULES, ...MARQUEE_MODULES];
  return /* @__PURE__ */ jsxs("div", { className: "relative z-10 overflow-hidden bg-[var(--ink)] py-3 sm:py-4", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--ink)] to-transparent sm:w-20"
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--ink)] to-transparent sm:w-20"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "relative mx-auto max-w-[100vw] overflow-hidden border-y border-white/10 bg-[var(--bone)] py-3.5 sm:py-4", children: /* @__PURE__ */ jsx(
      motion.div,
      {
        className: "flex w-max items-center gap-0",
        animate: { x: ["0%", "-33.333%"] },
        transition: { duration: 36, ease: "linear", repeat: Infinity },
        children: loop.map((item, i) => {
          const Icon = item.icon;
          return /* @__PURE__ */ jsxs(
            "a",
            {
              href: "#section-03",
              className: "group flex shrink-0 items-center gap-3 px-5 sm:gap-3.5 sm:px-7",
              children: [
                /* @__PURE__ */ jsx("span", { className: "flex size-7 items-center justify-center bg-[var(--ink)] transition-colors group-hover:bg-[var(--inner-green)] sm:size-8", children: /* @__PURE__ */ jsx(
                  Icon,
                  {
                    className: "size-3.5 text-[var(--bone)] transition-colors group-hover:text-[var(--ink)] sm:size-4",
                    strokeWidth: 1.6
                  }
                ) }),
                /* @__PURE__ */ jsxs("span", { className: "flex flex-col gap-0.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink)] sm:text-[11px]", children: item.name }),
                  /* @__PURE__ */ jsx("span", { className: "hidden font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--ink)]/40 sm:block", children: item.tag })
                ] }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    "aria-hidden": true,
                    className: "ml-5 size-1 shrink-0 bg-[var(--inner-green)] sm:ml-7"
                  }
                )
              ]
            },
            `${item.id}-${i}`
          );
        })
      }
    ) })
  ] });
}
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className: "fixed top-0 left-0 right-0 h-[2px] bg-[var(--inner-green)] origin-left z-[9999]",
      style: { scaleX: scrollYProgress }
    }
  );
}
function StatItem({ n, label, suffix = "" }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start", children: [
    /* @__PURE__ */ jsx("span", { className: "font-display font-serif italic text-4xl leading-none mb-2 text-[var(--bone)] sm:mb-3 sm:text-5xl md:text-7xl", children: /* @__PURE__ */ jsx(Counter, { to: n, suffix }) }),
    /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest opacity-40 text-[var(--bone)] sm:text-label", children: label })
  ] });
}
function Home() {
  useLenis(true);
  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    }
  }, []);
  return (
    // Sayfa içeriği neredeyse tamamen İngilizce (marka sesi); html[lang="tr"]
    // ile miras alınan Türkçe büyük-harf kuralları uppercase etiketlerdeki
    // İngilizce kelimeleri bozmasın diye kök seviyede lang="en" işaretlendi.
    /* @__PURE__ */ jsxs("div", { lang: "en", className: "min-h-screen bg-background text-foreground flex flex-col", children: [
      /* @__PURE__ */ jsx("a", { href: "#main-content", className: "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 font-mono text-xs uppercase tracking-widest", children: "Skip to content" }),
      /* @__PURE__ */ jsx(ScrollProgress, {}),
      /* @__PURE__ */ jsx(Preloader, {}),
      /* @__PURE__ */ jsx(Grain, {}),
      /* @__PURE__ */ jsx(IndexRail, {}),
      /* @__PURE__ */ jsxs("main", { id: "main-content", className: "flex-grow", children: [
        /* @__PURE__ */ jsx(HomeOpening, {}),
        /* @__PURE__ */ jsx(MarqueeStrip, {}),
        /* @__PURE__ */ jsx("section", { id: "section-03", children: /* @__PURE__ */ jsx(PlatformFeatures, { features: PLATFORM_FEATURES, restModules: MODULES.slice(3) }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden bg-black border-t border-border/15", children: [
          /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 top-0 h-[85vh] md:h-[95vh] z-0", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx(
              HeroVideo,
              {
                src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4",
                className: "h-full w-full object-cover"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black" })
          ] }),
          /* @__PURE__ */ jsxs("section", { id: "section-04", className: "relative z-10 px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 md:px-12 md:pt-36 lg:px-[10%]", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-10 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:mb-16 sm:gap-6 sm:pb-6 sm:text-xs", children: [
              /* @__PURE__ */ jsx("span", { children: "04 · What this is" }),
              /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: "The point" })
            ] }),
            /* @__PURE__ */ jsx(
              WordsPullUp,
              {
                text: "Big things start here.",
                className: "font-display font-serif italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--bone)] max-w-3xl mb-8 sm:mb-10 text-balance"
              }
            ),
            /* @__PURE__ */ jsx(
              ScrollTextReveal,
              {
                text: "New ideas are discussed here, tested here, and supported here by people who can actually build them and fund them.",
                className: "max-w-[46ch] text-[var(--bone)]",
                style: { fontSize: "clamp(17px, 2.4vw, 26px)", lineHeight: 1.55, opacity: 0.85 }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("section", { id: "section-05", className: "relative z-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-8 sm:pb-32 md:px-12 md:pb-48 lg:px-[10%]", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-10 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:mb-16 sm:gap-6 sm:pb-6 sm:text-xs", children: [
              /* @__PURE__ */ jsx("span", { children: "05 · Entry" }),
              /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: "By invitation" })
            ] }),
            /* @__PURE__ */ jsx(
              WordsPullUp,
              {
                text: "Entry is by invitation. Always.",
                className: "font-display font-serif italic text-3xl sm:text-4xl md:text-5xl max-w-2xl mb-6 sm:mb-8 text-balance text-[var(--bone)]"
              }
            ),
            /* @__PURE__ */ jsx(FadeIn, { delay: 0.2, children: /* @__PURE__ */ jsx("p", { className: "mb-12 max-w-[65ch] text-base leading-[1.7] text-[var(--bone)]/80 sm:mb-20 sm:text-lg", children: "There are no tickets, no tiers, and no public list. Members are put forward from inside the circle, considered with care, and invited personally." }) }),
            /* @__PURE__ */ jsx("div", { className: "max-w-3xl", children: [
              { label: "Your name", line: "Someone inside the circle puts your name forward." },
              { label: "Consideration", line: "We take our time. Fit beats fame." },
              { label: "Invitation", line: "If it is right, you hear from us directly." }
            ].map((item, i) => /* @__PURE__ */ jsx(FadeIn, { delay: i * 0.1, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 border-t border-white/15 py-5 last:border-b md:flex-row md:items-baseline md:gap-12 md:py-6", children: [
              /* @__PURE__ */ jsx("div", { className: "w-full flex-shrink-0 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:text-xs md:w-48", children: item.label }),
              /* @__PURE__ */ jsx("p", { className: "text-base text-[var(--bone)]/90 sm:text-lg", children: item.line })
            ] }) }, item.label)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "section",
          {
            id: "section-06",
            className: "relative overflow-hidden border-t border-border/15 bg-[var(--ink)] px-4 py-20 text-[var(--bone)] transition-colors duration-700 sm:px-6 sm:py-32 md:px-12 md:py-48 lg:px-[10%]",
            children: [
              /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-24 top-0 size-[520px] bg-[var(--inner-green)]/[0.04] blur-3xl" }),
              /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent" }),
              /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsxs("div", { className: "mb-12 flex items-baseline justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-widest opacity-60 sm:mb-20 sm:gap-6 sm:pb-6 sm:text-xs", children: [
                /* @__PURE__ */ jsx("span", { children: "06 · The gathering" }),
                /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: "Sep 2026 · İstanbul" })
              ] }) }),
              /* @__PURE__ */ jsx(
                WordsPullUp,
                {
                  text: "The first inner.hub gathering. İstanbul, September 2026.",
                  className: "mb-12 max-w-3xl text-balance font-display font-serif italic text-3xl sm:mb-20 sm:text-4xl md:mb-24 md:text-5xl lg:text-6xl"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "mb-12 flex flex-col gap-12 sm:mb-20 sm:gap-16 lg:mb-24 lg:flex-row lg:items-center", children: [
                /* @__PURE__ */ jsxs("div", { className: "grid min-w-0 grid-cols-3 gap-3 sm:gap-6 md:gap-10 lg:flex-1", children: [
                  /* @__PURE__ */ jsx(StatItem, { n: 34, label: "People" }),
                  /* @__PURE__ */ jsx(StatItem, { n: 2, label: "Days" }),
                  /* @__PURE__ */ jsx(StatItem, { n: 8, label: "Modules" })
                ] }),
                /* @__PURE__ */ jsx(FadeIn, { delay: 0.2, className: "flex-shrink-0", children: /* @__PURE__ */ jsx(DiagramCircle, {}) })
              ] }),
              /* @__PURE__ */ jsx(FadeIn, { delay: 0.15, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 sm:gap-8 md:flex-row md:items-end md:justify-between", children: [
                /* @__PURE__ */ jsx("p", { className: "max-w-2xl text-balance font-serif text-xl opacity-80 sm:text-2xl md:text-3xl", children: "Thirty-four people. Two days. One circle. The first of many." }),
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: "#section-07",
                    className: "group inline-flex min-h-11 items-center justify-center gap-2 border border-white/25 px-5 py-3 font-mono text-xs uppercase tracking-widest text-[var(--bone)] transition-colors hover:border-white/60 hover:bg-white hover:text-black sm:min-h-0 sm:justify-start",
                    children: [
                      "What's next",
                      /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" })
                    ]
                  }
                )
              ] }) })
            ]
          }
        ),
        /* @__PURE__ */ jsx(WhatsNextCinematic, {})
      ] }),
      /* @__PURE__ */ jsxs(
        "footer",
        {
          id: "site-footer",
          className: "relative overflow-hidden border-t border-white/10 bg-[var(--ink)] px-4 pb-8 pt-12 text-[var(--bone)] sm:px-6 sm:pt-16 md:px-12 md:pt-20 lg:px-[10%]",
          children: [
            /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -left-20 top-10 size-72 bg-[var(--inner-green)]/[0.05] blur-3xl" }),
            /* @__PURE__ */ jsxs("div", { className: "relative z-10 grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
                /* @__PURE__ */ jsx(Lockup, { className: "text-[var(--bone)]", fontSize: "clamp(28px, 4vw, 36px)", pulse: true }),
                /* @__PURE__ */ jsx("p", { className: "max-w-[36ch] text-sm font-light leading-relaxed text-[var(--bone)]/70", children: "A private circle for founders, operators, and investors who prefer signal over noise." }),
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: "mailto:destek@inner.digital",
                    className: "inline-flex items-center gap-2 font-mono text-label uppercase tracking-widest text-[var(--bone)]/55 transition-colors hover:text-[var(--bone)]",
                    children: [
                      /* @__PURE__ */ jsx(Mail, { className: "size-3.5" }),
                      "destek@inner.digital"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-label uppercase tracking-widest text-[var(--bone)]/40", children: "Navigate" }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-2.5", children: [
                  { label: "Platform", href: "#section-03" },
                  { label: "Gathering", href: "#section-06" },
                  { label: "What's next", href: "#section-07" },
                  { label: "Panel", href: "/panel" },
                  { label: "Invitation", href: "/invitation" }
                ].map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: l.href,
                    className: "font-mono text-caption uppercase tracking-widest text-[var(--bone)]/65 transition-colors hover:text-[var(--bone)]",
                    children: l.label
                  }
                ) }, l.href)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-label uppercase tracking-widest text-[var(--bone)]/40", children: "Connect" }),
                /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: "https://www.linkedin.com",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      "aria-label": "inner on LinkedIn",
                      className: "border border-white/15 p-2.5 text-[var(--bone)]/60 transition-colors hover:border-white/35 hover:text-[var(--bone)]",
                      children: /* @__PURE__ */ jsx(Linkedin, { size: 18, strokeWidth: 1.5 })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: "https://www.instagram.com",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      "aria-label": "inner on Instagram",
                      className: "border border-white/15 p-2.5 text-[var(--bone)]/60 transition-colors hover:border-white/35 hover:text-[var(--bone)]",
                      children: /* @__PURE__ */ jsx(Instagram, { size: 18, strokeWidth: 1.5 })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("p", { className: "font-mono text-label uppercase tracking-widest text-[var(--bone)]/35", children: "İstanbul → Global" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative z-10 mt-14 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-end md:justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "font-mono text-label uppercase tracking-widest text-[var(--bone)]/35", children: "© 2026 inner.hub · All rights reserved" }),
              /* @__PURE__ */ jsx("div", { className: "leading-none text-[var(--bone)]", "aria-hidden": "true", children: /* @__PURE__ */ jsx(Lockup, { fontSize: "clamp(2.75rem, 10vw, 7.5rem)", pulse: true }) })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "inner.hub" })
          ]
        }
      )
    ] })
  );
}
function render() {
  const queryClient = new QueryClient();
  return renderToString(
    /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsx(Router, { ssrPath: "/", children: /* @__PURE__ */ jsx(Home, {}) }) }) })
  );
}
export {
  render
};
