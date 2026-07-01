import React from "react";
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
import { ArrowDown } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  whoYouAre: z.string().min(1, "Please tell us who you are"),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  whoIntroduced: z.string().optional(),
  company: z.string().optional(), // Honeypot
});

type FormValues = z.infer<typeof formSchema>;

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
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[var(--inner-green)] selection:text-ink">
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
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight max-w-[15ch]">
              A private community for the people building what comes next.
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.4} className="mt-32">
            <div className="h-px w-full bg-border/20 mb-8" />
            <div className="flex items-center text-muted-foreground font-mono text-xs uppercase tracking-widest gap-4">
              <span>Scroll</span>
              <ArrowDown className="w-3 h-3" />
            </div>
          </FadeIn>
        </section>

        {/* Section 01 */}
        <section className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest mb-16">01 — On inner</div>
            <div className="max-w-2xl text-lg md:text-xl leading-relaxed text-foreground/90">
              inner.hub is a small, deliberate room. We bring together founders, investors, and researchers who take their work seriously — and each other's time just as seriously. No stage. No audience. Only company. What is said here stays here. Who is here is chosen with care.
            </div>
          </FadeIn>

          <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-x-24 md:gap-y-20 max-w-5xl">
            <FadeIn delay={0.1}>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Small by design</div>
              <h3 className="font-serif text-2xl mb-3">We stay small so the room stays real.</h3>
              <p className="text-muted-foreground leading-relaxed">The intimacy of the space dictates the quality of the conversation.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Signal over noise</div>
              <h3 className="font-serif text-2xl mb-3">We value depth over reach.</h3>
              <p className="text-muted-foreground leading-relaxed">Less content, more insight. Moving away from the infinite feed.</p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Discretion</div>
              <h3 className="font-serif text-2xl mb-3">What happens inside, stays inside.</h3>
              <p className="text-muted-foreground leading-relaxed">A sanctuary for unpolished ideas and candid truths.</p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Company, not audience</div>
              <h3 className="font-serif text-2xl mb-3">We gather as peers, never as performers.</h3>
              <p className="text-muted-foreground leading-relaxed">No pedestals. The person next to you is just as interesting as you are.</p>
            </FadeIn>
          </div>
        </section>

        {/* Section 02 */}
        <section className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15 bg-foreground text-background">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest mb-16 opacity-60">02 — The gathering</div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl max-w-2xl mb-8">
              The first inner.hub gathering.<br />September 2026.
            </h2>
            <p className="text-lg md:text-xl opacity-80 max-w-xl">
              Thirty people. Two days. One room. By invitation only.
            </p>
          </FadeIn>
        </section>

        {/* Section 03 */}
        <section className="px-6 md:px-12 lg:px-[10%] py-32 border-t border-border/15">
          <FadeIn>
            <div className="font-mono text-xs uppercase tracking-widest mb-16">03 — Request an invitation</div>
            
            {isSuccess ? (
              <div className="max-w-2xl py-12">
                <h2 className="font-serif text-4xl md:text-5xl mb-6">Received.</h2>
                <p className="text-xl text-muted-foreground">If it's a fit, we'll be in touch.</p>
              </div>
            ) : (
              <div className="max-w-2xl">
                <h2 className="font-serif text-4xl md:text-5xl mb-6">Request an invitation.</h2>
                <p className="text-lg text-muted-foreground mb-16">
                  inner.hub is invitation-only. If you'd like to be considered, tell us a little about yourself. We read everything.
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
                              className="rounded-none border-0 border-b border-border bg-transparent px-0 py-4 focus-visible:ring-0 focus-visible:border-foreground" 
                              data-testid="input-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-[10px] uppercase" />
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
                              className="rounded-none border-0 border-b border-border bg-transparent px-0 py-4 focus-visible:ring-0 focus-visible:border-foreground" 
                              data-testid="input-email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-[10px] uppercase" />
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
                              className="rounded-none border-0 border-b border-border bg-transparent px-0 py-4 min-h-[120px] focus-visible:ring-0 focus-visible:border-foreground resize-none" 
                              data-testid="input-who-you-are"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-[10px] uppercase" />
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
                              className="rounded-none border-0 border-b border-border bg-transparent px-0 py-4 focus-visible:ring-0 focus-visible:border-foreground text-muted-foreground" 
                              data-testid="input-link"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-[10px] uppercase" />
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
                              className="rounded-none border-0 border-b border-border bg-transparent px-0 py-4 focus-visible:ring-0 focus-visible:border-foreground text-muted-foreground" 
                              data-testid="input-who-introduced"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-[10px] uppercase" />
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
                      <div className="text-destructive text-sm" data-testid="text-error">
                        Something went wrong. Please try again.
                      </div>
                    )}

                    <div className="pt-8">
                      <Button 
                        type="submit" 
                        disabled={isPending}
                        className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-widest uppercase px-12 py-6 h-auto"
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

      <footer className="px-6 md:px-12 lg:px-[10%] py-16 border-t border-border/15 flex flex-col gap-12 text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
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
        <div className="flex items-end justify-between">
          <span>© 2026 inner. İstanbul.</span>
          <div className="w-[0.4em] h-[0.4em] bg-[var(--inner-green)]" aria-hidden="true" />
        </div>
      </footer>
    </div>
  );
}
