const TOTAL = 34;
const RADIUS = 130;
const SIZE = 7;
const VIEWBOX = 320;
const CENTER = VIEWBOX / 2;

export function DiagramCircle() {
  const squares = Array.from({ length: TOTAL }, (_, i) => {
    const angle = (i / TOTAL) * Math.PI * 2 - Math.PI / 2;
    const x = CENTER + RADIUS * Math.cos(angle);
    const y = CENTER + RADIUS * Math.sin(angle);
    return { x, y, isGreen: i === 0 };
  });

  return (
    <div className="flex flex-col items-center gap-6" aria-hidden="true">
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="w-full max-w-[320px] h-auto animate-diagram-spin"
        role="presentation"
        focusable="false"
      >
        {squares.map((s, i) => (
          <rect
            key={i}
            x={s.x - SIZE / 2}
            y={s.y - SIZE / 2}
            width={SIZE}
            height={SIZE}
            fill={s.isGreen ? "var(--inner-green)" : "var(--bone)"}
            opacity={s.isGreen ? 1 : 0.85}
          />
        ))}
      </svg>
      <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">34 · One circle</span>
      <span className="sr-only">Thirty-four squares forming one circle.</span>
    </div>
  );
}
