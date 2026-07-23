import { useState } from "react";
import { Lockup } from "@/components/Lockup";

const LINKS = [
  { label: "Platform", href: "#section-03" },
  { label: "Gathering", href: "#section-06" },
  { label: "Panel", href: "/panel" },
];

export function FloatingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center justify-between gap-8 border border-[var(--ink)]/10 bg-[var(--bone)] px-5 py-3 shadow-lg">
        <a href="/" className="inline-flex">
          <Lockup className="text-[var(--ink)]" fontSize="18px" />
        </a>
        <button
          type="button"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative flex h-4 w-5 flex-col items-center justify-between"
        >
          <span
            className="block h-[1.5px] w-full bg-[var(--ink)] transition-transform duration-300"
            style={{
              transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
              transform: open ? "translateY(6.5px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="block h-[1.5px] w-full bg-[var(--ink)] transition-transform duration-300"
            style={{
              transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
              transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </div>

      <div
        className={`absolute left-1/2 top-[calc(100%+10px)] w-56 -translate-x-1/2 border border-[var(--ink)]/10 bg-[var(--bone)] shadow-lg transition-all duration-300 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
      >
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setOpen(false)}
            className="block border-b border-[var(--ink)]/10 px-5 py-3 font-mono text-xs uppercase tracking-widest text-[var(--ink)]/70 transition-colors last:border-b-0 hover:text-[var(--ink)]"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
