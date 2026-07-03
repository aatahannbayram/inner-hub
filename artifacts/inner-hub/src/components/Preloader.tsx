import { useEffect, useState } from "react";

type Phase = "idle" | "in" | "out" | "done";

export function Preloader() {
  const [phase, setPhase] = useState<Phase>("idle");

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

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9998] bg-[var(--ink)] flex items-center justify-center"
      style={{
        transition: "transform 400ms var(--ease-expo), visibility 0ms 400ms",
        transform: phase === "out" ? "translateY(-110%)" : "translateY(0)",
        visibility: phase === "out" ? "hidden" : "visible",
      }}
    >
      <span
        className="w-[14px] h-[14px] bg-[var(--inner-green)]"
        style={{
          animation: phase === "in" ? "preloader-pulse 500ms ease-in-out" : undefined,
        }}
      />
    </div>
  );
}
