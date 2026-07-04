import React, { useEffect, useRef, useState } from "react";
import { Linkedin, Instagram, ArrowRight, Zap, Users, TrendingUp, BookOpen, Radio, Fingerprint, Code2, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useSubmitRequest } from "@workspace/api-client-react";
import { FadeIn } from "@/components/FadeIn";
import { SignatureMark } from "@/components/SignatureMark";
import { Lockup } from "@/components/Lockup";
import { LiveClock } from "@/components/LiveClock";
import { Grain } from "@/components/Grain";
import { IndexRail } from "@/components/IndexRail";
import { DiagramCircle } from "@/components/DiagramCircle";
import { Preloader } from "@/components/Preloader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  whoYouAre: z.string().min(1, "Please tell us who you are"),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  whoIntroduced: z.string().optional(),
  company: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const fieldClass =
  "rounded-none border-0 border-b border-border bg-transparent px-0 py-4 focus-visible:ring-0 focus-visible:border-foreground focus-visible:border-b-2 transition-[border-width]";

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
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

  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ label, meta }: { label: string; meta: string }) {
  return (
    <FadeIn>
      <div className="flex items-baseline justify-between gap-6 pb-6 mb-16 border-b border-border/20 font-mono text-xs uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-muted-foreground whitespace-nowrap">{meta}</span>
      </div>
    </FadeIn>
  );
}

// ─── Platform modules ─────────────────────────────────────────────────────────
const MODULES = [
  {
    id: "signal",
    name: "inner·signal",
    desc: "AI-powered deal and opportunity feed. The right signals, before anyone else sees them.",
    icon: Zap,
    tag: "AI Layer",
  },
  {
    id: "match",
    name: "inner·match",
    desc: "Co-founder, mentor, and investor matching inside a closed circle. Trust-based connections.",
    icon: Users,
    tag: "Matching",
  },
  {
    id: "capital",
    name: "inner·capital",
    desc: "Private deal flow and investment pipeline. SPVs, demo days, and co-investment opportunities.",
    icon: TrendingUp,
    tag: "Investments",
  },
  {
    id: "vault",
    name: "inner·vault",
    desc: "Shared knowledge base. Pitch decks, market research, and documents — permissioned and searchable.",
    icon: BookOpen,
    tag: "Knowledge",
  },
  {
    id: "pulse",
    name: "inner·pulse",
    desc: "Live ecosystem signal dashboard. What's moving, what's trending, what matters — inside only.",
    icon: Radio,
    tag: "Intelligence",
  },
  {
    id: "id",
    name: "inner·id",
    desc: "Portable verified membership identity. Your inner.hub membership carries weight beyond the platform.",
    icon: Fingerprint,
    tag: "Identity",
  },
  {
    id: "api",
    name: "inner·api",
    desc: "Platform API for integrations and partners. Build on top of the inner.hub infrastructure.",
    icon: Code2,
    tag: "Platform",
  },
  {
    id: "bounty",
    name: "inner·bounty",
    desc: "Community task system. Companies post challenges, members solve them, platform facilitates.",
    icon: Target,
    tag: "Marketplace",
  },
];

// ─── Marquee strip ────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "inner·signal", "inner·match", "inner·capital", "inner·vault",
  "inner·pulse", "inner·id", "inner·api", "inner·bounty",
];

