import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitRequest } from "@workspace/api-client-react";
import { FadeIn } from "@/components/FadeIn";
import { SignatureMark } from "@/components/SignatureMark";
import { Lockup } from "@/components/Lockup";
import { LiveClock } from "@/components/LiveClock";
import { Grain } from "@/components/Grain";
import { IndexRail } from "@/components/IndexRail";
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
  company: z.string().optional(), // Honeypot
});

type FormValues = z.infer<typeof formSchema>;

const fieldClass =
  "rounded-none border-0 border-b border-border bg-transparent px-0 py-4 focus-visible:ring-0 focus-visible:border-foreground focus-visible:border-b-2 transition-[border-width]";

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

export default function Home() {
  const { mutate: submitRequest, isSuccess, isError, isPending } = useSubmitRequest();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      whoYouAre: "",
      link: "",
      whoIntroduced: "",
      company: "",
    },
  });

  React.useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
      }
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 font-mono text-xs uppercase tracking-widest"
      >
        Skip to content
      </a>
      <Preloader />
      <Grain />
      <IndexRail />

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-6 md:px-12 lg:px-[10%] flex items-center justify-between bg-background/90 backdrop-blur-sm border-b border-border/20">
        <SignatureMark />
        <LiveClock />
      </header>

      <main id="main-content" className="flex-grow">
        {/* Hero */}
        <section className="min-h-[85dvh] flex flex-col justify-center px-6 md:px-12 lg:px-[10%] pt-20 pb-32">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">
              İstanbul → Global · Est. 2022
            </div>
            <h1 className="font-display font-serif italic text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-[18ch] text-balance">
              The next wave already knows each other.
            </h1>
          </FadeIn>

          <FadeIn delay={0.2} className="mt-12">
            <p className="max-w-[50ch] text-lg md:text-xl text-foreground/80 leading-[1.6]">
              inner.hub is a private circle where AI-native founders, builders, and investors meet early — and back each other first.
            </p>
          </FadeIn>

          <FadeIn delay={0.4} className="mt-32">
            <div className="h-px w-full bg-border/20 mb-8" />
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Scroll
            </div>
          </FadeIn>
        </section>

        {/* 01 — The thesis */}
        <section id="section-01" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="01 — The thesis" meta="The distance" />
          <FadeIn>
            <div className="max-w-[65ch] text-lg md:text-xl leading-[1.7] text-foreground/90">
              Türkiye produces world-class AI talent. The capital and the networks live elsewhere. The gap isn't talent — it's who you know, and how early. inner.hub exists to close that distance: one circle, built in İstanbul, connected to the world.
            </div>
          </FadeIn>
        </section>

        {/* 02 — Who's inside */}
        <section id="section-02" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="02 — Who's inside" meta="Thirty-four seats to start" />
          <FadeIn>
            <p className="max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-16">
              Every seat in the circle is chosen one by one. Three kinds of people hold them:
            </p>
          </FadeIn>

          <div className="max-w-3xl">
            {[
              { label: "Founders", line: "Building AI-native companies, pre-seed to Series A." },
              { label: "Builders", line: "Engineers and researchers shipping at the edge of the field." },
              { label: "Investors", line: "Angels and funds that write early checks, not late congratulations." },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-border/15 last:border-b">
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground w-full md:w-48 flex-shrink-0">
                    {item.label}
                  </div>
                  <p className="text-lg text-foreground/90">{item.line}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* 03 — Inside */}
        <section id="section-03" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="03 — Inside" meta="What actually happens" />

          <div className="max-w-3xl mb-16">
            {[
              { label: "The gathering", line: "Twice a year. Two days. Everyone in one place." },
              { label: "Tables", line: "Monthly dinners of twelve in İstanbul. Small enough for real talk." },
              { label: "First looks", line: "Members see each other's work before the market does." },
              { label: "Introductions", line: "Made personally, made deliberately. No directories, no noise." },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-border/15 last:border-b">
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground w-full md:w-48 flex-shrink-0">
                    {item.label}
                  </div>
                  <p className="text-lg text-foreground/90">{item.line}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <p className="font-serif text-2xl max-w-2xl">What is said inside stays inside.</p>
          </FadeIn>
        </section>

        {/* 04 — Membership */}
        <section id="section-04" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="04 — Membership" meta="By nomination" />
          <FadeIn>
            <h2 className="font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-8 text-balance">
              Entry is by invitation. Always.
            </h2>
            <p className="max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-20">
              No tickets, no tiers, no public roster. Members are nominated from inside the circle, considered slowly, and invited personally. Trust is the only currency in this circle — and it compounds.
            </p>
          </FadeIn>

          <div className="max-w-3xl">
            {[
              { label: "Nomination", line: "Someone inside the circle puts your name forward." },
              { label: "Consideration", line: "We take our time. Fit beats fame." },
              { label: "Invitation", line: "If it's right, you'll hear from us directly." },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-12 py-6 border-t border-border/15 last:border-b">
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground w-full md:w-48 flex-shrink-0">
                    {item.label}
                  </div>
                  <p className="text-lg text-foreground/90">{item.line}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* 05 — The gathering (Ink interlude) */}
        <section
          id="section-05"
          className="px-6 md:px-12 lg:px-[10%] py-32 md:py-48 border-t border-border/15 bg-[var(--ink)] text-[var(--bone)] transition-colors duration-700"
        >
          <FadeIn>
            <div className="flex items-baseline justify-between gap-6 pb-6 mb-20 border-b border-white/15 font-mono text-xs uppercase tracking-widest opacity-60">
              <span>05 — The gathering</span>
              <span className="whitespace-nowrap">Sep 2026 · İstanbul</span>
            </div>
            <h2 className="font-display font-serif italic text-4xl md:text-5xl lg:text-6xl max-w-3xl mb-24 text-balance">
              The first inner.hub gathering. İstanbul, September 2026.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-3 gap-8 md:gap-16 max-w-3xl mb-24">
            {[
              { n: "34", label: "People" },
              { n: "2", label: "Days" },
              { n: "1", label: "Circle" },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div className="flex flex-col items-start">
                  <span className="font-display font-serif italic text-6xl md:text-8xl leading-none mb-4">
                    {item.n}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                    {item.label}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.15}>
            <p className="font-serif text-2xl md:text-3xl max-w-2xl mb-16 text-balance opacity-80">
              Thirty-four people. Two days. One circle. The first of many.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest opacity-50">
              <span className="w-[6px] h-[6px] bg-[var(--inner-green)] flex-shrink-0" aria-hidden="true" />
              Details are shared with invitees only.
            </div>
          </FadeIn>
        </section>

        {/* 06 — What's next */}
        <section id="section-06" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="06 — What's next" meta="In time" />
          <FadeIn>
            <h2 className="font-display font-serif italic text-4xl md:text-5xl max-w-2xl mb-8 text-balance">
              hub is where it starts.
            </h2>
            <p className="max-w-[65ch] text-lg leading-[1.7] text-foreground/90">
              What begins as thirty-four people is built to compound — into the network this industry has been missing. We announce things when they're real. There is more.
            </p>
          </FadeIn>
        </section>

        {/* 07 — Request an invitation */}
        <section id="section-07" className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <SectionLabel label="07 — Request an invitation" meta="We read everything" />

          {isSuccess ? (
            <div className="max-w-2xl py-12">
              <h2 className="font-display font-serif italic text-4xl md:text-5xl mb-6 text-balance">Received.</h2>
              <p className="text-xl text-muted-foreground">If it's a fit, we'll be in touch.</p>
            </div>
          ) : (
            <FadeIn>
              <div className="max-w-2xl">
                <h2 className="font-display font-serif italic text-4xl md:text-5xl mb-6 text-balance">
                  Request an invitation.
                </h2>
                <p className="text-lg text-muted-foreground mb-16 leading-[1.7]">
                  Nomination comes first, but good people arrive from unexpected directions. Tell us what you're building, backing, or breaking.
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
                            <Input
                              placeholder="Your full name"
                              className={fieldClass}
                              data-testid="input-name"
                              {...field}
                            />
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
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              className={fieldClass}
                              data-testid="input-email"
                              {...field}
                            />
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
                            <Textarea
                              placeholder="A brief note on your work and intent."
                              className={`${fieldClass} min-h-[120px] resize-none`}
                              data-testid="input-who-you-are"
                              {...field}
                            />
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
                            <Input
                              placeholder="LinkedIn or website"
                              className={`${fieldClass} text-muted-foreground`}
                              data-testid="input-link"
                              {...field}
                            />
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
                            <Input
                              placeholder="Name of your connection"
                              className={`${fieldClass} text-muted-foreground`}
                              data-testid="input-who-introduced"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-[10px] uppercase text-[var(--error)]" />
                        </FormItem>
                      )}
                    />

                    {/* Honeypot */}
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
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-0 h-full w-2 bg-background -translate-x-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0"
                        />
                        <span className="relative inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-1">
                          {isPending ? "Sending…" : "Send"}
                        </span>
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </FadeIn>
          )}
        </section>
      </main>

      <footer id="site-footer" className="bg-[var(--ink)] px-6 md:px-12 lg:px-[10%] pt-20 pb-6 flex flex-col gap-16 overflow-hidden">
        <div className="flex flex-col gap-6">
          <img src="/inner-logo.png" alt="inner" width={140} height={140} className="w-[140px] h-[140px]" />
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] opacity-60">
            <span>Meet early · Back first · İstanbul → Global</span>
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
