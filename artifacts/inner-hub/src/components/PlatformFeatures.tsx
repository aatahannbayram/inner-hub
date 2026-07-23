import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";

export type PlatformFeature = {
  id: string;
  name: string;
  tag: string;
  desc: string;
  media: { type: "video" | "image"; src: string };
};

function FeatureCard({ feature, index, setRef }: { feature: PlatformFeature; index: number; setRef: (el: HTMLDivElement | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });

  return (
    <div
      ref={(el) => {
        ref.current = el;
        setRef(el);
      }}
      data-feature-index={index}
      className={`border border-[var(--bone)]/15 bg-[var(--bone)]/[0.06] p-6 backdrop-blur-sm transition-all duration-700 ease-out md:p-10 ${
        inView ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
      }`}
    >
      <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/40">{feature.tag}</p>
      <h3 className="mb-6 font-serif text-xl italic text-[var(--bone)] md:text-2xl">{feature.name}</h3>
      <div className="mb-6 aspect-video overflow-hidden bg-black/30">
        {feature.media.type === "video" ? (
          <video
            src={feature.media.src}
            autoPlay
            muted
            loop
            playsInline
            className="size-full object-cover"
          />
        ) : (
          <img src={feature.media.src} alt={feature.name} className="size-full object-cover" loading="lazy" />
        )}
      </div>
      <p className="text-sm leading-relaxed text-[var(--bone)]/60 md:text-base">{feature.desc}</p>
    </div>
  );
}

export function PlatformFeatures({
  features,
  restModules,
}: {
  features: PlatformFeature[];
  restModules: { id: string; name: string; desc: string; icon: LucideIcon; tag: string }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.featureIndex);
            setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.6 },
    );

    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [features.length]);

  const scrollToCard = (index: number) => {
    cardRefs.current.get(index)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="bg-[var(--ink)] px-6 py-20 text-[var(--bone)] md:px-12 md:py-40 lg:px-[10%] lg:py-48">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[400px_1fr] lg:gap-24 xl:grid-cols-[460px_1fr] xl:gap-48">
        {/* Left: sticky heading + nav + CTA */}
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:py-32">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[var(--bone)]/40">
              03 · The platform
            </p>
            <h2 className="font-display font-serif italic text-2xl leading-[1.2] sm:text-3xl lg:text-[46px]">
              Built for the pace of a closed circle.
            </h2>
          </div>

          <div className="mt-12 hidden flex-col gap-2 lg:flex">
            {features.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => scrollToCard(i)}
                className={`border px-4 py-3 text-left font-mono text-xs uppercase tracking-widest transition-colors ${
                  activeIndex === i
                    ? "border-[var(--bone)]/20 bg-[var(--bone)]/10 text-[var(--bone)]"
                    : "border-transparent text-[var(--bone)]/40 hover:text-[var(--bone)]/70"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          <div className="mt-12 hidden lg:block">
            <p className="mb-4 text-sm text-[var(--bone)]/60">Access is by invitation. Always.</p>
            <a
              href="/invitation"
              className="inline-flex items-center gap-2 border border-[var(--bone)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[var(--bone)] transition-colors hover:bg-[var(--bone)] hover:text-[var(--ink)]"
            >
              Request an invitation <ArrowRight className="size-3" />
            </a>
          </div>
        </div>

        {/* Right: scrolling feature cards */}
        <div className="flex flex-col gap-6">
          {features.map((f, i) => (
            <FeatureCard
              key={f.id}
              feature={f}
              index={i}
              setRef={(el) => {
                if (el) cardRefs.current.set(i, el);
                else cardRefs.current.delete(i);
              }}
            />
          ))}

          {restModules.length > 0 && (
            <div className="mt-6 border-t border-[var(--bone)]/15 pt-10">
              <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]/40">
                +{restModules.length} more tools
              </p>
              <div className="grid grid-cols-1 gap-px bg-[var(--bone)]/10 sm:grid-cols-2">
                {restModules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div key={mod.id} className="flex flex-col gap-3 bg-[var(--ink)] p-6">
                      <div className="flex items-center justify-between">
                        <Icon className="size-4 text-[var(--bone)]/50" strokeWidth={1.5} />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--bone)]/30">
                          {mod.tag}
                        </span>
                      </div>
                      <h4 className="font-serif italic text-lg text-[var(--bone)]/90">{mod.name}</h4>
                      <p className="text-sm leading-relaxed text-[var(--bone)]/50">{mod.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
