import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "section-01", label: "01" },
  { id: "section-02", label: "02" },
  { id: "section-03", label: "03" },
  { id: "section-04", label: "04" },
  { id: "section-05", label: "05" },
];

export function IndexRail() {
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
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section index"
      className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4"
    >
      {SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            className="flex items-center gap-2 font-mono text-[11px] tabular-nums tracking-widest transition-opacity duration-500"
            style={{ opacity: isActive ? 1 : 0.35 }}
          >
            {isActive && (
              <span
                className="w-[5px] h-[5px] bg-[var(--inner-green)] flex-shrink-0"
                aria-hidden="true"
              />
            )}
            <span className={isActive ? "text-foreground" : "text-muted-foreground"}>{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
