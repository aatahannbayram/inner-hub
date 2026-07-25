import { jsxDEV } from "react/jsx-dev-runtime";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { useRef, Fragment, useState, useEffect } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArrowRight, Zap, Users, TrendingUp, BookOpen, Radio, Fingerprint, Code2, Target, Linkedin, Instagram } from "lucide-react";
import { useReducedMotion, motion, useInView, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxDEV(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsxDEV(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/ui/tooltip.tsx",
    lineNumber: 19,
    columnNumber: 5
  },
  void 0
) }, void 0, false, {
  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/ui/tooltip.tsx",
  lineNumber: 18,
  columnNumber: 3
}, void 0));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const ease = [0.16, 1, 0.3, 1];
function FadeIn({
  children,
  className,
  delay = 0
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return /* @__PURE__ */ jsxDEV("div", { className, children }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FadeIn.tsx",
      lineNumber: 18,
      columnNumber: 12
    }, this);
  }
  return /* @__PURE__ */ jsxDEV(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-40px" },
      transition: { duration: 0.55, ease, delay: Math.min(delay, 0.3) },
      className,
      children
    },
    void 0,
    false,
    {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FadeIn.tsx",
      lineNumber: 22,
      columnNumber: 5
    },
    this
  );
}
const EASE = [0.16, 1, 0.3, 1];
function WordsPullUp({
  text,
  className,
  delay = 0
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const words = text.split(" ");
  if (reduce) {
    return /* @__PURE__ */ jsxDEV("h2", { className, children: text }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/WordsPullUp.tsx",
      lineNumber: 21,
      columnNumber: 12
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("h2", { ref, className, children: words.map((word, i) => /* @__PURE__ */ jsxDEV("span", { className: "inline-block overflow-hidden pb-1 pr-1 mr-[0.2em] last:mr-0 align-top", children: /* @__PURE__ */ jsxDEV(
    motion.span,
    {
      className: "inline-block",
      initial: { y: "100%", opacity: 0 },
      animate: inView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 },
      transition: { duration: 0.6, ease: EASE, delay: delay + i * 0.08 },
      children: word
    },
    void 0,
    false,
    {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/WordsPullUp.tsx",
      lineNumber: 28,
      columnNumber: 11
    },
    this
  ) }, i, false, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/WordsPullUp.tsx",
    lineNumber: 27,
    columnNumber: 9
  }, this)) }, void 0, false, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/WordsPullUp.tsx",
    lineNumber: 25,
    columnNumber: 5
  }, this);
}
function RevealChar({
  char,
  progress,
  range
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return /* @__PURE__ */ jsxDEV(motion.span, { style: { opacity }, children: char }, void 0, false, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/ScrollTextReveal.tsx",
    lineNumber: 14,
    columnNumber: 10
  }, this);
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
    return /* @__PURE__ */ jsxDEV("p", { className, style, children: text }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/ScrollTextReveal.tsx",
      lineNumber: 32,
      columnNumber: 7
    }, this);
  }
  const words = text.split(" ");
  const total = text.length;
  let charIndex = 0;
  return /* @__PURE__ */ jsxDEV("p", { ref, className, style, children: words.map((word, wi) => {
    const wordEl = /* @__PURE__ */ jsxDEV("span", { className: "inline-block", children: word.split("").map((char) => {
      const i = charIndex;
      charIndex += 1;
      return /* @__PURE__ */ jsxDEV(
        RevealChar,
        {
          char,
          progress: scrollYProgress,
          range: [i / total - 0.08, i / total + 0.04]
        },
        i,
        false,
        {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/ScrollTextReveal.tsx",
          lineNumber: 51,
          columnNumber: 17
        },
        this
      );
    }) }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/ScrollTextReveal.tsx",
      lineNumber: 46,
      columnNumber: 11
    }, this);
    const isLast = wi === words.length - 1;
    if (!isLast) charIndex += 1;
    return /* @__PURE__ */ jsxDEV(Fragment, { children: [
      wordEl,
      !isLast ? " " : null
    ] }, wi, true, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/ScrollTextReveal.tsx",
      lineNumber: 64,
      columnNumber: 11
    }, this);
  }) }, void 0, false, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/ScrollTextReveal.tsx",
    lineNumber: 43,
    columnNumber: 5
  }, this);
}
function Lockup({
  className = "",
  fontSize,
  showHub = true
}) {
  const textStyle = {
    fontFamily: "'Fraunces', serif",
    fontStyle: "normal",
    fontWeight: 100,
    fontVariationSettings: "'opsz' 144, 'WONK' 1",
    letterSpacing: "-0.015em",
    ...fontSize ? { fontSize } : {}
  };
  return /* @__PURE__ */ jsxDEV("span", { lang: "en", className: `inline-flex items-baseline gap-[0.15em] ${className}`, children: [
    /* @__PURE__ */ jsxDEV("span", { style: textStyle, children: "inner" }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/Lockup.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(
      "span",
      {
        className: "inline-block bg-[#18FF85] flex-shrink-0",
        style: { width: "0.42em", height: "0.42em", marginBottom: "0.05em" },
        "aria-hidden": "true"
      },
      void 0,
      false,
      {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/Lockup.tsx",
        lineNumber: 24,
        columnNumber: 7
      },
      this
    ),
    showHub && /* @__PURE__ */ jsxDEV("span", { style: textStyle, children: "hub" }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/Lockup.tsx",
      lineNumber: 29,
      columnNumber: 19
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/Lockup.tsx",
    lineNumber: 22,
    columnNumber: 5
  }, this);
}
function Grain() {
  return /* @__PURE__ */ jsxDEV("div", { className: "grain-overlay", "aria-hidden": "true" }, void 0, false, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/Grain.tsx",
    lineNumber: 2,
    columnNumber: 10
  }, this);
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
  return /* @__PURE__ */ jsxDEV(
    "nav",
    {
      "aria-label": "Section index",
      className: "hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4",
      children: SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return /* @__PURE__ */ jsxDEV(
          "a",
          {
            href: `#${id}`,
            className: "flex items-center gap-2 font-mono text-caption tabular-nums tracking-widest transition-opacity duration-500",
            style: { opacity: isActive ? 1 : 0.35 },
            children: [
              isActive && /* @__PURE__ */ jsxDEV(
                "span",
                {
                  className: "w-[5px] h-[5px] bg-[var(--inner-green)] flex-shrink-0",
                  "aria-hidden": "true"
                },
                void 0,
                false,
                {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/IndexRail.tsx",
                  lineNumber: 51,
                  columnNumber: 15
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("span", { className: isActive ? "text-foreground" : "text-muted-foreground", children: label }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/IndexRail.tsx",
                lineNumber: 56,
                columnNumber: 13
              }, this)
            ]
          },
          id,
          true,
          {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/IndexRail.tsx",
            lineNumber: 44,
            columnNumber: 11
          },
          this
        );
      })
    },
    void 0,
    false,
    {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/IndexRail.tsx",
      lineNumber: 37,
      columnNumber: 5
    },
    this
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
  return /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center gap-6", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsxDEV(
      "svg",
      {
        viewBox: `0 0 ${VIEWBOX} ${VIEWBOX}`,
        className: "w-full max-w-[320px] h-auto animate-diagram-spin",
        role: "presentation",
        focusable: "false",
        children: squares.map((s, i) => /* @__PURE__ */ jsxDEV(
          "rect",
          {
            x: s.x - SIZE / 2,
            y: s.y - SIZE / 2,
            width: SIZE,
            height: SIZE,
            fill: s.isGreen ? "var(--inner-green)" : "var(--bone)",
            opacity: s.isGreen ? 1 : 0.85
          },
          i,
          false,
          {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/DiagramCircle.tsx",
            lineNumber: 24,
            columnNumber: 11
          },
          this
        ))
      },
      void 0,
      false,
      {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/DiagramCircle.tsx",
        lineNumber: 17,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("span", { className: "font-mono text-label uppercase tracking-widest opacity-50", children: "34 · One circle" }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/DiagramCircle.tsx",
      lineNumber: 35,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "sr-only", children: "Thirty-four squares forming one circle." }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/DiagramCircle.tsx",
      lineNumber: 36,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/DiagramCircle.tsx",
    lineNumber: 16,
    columnNumber: 5
  }, this);
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
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      "aria-hidden": "true",
      className: "fixed inset-0 z-[9998] bg-[var(--ink)] flex items-center justify-center",
      style: {
        transition: "transform 400ms var(--ease-expo), visibility 0ms 400ms",
        transform: phase === "out" ? "translateY(-110%)" : "translateY(0)",
        visibility: phase === "out" ? "hidden" : "visible"
      },
      children: /* @__PURE__ */ jsxDEV(
        "span",
        {
          className: "w-[14px] h-[14px] bg-[var(--inner-green)]",
          style: {
            animation: phase === "in" ? "preloader-pulse 500ms ease-in-out" : void 0
          }
        },
        void 0,
        false,
        {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/Preloader.tsx",
          lineNumber: 37,
          columnNumber: 7
        },
        this
      )
    },
    void 0,
    false,
    {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/Preloader.tsx",
      lineNumber: 28,
      columnNumber: 5
    },
    this
  );
}
const LINKS = [
  { label: "Platform", href: "#section-03" },
  { label: "Gathering", href: "#section-06" },
  { label: "Panel", href: "/panel" }
];
function FloatingNavbar() {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxDEV("div", { className: "absolute top-6 left-1/2 z-50 -translate-x-1/2", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between gap-8 border border-[var(--ink)]/10 bg-[var(--bone)] px-5 py-3 shadow-lg", children: [
      /* @__PURE__ */ jsxDEV("a", { href: "/", className: "inline-flex", children: /* @__PURE__ */ jsxDEV(Lockup, { className: "text-[var(--ink)]", fontSize: "18px" }, void 0, false, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FloatingNavbar.tsx",
        lineNumber: 17,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FloatingNavbar.tsx",
        lineNumber: 16,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          "aria-label": open ? "Menüyü kapat" : "Menüyü aç",
          "aria-expanded": open,
          onClick: () => setOpen((v) => !v),
          className: "relative flex h-4 w-5 flex-col items-center justify-between",
          children: [
            /* @__PURE__ */ jsxDEV(
              "span",
              {
                className: "block h-[1.5px] w-full bg-[var(--ink)] transition-transform duration-300",
                style: {
                  transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                  transform: open ? "translateY(6.5px) rotate(45deg)" : "none"
                }
              },
              void 0,
              false,
              {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FloatingNavbar.tsx",
                lineNumber: 26,
                columnNumber: 11
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "span",
              {
                className: "block h-[1.5px] w-full bg-[var(--ink)] transition-transform duration-300",
                style: {
                  transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                  transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none"
                }
              },
              void 0,
              false,
              {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FloatingNavbar.tsx",
                lineNumber: 33,
                columnNumber: 11
              },
              this
            )
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FloatingNavbar.tsx",
          lineNumber: 19,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FloatingNavbar.tsx",
      lineNumber: 15,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(
      "div",
      {
        className: `absolute left-1/2 top-[calc(100%+10px)] w-56 -translate-x-1/2 border border-[var(--ink)]/10 bg-[var(--bone)] shadow-lg transition-all duration-300 ${open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`,
        children: LINKS.map((link) => /* @__PURE__ */ jsxDEV(
          "a",
          {
            href: link.href,
            onClick: () => setOpen(false),
            className: "block border-b border-[var(--ink)]/10 px-5 py-3 font-mono text-xs uppercase tracking-widest text-[var(--ink-strong)] transition-colors last:border-b-0 hover:text-[var(--ink)]",
            children: link.label
          },
          link.label,
          false,
          {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FloatingNavbar.tsx",
            lineNumber: 51,
            columnNumber: 11
          },
          this
        ))
      },
      void 0,
      false,
      {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FloatingNavbar.tsx",
        lineNumber: 43,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, true, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/FloatingNavbar.tsx",
    lineNumber: 14,
    columnNumber: 5
  }, this);
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
    return /* @__PURE__ */ jsxDEV("img", { src: resolvedPoster, alt: "", "aria-hidden": "true", className, style }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/HeroVideo.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this);
  }
  return /* @__PURE__ */ jsxDEV(
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
    },
    void 0,
    false,
    {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/HeroVideo.tsx",
      lineNumber: 54,
      columnNumber: 5
    },
    this
  );
}
function FeatureCard({ feature, index, setRef }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      ref: (el) => {
        ref.current = el;
        setRef(el);
      },
      "data-feature-index": index,
      className: `border border-[var(--bone)]/15 bg-[var(--bone)]/[0.06] p-6 backdrop-blur-sm transition-all duration-700 ease-out md:p-10 ${inView ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`,
      children: [
        /* @__PURE__ */ jsxDEV("p", { className: "mb-4 font-mono text-label uppercase tracking-widest text-[var(--bone)]/57", children: feature.tag }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 30,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "mb-6 font-serif text-xl italic text-[var(--bone)] md:text-2xl", children: feature.name }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 31,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mb-6 aspect-video overflow-hidden bg-black/30", children: feature.media.type === "video" ? /* @__PURE__ */ jsxDEV(
          HeroVideo,
          {
            src: feature.media.src,
            poster: posterForVideo(feature.media.src),
            className: "size-full object-cover"
          },
          void 0,
          false,
          {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
            lineNumber: 34,
            columnNumber: 11
          },
          this
        ) : /* @__PURE__ */ jsxDEV("img", { src: feature.media.src, alt: feature.name, className: "size-full object-cover", loading: "lazy" }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 40,
          columnNumber: 11
        }, this) }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 32,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm leading-relaxed text-[var(--bone)]/60 md:text-base", children: feature.desc }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 43,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
      lineNumber: 20,
      columnNumber: 5
    },
    this
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
  return /* @__PURE__ */ jsxDEV("div", { className: "bg-[var(--ink)] px-6 py-20 text-[var(--bone)] md:px-12 md:py-40 lg:px-[10%] lg:py-48", children: /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 gap-16 lg:grid-cols-[400px_1fr] lg:gap-24 xl:grid-cols-[460px_1fr] xl:gap-48", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:py-32", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "mb-4 font-mono text-xs uppercase tracking-widest text-[var(--bone)]/57", children: "03 · The platform" }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 85,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("h2", { className: "font-display font-serif italic text-2xl leading-[1.2] sm:text-3xl lg:text-[46px]", children: "Built for the pace of a closed circle." }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 88,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
        lineNumber: 84,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-12 hidden flex-col gap-2 lg:flex", children: features.map((f, i) => /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          onClick: () => scrollToCard(i),
          className: `border px-4 py-3 text-left font-mono text-xs uppercase tracking-widest transition-colors ${activeIndex === i ? "border-[var(--bone)]/20 bg-[var(--bone)]/10 text-[var(--bone)]" : "border-transparent text-[var(--bone)]/57 hover:text-[var(--bone)]/70"}`,
          children: f.name
        },
        f.id,
        false,
        {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 95,
          columnNumber: 15
        },
        this
      )) }, void 0, false, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
        lineNumber: 93,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-12 hidden lg:block", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "mb-4 text-sm text-[var(--bone)]/60", children: "Access is by invitation. Always." }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 111,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          "a",
          {
            href: "/invitation",
            className: "inline-flex items-center gap-2 border border-[var(--bone)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[var(--bone)] transition-colors hover:bg-[var(--bone)] hover:text-[var(--ink)]",
            children: [
              "Request an invitation ",
              /* @__PURE__ */ jsxDEV(ArrowRight, { className: "size-3" }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
                lineNumber: 116,
                columnNumber: 37
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
            lineNumber: 112,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
        lineNumber: 110,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
      lineNumber: 83,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-6", children: [
      features.map((f, i) => /* @__PURE__ */ jsxDEV(
        FeatureCard,
        {
          feature: f,
          index: i,
          setRef: (el) => {
            if (el) cardRefs.current.set(i, el);
            else cardRefs.current.delete(i);
          }
        },
        f.id,
        false,
        {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 124,
          columnNumber: 13
        },
        this
      )),
      restModules.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "mt-6 border-t border-[var(--bone)]/15 pt-10", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "mb-6 font-mono text-label uppercase tracking-widest text-[var(--bone)]/57", children: [
          "+",
          restModules.length,
          " more tools"
        ] }, void 0, true, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 137,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 gap-px bg-[var(--bone)]/10 sm:grid-cols-2", children: restModules.map((mod) => {
          const Icon = mod.icon;
          return /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-3 bg-[var(--ink)] p-6", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxDEV(Icon, { className: "size-4 text-[var(--bone)]/50", strokeWidth: 1.5 }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
                lineNumber: 146,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "font-mono text-label uppercase tracking-widest text-[var(--bone)]/47", children: mod.tag }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
                lineNumber: 147,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
              lineNumber: 145,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("h4", { className: "font-serif italic text-lg text-[var(--bone)]/90", children: mod.name }, void 0, false, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
              lineNumber: 151,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm leading-relaxed text-[var(--bone)]/50", children: mod.desc }, void 0, false, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
              lineNumber: 152,
              columnNumber: 23
            }, this)
          ] }, mod.id, true, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
            lineNumber: 144,
            columnNumber: 21
          }, this);
        }) }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
          lineNumber: 140,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
        lineNumber: 136,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
      lineNumber: 122,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
    lineNumber: 81,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/PlatformFeatures.tsx",
    lineNumber: 80,
    columnNumber: 5
  }, this);
}
const STANDARD_CHARS = " .:-=+*#%@";
function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function applyContrastBrightness(lum, brightness, contrast) {
  const factor = contrast / 100;
  const v = (lum - 0.5) * factor + 0.5 + brightness / 100;
  return Math.min(1, Math.max(0, v));
}
function ProceduralPortrait({
  src,
  config,
  className
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let disposed = false;
    let luminance = null;
    let cols = 0;
    let rows = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssW = 0;
    let cssH = 0;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    const {
      renderMode,
      bgMode,
      bgColor = "#0A0A0A",
      bgBlur = 12,
      bgOpacity = 60,
      cellSize,
      coverage,
      invert = false,
      charSet = STANDARD_CHARS,
      brightness = 0,
      contrast = 100,
      saturation = 100,
      grayscale = 0,
      tint = "#18FF85",
      tintOpacity = 0,
      overlayBlend = "screen",
      color = "#18FF85",
      pfx = {},
      animStyle = "flicker",
      animSpeed = 60,
      animIntensity = 50
    } = config;
    const sampleLuminance = () => {
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = cols;
      sampleCanvas.height = rows;
      const sctx = sampleCanvas.getContext("2d");
      if (!sctx) return;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cssW / cssH;
      let dw = cssW;
      let dh = cssH;
      let dx = 0;
      let dy = 0;
      if (imgRatio > canvasRatio) {
        dh = cssH;
        dw = cssH * imgRatio;
        dx = (cssW - dw) / 2;
      } else {
        dw = cssW;
        dh = cssW / imgRatio;
        dy = (cssH - dh) / 2;
      }
      sctx.drawImage(img, dx * (cols / cssW), dy * (rows / cssH), dw * (cols / cssW), dh * (rows / cssH));
      const data = sctx.getImageData(0, 0, cols, rows).data;
      luminance = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const r = data[i * 4] / 255;
        const g = data[i * 4 + 1] / 255;
        const b = data[i * 4 + 2] / 255;
        let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        lum = applyContrastBrightness(lum, brightness, contrast);
        luminance[i] = invert ? 1 - lum : lum;
      }
    };
    const resize = () => {
      const rect = container.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.ceil(cssW / cellSize));
      rows = Math.max(1, Math.ceil(cssH / cellSize));
      if (img.complete && img.naturalWidth > 0) sampleLuminance();
    };
    const drawBackground = () => {
      ctx.save();
      ctx.filter = `saturate(${saturation}%) grayscale(${grayscale}%)`;
      if (bgMode === "solid") {
        ctx.filter = "none";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cssW, cssH);
      } else {
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = cssW / cssH;
        let dw = cssW;
        let dh = cssH;
        let dx = 0;
        let dy = 0;
        if (imgRatio > canvasRatio) {
          dh = cssH;
          dw = cssH * imgRatio;
          dx = (cssW - dw) / 2;
        } else {
          dw = cssW;
          dh = cssW / imgRatio;
          dy = (cssH - dh) / 2;
        }
        ctx.filter += ` blur(${bgBlur}px)`;
        ctx.globalAlpha = bgOpacity / 100;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    };
    const drawCharacters = (t) => {
      if (!luminance) return;
      ctx.save();
      ctx.font = `${Math.round(cellSize * 0.95)}px "SF Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const ramp = charSet;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cellSeed = hash(x, y);
          if (cellSeed * 100 > coverage) continue;
          const lum = luminance[y * cols + x];
          const flicker = animStyle === "flicker" ? 1 - animIntensity / 100 * 0.35 * (0.5 + 0.5 * Math.sin(t * (animSpeed / 20) + cellSeed * 12)) : 1;
          const idx = Math.min(ramp.length - 1, Math.floor(lum * flicker * (ramp.length - 1)));
          const ch = ramp[idx];
          if (ch === " ") continue;
          ctx.globalAlpha = Math.min(1, lum * flicker + 0.08);
          ctx.fillStyle = color;
          ctx.fillText(ch, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
        }
      }
      ctx.restore();
    };
    const drawContour = (t) => {
      if (!luminance) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const amplitude = cellSize * 0.9;
      const waveAmp = animStyle === "wave" ? animIntensity / 100 * cellSize * 0.5 : 0;
      const waveFreq = animSpeed / 4e3;
      const sampleStep = Math.max(2, Math.floor(cellSize / 6));
      for (let ry = 0; ry < rows; ry++) {
        const rowSeed = hash(ry, 7.3);
        if (rowSeed * 100 > coverage) continue;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px <= cssW; px += sampleStep) {
          const gx = Math.min(cols - 1, Math.floor(px / cellSize));
          const lum = luminance[ry * cols + gx];
          const wave = Math.sin(px * 0.012 + t * waveFreq * 60 + ry * 0.6) * waveAmp;
          const baseY = ry * cellSize + cellSize / 2;
          const py = baseY - (lum - 0.5) * amplitude + wave;
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.globalAlpha = 0.3 + 0.4 * hash(ry, 2.1);
        ctx.stroke();
      }
      ctx.restore();
    };
    const drawTint = () => {
      if (!tintOpacity) return;
      ctx.save();
      ctx.globalCompositeOperation = overlayBlend;
      ctx.globalAlpha = tintOpacity / 100;
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.restore();
    };
    const drawVignette = () => {
      const v = pfx.vignette;
      if (!v?.enabled) return;
      ctx.save();
      const grad = ctx.createRadialGradient(
        cssW / 2,
        cssH / 2,
        Math.min(cssW, cssH) * 0.25,
        cssW / 2,
        cssH / 2,
        Math.max(cssW, cssH) * 0.75
      );
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `rgba(0,0,0,${v.intensity / 100})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.restore();
    };
    const drawScanLines = () => {
      const s = pfx.scanLines;
      if (!s?.enabled) return;
      ctx.save();
      ctx.globalAlpha = s.intensity / 100;
      ctx.fillStyle = "#000000";
      for (let y = 0; y < cssH; y += 3) {
        ctx.fillRect(0, y, cssW, 1);
      }
      ctx.restore();
    };
    const drawBloom = () => {
      const b = pfx.bloom;
      if (!b?.enabled) return;
      ctx.save();
      ctx.filter = "blur(6px)";
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = b.intensity / 100;
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, cssW, cssH);
      ctx.restore();
    };
    const render2 = (t) => {
      if (disposed) return;
      ctx.clearRect(0, 0, cssW, cssH);
      drawBackground();
      if (renderMode === "characters") drawCharacters(t / 1e3);
      else drawContour(t / 1e3);
      drawTint();
      drawBloom();
      drawVignette();
      drawScanLines();
      raf = requestAnimationFrame(render2);
    };
    const onResize = () => resize();
    img.onload = () => {
      resize();
      raf = requestAnimationFrame(render2);
    };
    if (img.complete && img.naturalWidth > 0) {
      resize();
      raf = requestAnimationFrame(render2);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [src]);
  return /* @__PURE__ */ jsxDEV("div", { ref: containerRef, className, children: /* @__PURE__ */ jsxDEV("canvas", { ref: canvasRef, className: "block h-full w-full" }, void 0, false, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/panel/ProceduralPortrait.tsx",
    lineNumber: 343,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/components/panel/ProceduralPortrait.tsx",
    lineNumber: 342,
    columnNumber: 5
  }, this);
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
const PHOSPHOR_CONFIG = {
  renderMode: "characters",
  bgMode: "solid",
  bgColor: "#000000",
  cellSize: 9,
  coverage: 100,
  invert: false,
  charSet: " .:-=+*#%@",
  brightness: 0,
  contrast: 115,
  saturation: 100,
  grayscale: 0,
  tint: "#33ff99",
  tintOpacity: 18,
  overlayBlend: "screen",
  color: "#18FF85",
  pfx: {
    vignette: { enabled: true, intensity: 50 },
    scanLines: { enabled: true, intensity: 45 },
    bloom: { enabled: true, intensity: 25 }
  },
  animStyle: "flicker",
  animSpeed: 100,
  animIntensity: 60
};
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
  return /* @__PURE__ */ jsxDEV("span", { ref, children: [
    val,
    suffix
  ] }, void 0, true, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
    lineNumber: 62,
    columnNumber: 10
  }, this);
}
function SectionLabel({ label, meta }) {
  return /* @__PURE__ */ jsxDEV(FadeIn, { children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-baseline justify-between gap-6 pb-6 mb-16 border-b border-border/20 font-mono text-xs uppercase tracking-widest", children: [
    /* @__PURE__ */ jsxDEV("span", { children: label }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
      lineNumber: 70,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground whitespace-nowrap", children: meta }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
      lineNumber: 71,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
    lineNumber: 69,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
    lineNumber: 68,
    columnNumber: 5
  }, this);
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
    desc: "Shared knowledge base. Pitch decks, market research, and documents — permissioned and searchable.",
    icon: BookOpen,
    tag: "Knowledge"
  },
  {
    id: "pulse",
    name: "inner·pulse",
    desc: "Live ecosystem signal dashboard. What's moving, what's trending, what matters — inside only.",
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
const MARQUEE_ITEMS = [
  "inner·signal",
  "inner·match",
  "inner·capital",
  "inner·vault",
  "inner·pulse",
  "inner·id",
  "inner·api",
  "inner·bounty"
];
function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return /* @__PURE__ */ jsxDEV("div", { className: "relative z-10 overflow-hidden border-y border-border/15 py-4 bg-background", children: /* @__PURE__ */ jsxDEV(
    motion.div,
    {
      className: "flex gap-16 whitespace-nowrap",
      animate: { x: ["0%", "-50%"] },
      transition: { duration: 24, ease: "linear", repeat: Infinity },
      children: items.map((item, i) => /* @__PURE__ */ jsxDEV("span", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground flex-shrink-0", children: [
        item,
        " ",
        /* @__PURE__ */ jsxDEV("span", { className: "text-[var(--success-ink)] ml-4", children: "·" }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 187,
          columnNumber: 20
        }, this)
      ] }, i, true, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
        lineNumber: 186,
        columnNumber: 11
      }, this))
    },
    void 0,
    false,
    {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
      lineNumber: 180,
      columnNumber: 7
    },
    this
  ) }, void 0, false, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
    lineNumber: 179,
    columnNumber: 5
  }, this);
}
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return /* @__PURE__ */ jsxDEV(
    motion.div,
    {
      className: "fixed top-0 left-0 right-0 h-[2px] bg-[var(--inner-green)] origin-left z-[9999]",
      style: { scaleX: scrollYProgress }
    },
    void 0,
    false,
    {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
      lineNumber: 199,
      columnNumber: 5
    },
    this
  );
}
function StatItem({ n, label, suffix = "" }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-start", children: [
    /* @__PURE__ */ jsxDEV("span", { className: "font-display font-serif italic text-5xl md:text-7xl leading-none mb-3 text-[var(--bone)]", children: /* @__PURE__ */ jsxDEV(Counter, { to: n, suffix }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
      lineNumber: 211,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
      lineNumber: 210,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "font-mono text-label uppercase tracking-widest opacity-40 text-[var(--bone)]", children: label }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
      lineNumber: 213,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
    lineNumber: 209,
    columnNumber: 5
  }, this);
}
function Home() {
  useLenis(true);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);
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
    /* @__PURE__ */ jsxDEV("div", { lang: "en", className: "min-h-screen bg-background text-foreground flex flex-col", children: [
      /* @__PURE__ */ jsxDEV("a", { href: "#main-content", className: "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 font-mono text-xs uppercase tracking-widest", children: "Skip to content" }, void 0, false, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
        lineNumber: 237,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ jsxDEV(ScrollProgress, {}, void 0, false, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
        lineNumber: 241,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ jsxDEV(Preloader, {}, void 0, false, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
        lineNumber: 242,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ jsxDEV(Grain, {}, void 0, false, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
        lineNumber: 243,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ jsxDEV(IndexRail, {}, void 0, false, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
        lineNumber: 244,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ jsxDEV("main", { id: "main-content", className: "flex-grow", children: [
        /* @__PURE__ */ jsxDEV("section", { ref: heroRef, className: "h-[100svh] mb-[-3rem] flex flex-col justify-end px-6 pb-16 md:px-12 md:pb-24 lg:px-[10%] relative overflow-hidden bg-black text-white", children: [
          /* @__PURE__ */ jsxDEV(FloatingNavbar, {}, void 0, false, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 250,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV(
            HeroVideo,
            {
              src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4",
              className: "absolute inset-0 z-0 h-full w-full object-cover"
            },
            void 0,
            false,
            {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 251,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "div",
            {
              "aria-hidden": "true",
              className: "bottom-blur-mask pointer-events-none absolute inset-0 z-[1] bg-black/20 backdrop-blur-xl"
            },
            void 0,
            false,
            {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 255,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "div",
            {
              "aria-hidden": "true",
              className: "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-transparent"
            },
            void 0,
            false,
            {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 259,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            motion.div,
            {
              className: "absolute inset-0 z-[1] pointer-events-none",
              style: { y: heroY },
              children: /* @__PURE__ */ jsxDEV("div", { className: "absolute top-1/2 right-[5%] -translate-y-1/2 size-[600px] rounded-full bg-[var(--inner-green)]/10 blur-3xl" }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 268,
                columnNumber: 13
              }, this)
            },
            void 0,
            false,
            {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 264,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            motion.div,
            {
              initial: { opacity: 0, y: 24 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              className: "relative z-10",
              children: [
                /* @__PURE__ */ jsxDEV("div", { className: "font-mono text-xs uppercase tracking-widest text-white/60 mb-8 flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "size-1.5 rounded-full bg-[var(--inner-green)] animate-beacon" }, void 0, false, {
                    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                    lineNumber: 278,
                    columnNumber: 15
                  }, this),
                  "İstanbul → Global · Est. 2026"
                ] }, void 0, true, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 277,
                  columnNumber: 13
                }, this),
                /* @__PURE__ */ jsxDEV("h1", { className: "font-display font-serif italic text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-[18ch] text-balance", children: "What comes next starts here." }, void 0, false, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 281,
                  columnNumber: 13
                }, this)
              ]
            },
            void 0,
            true,
            {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 271,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            motion.div,
            {
              initial: { opacity: 0, y: 24 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
              className: "relative z-10 mt-12",
              children: /* @__PURE__ */ jsxDEV("p", { className: "max-w-[50ch] text-lg md:text-xl text-white/70 leading-[1.6]", children: "inner.hub is a private circle of founders, builders, and investors. People who meet early and support each other first." }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 292,
                columnNumber: 13
              }, this)
            },
            void 0,
            false,
            {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 286,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            motion.div,
            {
              initial: { opacity: 0, y: 24 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
              className: "relative z-10 mt-8",
              children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4 border border-white/15 bg-black/25 py-1 pl-6 pr-1 backdrop-blur-md", children: [
                /* @__PURE__ */ jsxDEV("p", { className: "hidden text-sm font-medium text-white sm:block", children: "No tickets. No tiers. Just the circle, gently curated." }, void 0, false, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 304,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium text-white sm:hidden", children: "No tickets. No tiers." }, void 0, false, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 307,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV(
                  "a",
                  {
                    href: "/invitation",
                    className: "whitespace-nowrap bg-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90",
                    children: "Request an invitation"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                    lineNumber: 308,
                    columnNumber: 15
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 303,
                columnNumber: 13
              }, this)
            },
            void 0,
            false,
            {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 297,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { duration: 0.8, delay: 0.5 },
              className: "absolute bottom-10 left-6 md:left-12 lg:left-[10%] z-10 flex items-center gap-2 font-mono text-label uppercase tracking-widest text-white/60",
              children: [
                /* @__PURE__ */ jsxDEV(
                  motion.div,
                  {
                    animate: { y: [0, 6, 0] },
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    children: "↓"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                    lineNumber: 323,
                    columnNumber: 13
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV("span", { children: "scroll" }, void 0, false, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 329,
                  columnNumber: 13
                }, this)
              ]
            },
            void 0,
            true,
            {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 317,
              columnNumber: 11
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 249,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV(MarqueeStrip, {}, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 334,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("section", { id: "section-01", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
          /* @__PURE__ */ jsxDEV(SectionLabel, { label: "01 · The idea", meta: "Coming together" }, void 0, false, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 338,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV(FadeIn, { children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-[65ch] text-lg md:text-xl leading-[1.7] text-foreground/90", children: "AI is the center of this circle. Around it are the founders, builders, and investors pushing what comes next. inner.hub brings them together. It starts in İstanbul, and it starts early." }, void 0, false, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 340,
            columnNumber: 13
          }, this) }, void 0, false, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 339,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 337,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("section", { id: "section-02", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
          /* @__PURE__ */ jsxDEV(SectionLabel, { label: "02 · The first thirty-four", meta: "Founding seats" }, void 0, false, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 348,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12 md:gap-16 items-start", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV(FadeIn, { children: /* @__PURE__ */ jsxDEV("p", { className: "max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-16", children: "It starts with thirty-four people, chosen one by one:" }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 352,
                columnNumber: 17
              }, this) }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 351,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "max-w-3xl mb-16", children: [
                { label: "Founders", line: "People building startups, in AI and beyond." },
                { label: "Builders", line: "Engineers and researchers doing serious AI work." },
                { label: "Investors", line: "Angel investors and people from venture funds." }
              ].map((item, i) => /* @__PURE__ */ jsxDEV(FadeIn, { delay: i * 0.1, children: /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-border/15 last:border-b", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground w-full md:w-48 flex-shrink-0", children: item.label }, void 0, false, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 364,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-lg text-foreground/90", children: item.line }, void 0, false, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 365,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 363,
                columnNumber: 21
              }, this) }, item.label, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 362,
                columnNumber: 19
              }, this)) }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 356,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV(FadeIn, { delay: 0.2, children: /* @__PURE__ */ jsxDEV("p", { className: "max-w-[65ch] text-lg leading-[1.7] text-foreground/90", children: "These thirty-four are not just members. They are the founding members of inner.hub." }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 371,
                columnNumber: 17
              }, this) }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 370,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 350,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV(FadeIn, { delay: 0.15, children: /* @__PURE__ */ jsxDEV("div", { className: "relative aspect-[519/1002] overflow-hidden border border-border/15 bg-black", children: [
              /* @__PURE__ */ jsxDEV(
                ProceduralPortrait,
                {
                  src: "/editorial/circle-portrait.jpg",
                  config: PHOSPHOR_CONFIG,
                  className: "size-full"
                },
                void 0,
                false,
                {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 379,
                  columnNumber: 17
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 via-transparent to-transparent" }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 384,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "pointer-events-none absolute bottom-4 left-4 font-mono text-label uppercase tracking-widest text-[#18FF85]/70", children: "Signal · Founding member" }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 385,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 378,
              columnNumber: 15
            }, this) }, void 0, false, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 377,
              columnNumber: 13
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 349,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 347,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("section", { id: "section-03", children: /* @__PURE__ */ jsxDEV(PlatformFeatures, { features: PLATFORM_FEATURES, restModules: MODULES.slice(3) }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 395,
          columnNumber: 11
        }, this) }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 394,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "relative overflow-hidden bg-black border-t border-border/15", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-x-0 top-0 h-[85vh] md:h-[95vh] z-0", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsxDEV(
              HeroVideo,
              {
                src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4",
                className: "h-full w-full object-cover"
              },
              void 0,
              false,
              {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 401,
                columnNumber: 13
              },
              this
            ),
            /* @__PURE__ */ jsxDEV("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black" }, void 0, false, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 405,
              columnNumber: 13
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 400,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("section", { id: "section-04", className: "relative z-10 px-6 md:px-12 lg:px-[10%] pt-28 md:pt-36 pb-24", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-baseline justify-between gap-6 pb-6 mb-16 border-b border-white/15 font-mono text-xs uppercase tracking-widest text-white/50", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "04 · What this is" }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 411,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "whitespace-nowrap", children: "The point" }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 412,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 410,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV(
              WordsPullUp,
              {
                text: "Big things start here.",
                className: "font-display font-serif italic text-4xl md:text-5xl lg:text-6xl text-[var(--bone)] max-w-3xl mb-10 text-balance"
              },
              void 0,
              false,
              {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 414,
                columnNumber: 13
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              ScrollTextReveal,
              {
                text: "New ideas are discussed here, tested here, and supported here — by people who can actually build them and fund them.",
                className: "max-w-[46ch] text-[var(--bone)]",
                style: { fontSize: "clamp(19px, 2.4vw, 26px)", lineHeight: 1.55, opacity: 0.85 }
              },
              void 0,
              false,
              {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 418,
                columnNumber: 13
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 409,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("section", { id: "section-05", className: "relative z-10 px-6 md:px-12 lg:px-[10%] pt-8 pb-32 md:pb-48", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-baseline justify-between gap-6 pb-6 mb-16 border-b border-white/15 font-mono text-xs uppercase tracking-widest text-white/50", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "05 · Entry" }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 428,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "whitespace-nowrap", children: "By invitation" }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 429,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 427,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV(
              WordsPullUp,
              {
                text: "Entry is by invitation. Always.",
                className: "font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-8 text-balance text-[var(--bone)]"
              },
              void 0,
              false,
              {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 431,
                columnNumber: 13
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(FadeIn, { delay: 0.2, children: /* @__PURE__ */ jsxDEV("p", { className: "max-w-[65ch] text-lg leading-[1.7] text-[var(--bone)]/80 mb-20", children: "There are no tickets, no tiers, and no public list. Members are put forward from inside the circle, considered with care, and invited personally." }, void 0, false, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 436,
              columnNumber: 15
            }, this) }, void 0, false, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 435,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "max-w-3xl", children: [
              { label: "Your name", line: "Someone inside the circle puts your name forward." },
              { label: "Consideration", line: "We take our time. Fit beats fame." },
              { label: "Invitation", line: "If it is right, you hear from us directly." }
            ].map((item, i) => /* @__PURE__ */ jsxDEV(FadeIn, { delay: i * 0.1, children: /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-white/15 last:border-b", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "font-mono text-xs uppercase tracking-widest text-white/50 w-full md:w-48 flex-shrink-0", children: item.label }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 448,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-lg text-[var(--bone)]/90", children: item.line }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 449,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 447,
              columnNumber: 19
            }, this) }, item.label, false, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 446,
              columnNumber: 17
            }, this)) }, void 0, false, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 440,
              columnNumber: 13
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 426,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 399,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV(
          "section",
          {
            id: "section-06",
            className: "px-6 md:px-12 lg:px-[10%] py-32 md:py-48 border-t border-border/15 bg-[var(--ink)] text-[var(--bone)] transition-colors duration-700 overflow-hidden relative",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 right-0 size-[500px] bg-[var(--inner-green)]/[0.03] blur-3xl pointer-events-none" }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 462,
                columnNumber: 11
              }, this),
              /* @__PURE__ */ jsxDEV(FadeIn, { children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-baseline justify-between gap-6 pb-6 mb-20 border-b border-white/15 font-mono text-xs uppercase tracking-widest opacity-60", children: [
                /* @__PURE__ */ jsxDEV("span", { children: "06 · The gathering" }, void 0, false, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 466,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "whitespace-nowrap", children: "Sep 2026 · İstanbul" }, void 0, false, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 467,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 465,
                columnNumber: 13
              }, this) }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 464,
                columnNumber: 11
              }, this),
              /* @__PURE__ */ jsxDEV(
                WordsPullUp,
                {
                  text: "The first inner.hub gathering. İstanbul, September 2026.",
                  className: "font-display font-serif italic text-4xl md:text-5xl lg:text-6xl max-w-3xl mb-24 text-balance"
                },
                void 0,
                false,
                {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 470,
                  columnNumber: 11
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col lg:flex-row lg:items-center gap-16 mb-24", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-6 md:gap-10 min-w-0 lg:flex-1", children: [
                  /* @__PURE__ */ jsxDEV(StatItem, { n: 34, label: "People" }, void 0, false, {
                    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                    lineNumber: 477,
                    columnNumber: 15
                  }, this),
                  /* @__PURE__ */ jsxDEV(StatItem, { n: 2, label: "Days" }, void 0, false, {
                    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                    lineNumber: 478,
                    columnNumber: 15
                  }, this),
                  /* @__PURE__ */ jsxDEV(StatItem, { n: 8, label: "Modules" }, void 0, false, {
                    fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                    lineNumber: 479,
                    columnNumber: 15
                  }, this)
                ] }, void 0, true, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 476,
                  columnNumber: 13
                }, this),
                /* @__PURE__ */ jsxDEV(FadeIn, { delay: 0.2, className: "flex-shrink-0", children: /* @__PURE__ */ jsxDEV(DiagramCircle, {}, void 0, false, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 482,
                  columnNumber: 15
                }, this) }, void 0, false, {
                  fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                  lineNumber: 481,
                  columnNumber: 13
                }, this)
              ] }, void 0, true, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 475,
                columnNumber: 11
              }, this),
              /* @__PURE__ */ jsxDEV(FadeIn, { delay: 0.15, children: /* @__PURE__ */ jsxDEV("p", { className: "font-serif text-2xl md:text-3xl max-w-2xl text-balance opacity-80", children: "Thirty-four people. Two days. One circle. The first of many." }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 487,
                columnNumber: 13
              }, this) }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 486,
                columnNumber: 11
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 458,
            columnNumber: 9
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("section", { id: "section-07", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
          /* @__PURE__ */ jsxDEV(SectionLabel, { label: "07 · What's next", meta: "In time" }, void 0, false, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 495,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV(
            WordsPullUp,
            {
              text: "hub is where it starts.",
              className: "font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-8 text-balance"
            },
            void 0,
            false,
            {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 496,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(FadeIn, { delay: 0.2, children: /* @__PURE__ */ jsxDEV(
            "p",
            {
              className: "max-w-[46ch] text-foreground/90",
              style: { fontSize: "clamp(19px, 2.4vw, 26px)", lineHeight: 1.55 },
              children: "We are building something bigger, step by step. We announce things when they are real. There is more."
            },
            void 0,
            false,
            {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 501,
              columnNumber: 13
            },
            this
          ) }, void 0, false, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 500,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 494,
          columnNumber: 9
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
        lineNumber: 246,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ jsxDEV("footer", { id: "site-footer", className: "bg-[var(--ink)] px-6 md:px-12 lg:px-[10%] pt-20 pb-6 flex flex-col gap-16 overflow-hidden", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxDEV("img", { src: "/inner-logo.png", alt: "inner", width: 140, height: 140, className: "w-[140px] h-[140px]" }, void 0, false, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 515,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap gap-x-5 gap-y-2 font-mono text-label uppercase tracking-widest text-[var(--bone)] opacity-60", children: /* @__PURE__ */ jsxDEV("span", { children: "The next wave knows each other · İstanbul → Global" }, void 0, false, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 518,
              columnNumber: 15
            }, this) }, void 0, false, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 517,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-center md:justify-end gap-5", children: [
              /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "inner on LinkedIn", className: "text-[var(--bone)] opacity-60 hover:opacity-100 transition-opacity duration-300", children: /* @__PURE__ */ jsxDEV(Linkedin, { size: 20, strokeWidth: 1.5 }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 522,
                columnNumber: 17
              }, this) }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 521,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "inner on Instagram", className: "text-[var(--bone)] opacity-60 hover:opacity-100 transition-opacity duration-300", children: /* @__PURE__ */ jsxDEV(Instagram, { size: 20, strokeWidth: 1.5 }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 525,
                columnNumber: 17
              }, this) }, void 0, false, {
                fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
                lineNumber: 524,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
              lineNumber: 520,
              columnNumber: 13
            }, this)
          ] }, void 0, true, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 516,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "font-mono text-label uppercase tracking-widest text-[var(--bone)] opacity-30", children: "© 2026 inner. İstanbul." }, void 0, false, {
            fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
            lineNumber: 529,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 514,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-[var(--bone)] leading-none -mb-4 md:-mb-8", "aria-hidden": "true", children: /* @__PURE__ */ jsxDEV(Lockup, { showHub: false, fontSize: "clamp(4rem, 16vw, 13rem)" }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 534,
          columnNumber: 11
        }, this) }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 533,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "sr-only", children: "inner." }, void 0, false, {
          fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
          lineNumber: 536,
          columnNumber: 9
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
        lineNumber: 513,
        columnNumber: 7
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/pages/Home.tsx",
      lineNumber: 236,
      columnNumber: 5
    }, this)
  );
}
function render() {
  const queryClient = new QueryClient();
  return renderToString(
    /* @__PURE__ */ jsxDEV(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxDEV(TooltipProvider, { children: /* @__PURE__ */ jsxDEV(Router, { ssrPath: "/", children: /* @__PURE__ */ jsxDEV(Home, {}, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/entry-server.tsx",
      lineNumber: 13,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/entry-server.tsx",
      lineNumber: 12,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/entry-server.tsx",
      lineNumber: 11,
      columnNumber: 7
    }, this) }, void 0, false, {
      fileName: "/Users/macbookpro/Desktop/Inner-Hub/artifacts/inner-hub/src/entry-server.tsx",
      lineNumber: 10,
      columnNumber: 5
    }, this)
  );
}
export {
  render
};
