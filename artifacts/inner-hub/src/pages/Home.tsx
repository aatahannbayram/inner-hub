import React from "react";
import innerLogoUrl from "@assets/inner-linkedin-logo_400x400_1782915537865.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitRequest } from "@workspace/api-client-react";
import { FadeIn } from "@/components/FadeIn";
import { SignatureMark } from "@/components/SignatureMark";
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
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[var(--inner-green)] selection:text-[var(--ink)]">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-8 md:px-12 lg:px-[10%] flex items-center justify-between bg-background/90 backdrop-blur-sm border-b border-border/20">
        <SignatureMark />
        <span className="font-mono text-xs uppercase tracking-widest">By Invitation</span>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="min-h-[85dvh] flex flex-col justify-center px-6 md:px-12 lg:px-[10%] pt-20 pb-32">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">
              İstanbul · Est. 2022 · By Invitation
            </div>
            <h1 className="font-serif italic text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight max-w-[15ch]">
              A private community for the people building what comes next.
            </h1>
          </FadeIn>

          <FadeIn delay={0.4} className="mt-32">
            <div className="h-px w-full bg-border/20 mb-8" />
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Scroll
            </div>
          </FadeIn>
        </section>

        {/* 01 — On inner */}
        <section className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest mb-16">01 — On inner</div>
            <div className="max-w-[65ch] text-lg md:text-xl leading-[1.7] text-foreground/90">
              inner.hub is a small, deliberate room. We bring together founders, investors, and researchers who take their work seriously — and each other's time just as seriously. No stage. No audience. Only company. What is said here stays here. Who is here is chosen with care.
            </div>
          </FadeIn>
        </section>

        {/* 02 — Principles */}
        <section className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest mb-16">02 — Principles</div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {[
              {
                label: "Small by design",
                line: "We stay small so the room stays real.",
              },
              {
                label: "Signal over noise",
                line: "We value depth over reach.",
              },
              {
                label: "Discretion",
                line: "What happens inside, stays inside.",
              },
              {
                label: "Company, not audience",
                line: "We gather as peers, never as performers.",
              },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div
                  className={`py-10 pr-8 border-t border-border/15 ${i % 2 === 0 ? "md:pr-16" : "md:pl-16"} ${i === 0 || i === 1 ? "md:border-t-0" : ""}`}
                >
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                    {item.label}
                  </div>
                  <p className="font-serif text-2xl">{item.line}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* 03 — Membership */}
        <section className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest mb-16">03 — Membership</div>
            <h2 className="font-serif text-4xl md:text-5xl max-w-2xl mb-8">
              Entry is by invitation. Always.
            </h2>
            <p className="max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-20">
              There is no membership tier, no waitlist counter, no public roster. Members are nominated from inside the room, considered carefully, and invited personally. We look for people who build, back, or study what comes next — and who understand that trust is the only currency that matters here.
            </p>
          </FadeIn>

          <div className="max-w-3xl">
            {[
              { label: "Nomination", line: "Someone inside the room puts your name forward." },
              { label: "Consideration", line: "We take our time. Fit matters more than fame." },
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

        {/* 04 — The gathering */}
        <section className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15 bg-foreground text-background">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest mb-16 opacity-60">04 — The gathering</div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl max-w-2xl mb-8">
              The first inner.hub gathering. İstanbul, September 2026.
            </h2>
            <p className="text-lg md:text-xl opacity-80 max-w-xl mb-6">
              Thirty people. Two days. One room. By invitation only.
            </p>
            <div className="font-mono text-xs uppercase tracking-widest opacity-50">
              Details are shared with invitees only.
            </div>
          </FadeIn>
        </section>

        {/* 05 — The ecosystem */}
        <section className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest mb-16">05 — The ecosystem</div>
            <h2 className="font-serif text-4xl md:text-5xl max-w-2xl mb-8">
              hub is the first room of inner.
            </h2>
            <p className="max-w-[65ch] text-lg leading-[1.7] text-foreground/90 mb-20">
              inner is built as a system of rooms — a lab for research, a studio for making, capital for backing, a house for gathering. hub opens first. The rest follow.
            </p>
          </FadeIn>

          <div className="max-w-2xl">
            {[
              { name: "inner.hub", status: "Now", active: true },
              { name: "inner.lab", status: "To follow", active: false },
              { name: "inner.studio", status: "To follow", active: false },
              { name: "inner.capital", status: "To follow", active: false },
              { name: "inner.house", status: "To follow", active: false },
            ].map((item, i) => (
              <FadeIn key={item.name} delay={i * 0.05}>
                <div className="flex items-center justify-between py-5 border-t border-border/15 last:border-b">
                  <span className="font-serif text-lg md:text-xl">{item.name}</span>
                  <span
                    className={`font-mono text-xs uppercase tracking-widest ${item.active ? "text-[var(--inner-green)]" : "text-muted-foreground"}`}
                  >
                    {item.status}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* 06 — Request an invitation */}
        <section className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest mb-16">06 — Request an invitation</div>

            {isSuccess ? (
              <div className="max-w-2xl py-12">
                <h2 className="font-serif italic text-4xl md:text-5xl mb-6">Received.</h2>
                <p className="text-xl text-muted-foreground">If it's a fit, we'll be in touch.</p>
              </div>
            ) : (
              <div className="max-w-2xl">
                <h2 className="font-serif text-4xl md:text-5xl mb-6">Request an invitation.</h2>
                <p className="text-lg text-muted-foreground mb-16 leading-[1.7]">
                  The room is nomination-first, but good people arrive from unexpected directions. If you believe you belong here, tell us who you are. We read everything.
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
                        className="rounded-none bg-foreground text-background border border-foreground hover:bg-background hover:text-foreground font-mono text-xs tracking-widest uppercase px-12 py-6 h-auto transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
                        data-testid="button-submit"
                      >
                        {isPending ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </FadeIn>
        </section>
      </main>

      <footer className="bg-[var(--ink)] px-6 md:px-12 lg:px-[10%] py-20 flex flex-col gap-16">
        <img
          src={innerLogoUrl}
          alt="inner"
          className="w-32 h-32 object-contain"
        />
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] opacity-60">
            <span>inner.hub</span>
            <span>·</span>
            <span>inner.lab</span>
            <span>·</span>
            <span>inner.studio</span>
            <span>·</span>
            <span>inner.capital</span>
            <span>·</span>
            <span>inner.house</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] opacity-30">
            © 2026 inner. İstanbul.
          </div>
        </div>
      </footer>
    </div>
  );
}
