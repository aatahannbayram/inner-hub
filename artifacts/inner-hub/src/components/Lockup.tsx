import type { CSSProperties } from "react";

export function Lockup({
  className = "",
  fontSize,
  showHub = true,
}: {
  className?: string;
  fontSize?: string;
  showHub?: boolean;
}) {
  const textStyle: CSSProperties = {
    fontFamily: "'Fraunces', serif",
    fontStyle: "normal",
    fontWeight: 100,
    fontVariationSettings: "'opsz' 144, 'WONK' 1",
    letterSpacing: "-0.015em",
    ...(fontSize ? { fontSize } : {}),
  };

  return (
    <span className={`inline-flex items-baseline gap-[0.15em] ${className}`}>
      <span style={textStyle}>inner</span>
      <span
        className="inline-block bg-[#18FF85] flex-shrink-0"
        style={{ width: "0.42em", height: "0.42em", marginBottom: "0.05em" }}
        aria-hidden="true"
      />
      {showHub && <span style={textStyle}>hub</span>}
    </span>
  );
}
