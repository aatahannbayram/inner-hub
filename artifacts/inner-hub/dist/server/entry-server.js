import { jsx, jsxs } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
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
      transition: { duration: 0.55, ease, delay },
      className,
      children
    }
  );
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
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-baseline gap-[0.15em] ${className}`, children: [
    /* @__PURE__ */ jsx("span", { style: textStyle, children: "inner" }),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "inline-block bg-[#18FF85] flex-shrink-0",
        style: { width: "0.42em", height: "0.42em", marginBottom: "0.05em" },
        "aria-hidden": "true"
      }
    ),
    showHub && /* @__PURE__ */ jsx("span", { style: textStyle, children: "hub" })
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
            className: "flex items-center gap-2 font-mono text-[11px] tabular-nums tracking-widest transition-opacity duration-500",
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
    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest opacity-50", children: "34 · One circle" }),
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
const LINKS = [
  { label: "Platform", href: "#section-03" },
  { label: "Gathering", href: "#section-06" },
  { label: "Panel", href: "/panel" }
];
function FloatingNavbar() {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "absolute top-6 left-1/2 z-50 -translate-x-1/2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-8 border border-[var(--ink)]/10 bg-[var(--bone)] px-5 py-3 shadow-lg", children: [
      /* @__PURE__ */ jsx("a", { href: "/", className: "inline-flex", children: /* @__PURE__ */ jsx(Lockup, { className: "text-[var(--ink)]", fontSize: "18px" }) }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          "aria-label": open ? "Menüyü kapat" : "Menüyü aç",
          "aria-expanded": open,
          onClick: () => setOpen((v) => !v),
          className: "relative flex h-4 w-5 flex-col items-center justify-between",
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "block h-[1.5px] w-full bg-[var(--ink)] transition-transform duration-300",
                style: {
                  transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                  transform: open ? "translateY(6.5px) rotate(45deg)" : "none"
                }
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "block h-[1.5px] w-full bg-[var(--ink)] transition-transform duration-300",
                style: {
                  transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
                  transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none"
                }
              }
            )
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `absolute left-1/2 top-[calc(100%+10px)] w-56 -translate-x-1/2 border border-[var(--ink)]/10 bg-[var(--bone)] shadow-lg transition-all duration-300 ${open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`,
        children: LINKS.map((link) => /* @__PURE__ */ jsx(
          "a",
          {
            href: link.href,
            onClick: () => setOpen(false),
            className: "block border-b border-[var(--ink)]/10 px-5 py-3 font-mono text-xs uppercase tracking-widest text-[var(--ink)]/70 transition-colors last:border-b-0 hover:text-[var(--ink)]",
            children: link.label
          },
          link.label
        ))
      }
    )
  ] });
}
function FeatureCard({ feature, index, setRef }) {
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
        /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/40", children: feature.tag }),
        /* @__PURE__ */ jsx("h3", { className: "mb-6 font-serif text-xl italic text-[var(--bone)] md:text-2xl", children: feature.name }),
        /* @__PURE__ */ jsx("div", { className: "mb-6 aspect-video overflow-hidden bg-black/30", children: feature.media.type === "video" ? /* @__PURE__ */ jsx(
          "video",
          {
            src: feature.media.src,
            autoPlay: true,
            muted: true,
            loop: true,
            playsInline: true,
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
        /* @__PURE__ */ jsx("p", { className: "mb-4 font-mono text-xs uppercase tracking-widest text-[var(--bone)]/40", children: "03 · The platform" }),
        /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-2xl leading-[1.2] sm:text-3xl lg:text-[46px]", children: "Built for the pace of a closed circle." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 hidden flex-col gap-2 lg:flex", children: features.map((f, i) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => scrollToCard(i),
          className: `border px-4 py-3 text-left font-mono text-xs uppercase tracking-widest transition-colors ${activeIndex === i ? "border-[var(--bone)]/20 bg-[var(--bone)]/10 text-[var(--bone)]" : "border-transparent text-[var(--bone)]/40 hover:text-[var(--bone)]/70"}`,
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
        FeatureCard,
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
        /* @__PURE__ */ jsxs("p", { className: "mb-6 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/40", children: [
          "+",
          restModules.length,
          " more tools"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-px bg-[var(--bone)]/10 sm:grid-cols-2", children: restModules.map((mod) => {
          const Icon = mod.icon;
          return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 bg-[var(--ink)] p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Icon, { className: "size-4 text-[var(--bone)]/50", strokeWidth: 1.5 }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-[var(--bone)]/30", children: mod.tag })
            ] }),
            /* @__PURE__ */ jsx("h4", { className: "font-serif italic text-lg text-[var(--bone)]/90", children: mod.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-[var(--bone)]/50", children: mod.desc })
          ] }, mod.id);
        }) })
      ] })
    ] })
  ] }) });
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
function SectionLabel({ label, meta }) {
  return /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-6 pb-6 mb-16 border-b border-border/20 font-mono text-xs uppercase tracking-widest", children: [
    /* @__PURE__ */ jsx("span", { children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground whitespace-nowrap", children: meta })
  ] }) });
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
    media: { type: "image", src: "/editorial/circle-portrait.jpg" }
  },
  {
    id: "capital",
    name: "inner·capital",
    tag: "Investments",
    desc: "Private deal flow and investment pipeline. SPVs, demo days, and co-investment opportunities.",
    media: { type: "image", src: "/editorial/circle-dusk.png" }
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
  return /* @__PURE__ */ jsx("div", { className: "relative z-10 overflow-hidden border-y border-border/15 py-4 bg-background", children: /* @__PURE__ */ jsx(
    motion.div,
    {
      className: "flex gap-16 whitespace-nowrap",
      animate: { x: ["0%", "-50%"] },
      transition: { duration: 24, ease: "linear", repeat: Infinity },
      children: items.map((item, i) => /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground flex-shrink-0", children: [
        item,
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--inner-green)] ml-4", children: "·" })
      ] }, i))
    }
  ) });
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
    /* @__PURE__ */ jsx("span", { className: "font-display font-serif italic text-5xl md:text-7xl leading-none mb-3 text-[var(--bone)]", children: /* @__PURE__ */ jsx(Counter, { to: n, suffix }) }),
    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest opacity-40 text-[var(--bone)]", children: label })
  ] });
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground flex flex-col", children: [
    /* @__PURE__ */ jsx("a", { href: "#main-content", className: "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 font-mono text-xs uppercase tracking-widest", children: "Skip to content" }),
    /* @__PURE__ */ jsx(ScrollProgress, {}),
    /* @__PURE__ */ jsx(Preloader, {}),
    /* @__PURE__ */ jsx(Grain, {}),
    /* @__PURE__ */ jsx(IndexRail, {}),
    /* @__PURE__ */ jsxs("main", { id: "main-content", className: "flex-grow", children: [
      /* @__PURE__ */ jsxs("section", { ref: heroRef, className: "h-[100svh] mb-[-3rem] flex flex-col justify-end px-6 pb-16 md:px-12 md:pb-24 lg:px-[10%] relative overflow-hidden bg-black text-white", children: [
        /* @__PURE__ */ jsx(FloatingNavbar, {}),
        /* @__PURE__ */ jsx(
          "video",
          {
            autoPlay: true,
            muted: true,
            loop: true,
            playsInline: true,
            className: "absolute inset-0 z-0 h-full w-full object-cover",
            src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "bottom-blur-mask pointer-events-none absolute inset-0 z-[1] bg-black/20 backdrop-blur-xl"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-transparent"
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "absolute inset-0 z-[1] pointer-events-none",
            style: { y: heroY },
            children: /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 right-[5%] -translate-y-1/2 size-[600px] rounded-full bg-[var(--inner-green)]/10 blur-3xl" })
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 24 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            className: "relative z-10",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs uppercase tracking-widest text-white/60 mb-8 flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-[var(--inner-green)] animate-beacon" }),
                "İstanbul → Global · Est. 2026"
              ] }),
              /* @__PURE__ */ jsx("h1", { className: "font-display font-serif italic text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-[18ch] text-balance", children: "What comes next starts here." })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 24 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
            className: "relative z-10 mt-12",
            children: /* @__PURE__ */ jsx("p", { className: "max-w-[50ch] text-lg md:text-xl text-white/70 leading-[1.6]", children: "inner.hub is a private circle of founders, builders, and investors. People who meet early and support each other first." })
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 24 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
            className: "relative z-10 mt-8",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 border border-white/15 bg-black/25 py-1 pl-6 pr-1 backdrop-blur-md", children: [
              /* @__PURE__ */ jsx("p", { className: "hidden text-sm font-medium text-white sm:block", children: "No tickets. No tiers. Just the circle, gently curated." }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white sm:hidden", children: "No tickets. No tiers." }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "/invitation",
                  className: "whitespace-nowrap bg-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90",
                  children: "Request an invitation"
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.8, delay: 0.5 },
            className: "absolute bottom-10 left-6 md:left-12 lg:left-[10%] z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60",
            children: [
              /* @__PURE__ */ jsx(
                motion.div,
                {
                  animate: { y: [0, 6, 0] },
                  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  children: "↓"
                }
              ),
              /* @__PURE__ */ jsx("span", { children: "scroll" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(MarqueeStrip, {}),
      /* @__PURE__ */ jsxs("section", { id: "section-01", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "01 · The idea", meta: "Coming together" }),
        /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsx("div", { className: "max-w-[65ch] text-lg md:text-xl leading-[1.7] text-foreground/90", children: "AI is the center of this circle. Around it are the founders, builders, and investors pushing what comes next. inner.hub brings them together. It starts in İstanbul, and it starts early." }) })
      ] }),
      /* @__PURE__ */ jsxs("section", { id: "section-02", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "02 · The first thirty-four", meta: "Founding seats" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12 md:gap-16 items-start", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsx("p", { className: "max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-16", children: "It starts with thirty-four people, chosen one by one:" }) }),
            /* @__PURE__ */ jsx("div", { className: "max-w-3xl mb-16", children: [
              { label: "Founders", line: "People building startups, in AI and beyond." },
              { label: "Builders", line: "Engineers and researchers doing serious AI work." },
              { label: "Investors", line: "Angel investors and people from venture funds." }
            ].map((item, i) => /* @__PURE__ */ jsx(FadeIn, { delay: i * 0.1, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-border/15 last:border-b", children: [
              /* @__PURE__ */ jsx("div", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground w-full md:w-48 flex-shrink-0", children: item.label }),
              /* @__PURE__ */ jsx("p", { className: "text-lg text-foreground/90", children: item.line })
            ] }) }, item.label)) }),
            /* @__PURE__ */ jsx(FadeIn, { delay: 0.2, children: /* @__PURE__ */ jsx("p", { className: "max-w-[65ch] text-lg leading-[1.7] text-foreground/90", children: "These thirty-four are not just members. They are the founding members of inner.hub." }) })
          ] }),
          /* @__PURE__ */ jsx(FadeIn, { delay: 0.15, children: /* @__PURE__ */ jsxs("div", { className: "relative aspect-[519/1002] overflow-hidden border border-border/15 bg-black", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: "/editorial/circle-portrait.jpg",
                alt: "A founding member of the circle",
                className: "size-full object-cover",
                loading: "lazy"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("section", { id: "section-03", children: /* @__PURE__ */ jsx(PlatformFeatures, { features: PLATFORM_FEATURES, restModules: MODULES.slice(3) }) }),
      /* @__PURE__ */ jsxs("section", { id: "section-04", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "04 · What this is", meta: "The point" }),
        /* @__PURE__ */ jsx(FadeIn, { children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "max-w-[46ch] text-foreground/90",
            style: { fontSize: "clamp(19px, 2.4vw, 26px)", lineHeight: 1.55 },
            children: /* @__PURE__ */ jsx("p", { children: "Big things start here. New ideas are discussed here, tested here, and supported here — by people who can actually build them and fund them." })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("section", { id: "section-05", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "05 · Entry", meta: "By invitation" }),
        /* @__PURE__ */ jsxs(FadeIn, { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-8 text-balance", children: "Entry is by invitation. Always." }),
          /* @__PURE__ */ jsx("p", { className: "max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-20", children: "There are no tickets, no tiers, and no public list. Members are put forward from inside the circle, considered with care, and invited personally." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-w-3xl", children: [
          { label: "Your name", line: "Someone inside the circle puts your name forward." },
          { label: "Consideration", line: "We take our time. Fit beats fame." },
          { label: "Invitation", line: "If it is right, you hear from us directly." }
        ].map((item, i) => /* @__PURE__ */ jsx(FadeIn, { delay: i * 0.1, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-border/15 last:border-b", children: [
          /* @__PURE__ */ jsx("div", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground w-full md:w-48 flex-shrink-0", children: item.label }),
          /* @__PURE__ */ jsx("p", { className: "text-lg text-foreground/90", children: item.line })
        ] }) }, item.label)) })
      ] }),
      /* @__PURE__ */ jsxs(
        "section",
        {
          id: "section-06",
          className: "px-6 md:px-12 lg:px-[10%] py-32 md:py-48 border-t border-border/15 bg-[var(--ink)] text-[var(--bone)] transition-colors duration-700 overflow-hidden relative",
          children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 size-[500px] bg-[var(--inner-green)]/[0.03] blur-3xl pointer-events-none" }),
            /* @__PURE__ */ jsxs(FadeIn, { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-6 pb-6 mb-20 border-b border-white/15 font-mono text-xs uppercase tracking-widest opacity-60", children: [
                /* @__PURE__ */ jsx("span", { children: "06 · The gathering" }),
                /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: "Sep 2026 · İstanbul" })
              ] }),
              /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-4xl md:text-5xl lg:text-6xl max-w-3xl mb-24 text-balance", children: "The first inner.hub gathering. İstanbul, September 2026." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center gap-16 mb-24", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-6 md:gap-10 min-w-0 lg:flex-1", children: [
                /* @__PURE__ */ jsx(StatItem, { n: 34, label: "People" }),
                /* @__PURE__ */ jsx(StatItem, { n: 2, label: "Days" }),
                /* @__PURE__ */ jsx(StatItem, { n: 8, label: "Modules" })
              ] }),
              /* @__PURE__ */ jsx(FadeIn, { delay: 0.2, className: "flex-shrink-0", children: /* @__PURE__ */ jsx(DiagramCircle, {}) })
            ] }),
            /* @__PURE__ */ jsx(FadeIn, { delay: 0.15, children: /* @__PURE__ */ jsx("p", { className: "font-serif text-2xl md:text-3xl max-w-2xl text-balance opacity-80", children: "Thirty-four people. Two days. One circle. The first of many." }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("section", { id: "section-07", className: "px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15", children: [
        /* @__PURE__ */ jsx(SectionLabel, { label: "07 · What's next", meta: "In time" }),
        /* @__PURE__ */ jsxs(FadeIn, { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-8 text-balance", children: "hub is where it starts." }),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "max-w-[46ch] text-foreground/90",
              style: { fontSize: "clamp(19px, 2.4vw, 26px)", lineHeight: 1.55 },
              children: "We are building something bigger, step by step. We announce things when they are real. There is more."
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("footer", { id: "site-footer", className: "bg-[var(--ink)] px-6 md:px-12 lg:px-[10%] pt-20 pb-6 flex flex-col gap-16 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsx("img", { src: "/inner-logo.png", alt: "inner", width: 140, height: 140, className: "w-[140px] h-[140px]" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] opacity-60", children: /* @__PURE__ */ jsx("span", { children: "The next wave knows each other · İstanbul → Global" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center md:justify-end gap-5", children: [
            /* @__PURE__ */ jsx("a", { href: "#", "aria-label": "inner on LinkedIn", className: "text-[var(--bone)] opacity-60 hover:opacity-100 transition-opacity duration-300", children: /* @__PURE__ */ jsx(Linkedin, { size: 20, strokeWidth: 1.5 }) }),
            /* @__PURE__ */ jsx("a", { href: "#", "aria-label": "inner on Instagram", className: "text-[var(--bone)] opacity-60 hover:opacity-100 transition-opacity duration-300", children: /* @__PURE__ */ jsx(Instagram, { size: 20, strokeWidth: 1.5 }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] opacity-30", children: "© 2026 inner. İstanbul." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-[var(--bone)] leading-none -mb-4 md:-mb-8", "aria-hidden": "true", children: /* @__PURE__ */ jsx(Lockup, { showHub: false, fontSize: "clamp(4rem, 16vw, 13rem)" }) }),
      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "inner." })
    ] })
  ] });
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