function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden border-y border-border/15 py-4 bg-background">
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
      >
        {items.map((item, i) => (
          <span key={i} className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex-shrink-0">
            {item} <span className="text-[var(--inner-green)] ml-4">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--inner-green)] origin-left z-[9999]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

// ─── Module card ──────────────────────────────────────────────────────────────
function ModuleCard({ mod, index }: { mod: typeof MODULES[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = mod.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group border border-border/15 p-6 md:p-8 flex flex-col gap-4 hover:border-border/40 transition-colors duration-300 cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className="size-9 border border-border/20 flex items-center justify-center group-hover:border-[var(--inner-green)]/40 transition-colors duration-300">
          <Icon className="size-4 text-muted-foreground group-hover:text-[var(--ink)] transition-colors duration-300" strokeWidth={1.5} />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50 border border-border/15 px-2 py-1">
          {mod.tag}
        </span>
      </div>
      <div>
        <h3 className="font-serif italic text-xl mb-2 text-foreground/90 group-hover:text-foreground transition-colors duration-300">
          {mod.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
      </div>
      <div className="mt-auto pt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="h-[1px] flex-1 bg-[var(--inner-green)]/30" />
        <ArrowRight className="size-3 text-[var(--inner-green)]" />
      </div>
    </motion.div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatItem({ n, label, suffix = "" }: { n: number; label: string; suffix?: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="font-display font-serif italic text-5xl md:text-7xl leading-none mb-3 text-[var(--bone)]">
        <Counter to={n} suffix={suffix} />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 text-[var(--bone)]">{label}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const { mutate: submitRequest, isSuccess, isError, isPending } = useSubmitRequest();
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", whoYouAre: "", link: "", whoIntroduced: "", company: "" },
  });

  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    }
  }, []);

  const onSubmit = (data: FormValues) => {
    submitRequest({
      data: {
        name: data.name,
        email: data.email,
        whoYouAre: data.whoYouAre,
        link: data.link || null,
        whoIntroduced: data.whoIntroduced || null,
        company: data.company || null,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 font-mono text-xs uppercase tracking-widest">
        Skip to content
      </a>

      <ScrollProgress />
      <Preloader />
      <Grain />
      <IndexRail />

      {/* Header */}
      <header className="sticky top-0 z-50 h-[60px] md:h-[72px] px-6 md:px-12 lg:px-[10%] flex items-center justify-between bg-background/90 backdrop-blur-sm border-b border-border/20">
        <SignatureMark />
        <LiveClock />
      </header>

      <main id="main-content" className="flex-grow">

        {/* ── Hero ── */}
        <section ref={heroRef} className="h-[100svh] flex flex-col justify-center px-6 md:px-12 lg:px-[10%] relative overflow-hidden">
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ y: heroY }}
          >
            <div className="absolute top-1/2 right-[5%] -translate-y-1/2 size-[600px] rounded-full bg-[var(--inner-green)]/[0.025] blur-3xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-[var(--inner-green)] animate-beacon" />
              İstanbul → Global · Est. 2026
            </div>
            <h1 className="font-display font-serif italic text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-[18ch] text-balance">
              What comes next starts here.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12"
          >
            <p className="max-w-[50ch] text-lg md:text-xl text-foreground/80 leading-[1.6]">
              inner.hub is a private circle of founders, builders, and investors. People who meet early and support each other first.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute bottom-10 left-6 md:left-12 lg:left-[10%] flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              ↓
            </motion.div>
            <span>scroll</span>
          </motion.div>
        </section>

        {/* ── Marquee ── */}
        <MarqueeStrip />

        {/* ── 01 · The idea ── */}
        <section id="section-01" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="01 · The idea" meta="Coming together" />
          <FadeIn>
            <div className="max-w-[65ch] text-lg md:text-xl leading-[1.7] text-foreground/90">
              AI is the center of this circle. Around it are the founders, builders, and investors pushing what comes next. inner.hub brings them together. It starts in İstanbul, and it starts early.
            </div>
          </FadeIn>
        </section>

        {/* ── 02 · The first thirty-four ── */}
        <section id="section-02" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="02 · The first thirty-four" meta="Founding seats" />
          <FadeIn>
            <p className="max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-16">
              It starts with thirty-four people, chosen one by one:
            </p>
          </FadeIn>
          <div className="max-w-3xl mb-16">
            {[
              { label: "Founders", line: "People building startups, in AI and beyond." },
              { label: "Builders", line: "Engineers and researchers doing serious AI work." },
              { label: "Investors", line: "Angel investors and people from venture funds." },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-border/15 last:border-b">
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground w-full md:w-48 flex-shrink-0">{item.label}</div>
                  <p className="text-lg text-foreground/90">{item.line}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.2}>
            <p className="max-w-[65ch] text-lg leading-[1.7] text-foreground/90">
              These thirty-four are not just members. They are the founding members of inner.hub.
            </p>
          </FadeIn>
        </section>

        {/* ── 03 · The platform ── */}
        <section id="section-03" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="03 · The platform" meta="Eight tools" />
          <FadeIn>
            <h2 className="font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-4 text-balance">
              Everything a closed circle needs.
            </h2>
            <p className="max-w-[55ch] text-lg text-foreground/70 leading-[1.7] mb-16">
              Eight interconnected tools built for operators who move fast and think in systems.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border/15">
            {MODULES.map((mod, i) => (
              <div key={mod.id} className="bg-background">
                <ModuleCard mod={mod} index={i} />
              </div>
            ))}
          </div>
        </section>

        {/* ── 04 · What this is ── */}
        <section id="section-04" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="04 · What this is" meta="The point" />
          <FadeIn>
            <div
              className="max-w-[46ch] text-foreground/90"
              style={{ fontSize: "clamp(19px, 2.4vw, 26px)", lineHeight: 1.55 }}
            >
              <p>
                Big things start here. New ideas are discussed here, tested here, and supported here — by people who can actually build them and fund them.
              </p>
            </div>
          </FadeIn>
        </section>

        {/* ── 05 · Entry ── */}
        <section id="section-05" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="05 · Entry" meta="By invitation" />
          <FadeIn>
            <h2 className="font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-8 text-balance">
              Entry is by invitation. Always.
            </h2>
            <p className="max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-20">
              There are no tickets, no tiers, and no public list. Members are put forward from inside the circle, considered with care, and invited personally.
            </p>
          </FadeIn>
          <div className="max-w-3xl">
            {[
              { label: "Your name", line: "Someone inside the circle puts your name forward." },
              { label: "Consideration", line: "We take our time. Fit beats fame." },
              { label: "Invitation", line: "If it is right, you hear from us directly." },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-border/15 last:border-b">
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground w-full md:w-48 flex-shrink-0">{item.label}</div>
                  <p className="text-lg text-foreground/90">{item.line}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── 06 · The gathering (ink) ── */}
        <section
          id="section-06"
          className="px-6 md:px-12 lg:px-[10%] py-32 md:py-48 border-t border-border/15 bg-[var(--ink)] text-[var(--bone)] transition-colors duration-700 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 size-[500px] bg-[var(--inner-green)]/[0.03] blur-3xl pointer-events-none" />

          <FadeIn>
            <div className="flex items-baseline justify-between gap-6 pb-6 mb-20 border-b border-white/15 font-mono text-xs uppercase tracking-widest opacity-60">
              <span>06 · The gathering</span>
              <span className="whitespace-nowrap">Sep 2026 · İstanbul</span>
            </div>
            <h2 className="font-display font-serif italic text-4xl md:text-5xl lg:text-6xl max-w-3xl mb-24 text-balance">
              The first inner.hub gathering. İstanbul, September 2026.
            </h2>
          </FadeIn>

          <div className="flex flex-col lg:flex-row lg:items-center gap-16 mb-24">
            <div className="grid grid-cols-3 gap-6 md:gap-10 min-w-0 lg:flex-1">
              <StatItem n={34} label="People" />
              <StatItem n={2} label="Days" />
              <StatItem n={8} label="Modules" />
            </div>
            <FadeIn delay={0.2} className="flex-shrink-0">
              <DiagramCircle />
            </FadeIn>
          </div>

          <FadeIn delay={0.15}>
            <p className="font-serif text-2xl md:text-3xl max-w-2xl text-balance opacity-80">
              Thirty-four people. Two days. One circle. The first of many.
            </p>
          </FadeIn>
        </section>

        {/* ── 07 · What's next ── */}
        <section id="section-07" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="07 · What's next" meta="In time" />
          <FadeIn>
            <h2 className="font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-8 text-balance">
              hub is where it starts.
            </h2>
            <p
              className="max-w-[46ch] text-foreground/90"
              style={{ fontSize: "clamp(19px, 2.4vw, 26px)", lineHeight: 1.55 }}
            >
              We are building something bigger, step by step. We announce things when they are real. There is more.
            </p>
          </FadeIn>
        </section>

        {/* ── 08 · Request an invitation ── */}
        <section id="section-08" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="08 · Request an invitation" meta="We read everything" />

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl py-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-2 rounded-full bg-[var(--inner-green)] animate-beacon" />
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Received</span>
                </div>
                <h2 className="font-display font-serif italic text-4xl md:text-5xl text-balance">
                  If it fits, we will be in touch.
                </h2>
              </motion.div>
            ) : (
              <motion.div key="form">
                <FadeIn>
                  <div className="max-w-2xl">
                    <h2 className="font-display font-serif italic text-4xl md:text-5xl mb-6 text-balance">
                      Request an invitation.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-16 leading-[1.7]">
                      Most people arrive by invitation, but good people also find us on their own. Tell us who you are and what you are building.
                    </p>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-xs tracking-widest uppercase">Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" className={fieldClass} data-testid="input-name" {...field} />
                              </FormControl>
                              <FormMessage className="font-mono text-[10px] uppercase text-[var(--error)]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-xs tracking-widest uppercase">Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@example.com" className={fieldClass} data-testid="input-email" {...field} />
                              </FormControl>
                              <FormMessage className="font-mono text-[10px] uppercase text-[var(--error)]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="whoYouAre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-xs tracking-widest uppercase">Who you are / What you're building</FormLabel>
                              <FormControl>
                                <Textarea placeholder="A brief note on your work and intent." className={`${fieldClass} min-h-[120px] resize-none`} data-testid="input-who-you-are" {...field} />
                              </FormControl>
                              <FormMessage className="font-mono text-[10px] uppercase text-[var(--error)]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Link (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="LinkedIn or website" className={`${fieldClass} text-muted-foreground`} data-testid="input-link" {...field} />
                              </FormControl>
                              <FormMessage className="font-mono text-[10px] uppercase text-[var(--error)]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="whoIntroduced"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Who introduced you (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Name of your connection" className={`${fieldClass} text-muted-foreground`} data-testid="input-who-introduced" {...field} />
                              </FormControl>
                              <FormMessage className="font-mono text-[10px] uppercase text-[var(--error)]" />
                            </FormItem>
                          )}
                        />
                        <div className="sr-only" aria-hidden="true">
                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input tabIndex={-1} autoComplete="off" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        {isError && (
                          <div className="text-[var(--error)] font-mono text-xs uppercase tracking-widest" data-testid="text-error">
                            Something went wrong. Please try again.
                          </div>
                        )}
                        <div className="pt-8">
                          <Button
                            type="submit"
                            disabled={isPending}
                            className="group/btn relative overflow-hidden rounded-none bg-foreground text-background border border-foreground font-mono text-xs tracking-widest uppercase px-12 py-6 h-auto transition-colors duration-300"
                            data-testid="button-submit"
                          >
                            <span aria-hidden="true" className="absolute left-0 top-0 h-full w-2 bg-background -translate-x-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0" />
                            <span className="relative inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-1">
                              {isPending ? "Sending…" : "Send"}
                            </span>
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </FadeIn>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer id="site-footer" className="bg-[var(--ink)] px-6 md:px-12 lg:px-[10%] pt-20 pb-6 flex flex-col gap-16 overflow-hidden">
        <div className="flex flex-col gap-6">
          <img src="/inner-logo.png" alt="inner" width={140} height={140} className="w-[140px] h-[140px]" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] opacity-60">
              <span>The next wave knows each other · İstanbul → Global</span>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-5">
              <a href="#" aria-label="inner on LinkedIn" className="text-[var(--bone)] opacity-60 hover:opacity-100 transition-opacity duration-300">
                <Linkedin size={20} strokeWidth={1.5} />
              </a>
              <a href="#" aria-label="inner on Instagram" className="text-[var(--bone)] opacity-60 hover:opacity-100 transition-opacity duration-300">
                <Instagram size={20} strokeWidth={1.5} />
              </a>
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] opacity-30">
            © 2026 inner. İstanbul.
          </div>
        </div>
        <div className="text-[var(--bone)] leading-none -mb-4 md:-mb-8" aria-hidden="true">
          <Lockup showHub={false} fontSize="clamp(4rem, 16vw, 13rem)" />
        </div>
        <span className="sr-only">inner.</span>
      </footer>
    </div>
  );
}
