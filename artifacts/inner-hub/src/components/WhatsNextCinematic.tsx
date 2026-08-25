import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLocalizedHref, useT } from "@/i18n";

const NEXT_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4";

/**
 * Section 07 - cinematic closing frame.
 * Same composition language as the home hero: Fraunces headline,
 * sharp CTA bar, no rounded pills.
 */
export function WhatsNextCinematic() {
  const t = useT();
  const inviteHref = useLocalizedHref("/invitation");
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const reduceMotion = useRef(false);
  const bodyLines = t("homeWhatsNext.body").split("\n");

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(timer);
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
      gsap.set(wrap, { x: currentX, y: currentY });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = ((e.clientX - cx) / cx) * 18;
      targetY = ((e.clientY - cy) / cy) * 18;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      gsap.set(wrap, { clearProps: "x,y" });
    };
  }, []);

  return (
    <section
      id="section-06"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-black px-4 pb-12 text-white sm:px-6 sm:pb-16 md:px-12 md:pb-24 lg:px-[10%]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div ref={videoWrapRef} className="absolute inset-0 origin-center scale-[1.08] will-change-transform">
          <video
            className="h-full w-full object-cover"
            src={NEXT_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = 1.25;
            }}
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-black/25" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/50"
        />
      </div>

      <div
        className={[
          "relative z-10 transition-all duration-1000",
          ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        ].join(" ")}
      >
        <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/60 sm:mb-8 sm:text-xs">
          <span className="size-2 shrink-0 bg-[var(--inner-green)] animate-beacon sm:size-1.5" />
          {t("homeWhatsNext.eyebrow")}
        </div>

        <h2 className="max-w-[14ch] text-balance font-display font-serif italic text-4xl leading-[1.05] sm:text-5xl md:text-7xl lg:text-8xl">
          {t("homeWhatsNext.titleBefore")}{" "}
          <span className="italic">{t("homeWhatsNext.titleEm")}</span>
        </h2>

        <p className="mt-8 max-w-[48ch] text-base leading-[1.6] text-white/70 sm:mt-10 sm:text-lg md:mt-12 md:text-xl">
          {bodyLines[0]}
          {bodyLines[1] ? (
            <>
              <br className="hidden sm:block" />
              {bodyLines[1]}
            </>
          ) : null}
        </p>

        <div
          className={[
            "liquid-glass mt-8 flex max-w-3xl flex-col gap-3 py-1 pl-4 pr-1 transition-all duration-1000 delay-300 sm:mt-10 sm:flex-row sm:items-center sm:gap-4 sm:pl-6 md:mt-12",
            ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          ].join(" ")}
        >
          <p className="hidden flex-1 text-sm font-medium text-white sm:block">
            {t("homeWhatsNext.access")}
          </p>
          <p className="flex-1 px-1 pt-2 text-sm font-medium text-white sm:hidden sm:px-0 sm:pt-0">
            {t("homeWhatsNext.accessShort")}
          </p>
          <a
            href={inviteHref}
            className="shrink-0 whitespace-nowrap bg-white px-5 py-3 text-center font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-white/90 sm:py-2.5"
          >
            {t("homeWhatsNext.cta")}
          </a>
        </div>
      </div>
    </section>
  );
}
