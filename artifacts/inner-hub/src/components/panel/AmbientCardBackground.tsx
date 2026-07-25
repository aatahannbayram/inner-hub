/**
 * Shared depth treatment for flat --ink cards/sections: fine grain + two
 * slow-drifting glow blobs (inner-green + a warm ember accent) + vignette.
 * Purely decorative, CSS-only (no new deps), pointer-events-none.
 */
export function AmbientCardBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -left-[10%] -top-[30%] size-[60%] rounded-full opacity-[0.16] blur-3xl"
        style={{ background: "var(--inner-green)", animation: "ambient-drift-a 18s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-[35%] -right-[10%] size-[65%] rounded-full opacity-[0.14] blur-3xl"
        style={{ background: "#B4553B", animation: "ambient-drift-b 22s ease-in-out infinite" }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--bone) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 100%, transparent 40%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}
