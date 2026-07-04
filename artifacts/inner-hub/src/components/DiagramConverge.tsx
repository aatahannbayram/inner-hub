const NODES = [
  { x: 24, y: 30 },
  { x: 16, y: 100 },
  { x: 36, y: 168 },
  { x: 536, y: 30 },
  { x: 544, y: 100 },
  { x: 524, y: 168 },
];

export function DiagramConverge() {
  const cx = 280;
  const cy = 100;

  return (
    <div className="w-full max-w-[560px] text-muted-foreground" aria-hidden="true">
      <svg
        viewBox="0 0 560 200"
        className="w-full h-auto"
        role="presentation"
        focusable="false"
      >
        {NODES.map((n, i) => (
          <line
            key={`line-${i}`}
            x1={n.x}
            y1={n.y}
            x2={cx}
            y2={cy}
            stroke="var(--ink)"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
        ))}
        {NODES.map((n, i) => (
          <rect
            key={`node-${i}`}
            x={n.x - 2}
            y={n.y - 2}
            width={4}
            height={4}
            fill="currentColor"
            opacity={0.4}
          />
        ))}
        <circle cx={cx} cy={cy} r={20} fill="none" stroke="var(--ink)" strokeOpacity={0.3} strokeWidth={1} />
        <rect x={cx - 4} y={cy - 4} width={8} height={8} fill="var(--inner-green)" />
      </svg>
      <span className="sr-only">Many people, coming together into one circle.</span>
    </div>
  );
}
