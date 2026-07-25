import type { CSSProperties } from "react";

/** Yeşil yanıp sönen kare — `·` yerine marka ayırıcısı. */
export function BeaconSquare({
  className = "",
  size = "0.42em",
}: {
  className?: string;
  size?: string;
}) {
  return (
    <span
      className={`inline-block shrink-0 self-end bg-[#18FF85] animate-beacon ${className}`}
      style={{ width: size, height: size, marginBottom: "0.05em" }}
      aria-hidden
    />
  );
}

/**
 * Marka kilidi: `inner` ■ `suffix`
 * Örn. inner■hub, inner■signal — orta nokta (·) yerine yeşil kare.
 */
export function Lockup({
  suffix = "hub",
  className = "",
  fontSize,
  /** Dar chrome: `i` ■ */
  compact = false,
  /** @deprecated `compact` kullan */
  showHub = true,
}: {
  /** hub | signal | match | capital | vault | pulse | id | api … */
  suffix?: string;
  className?: string;
  fontSize?: string;
  compact?: boolean;
  showHub?: boolean;
}) {
  const isCompact = compact || !showHub;
  const label = isCompact ? "innerhub" : `inner ${suffix}`;

  const textStyle: CSSProperties = {
    fontFamily: "'Fraunces', serif",
    fontStyle: "normal",
    fontWeight: 300,
    fontVariationSettings: "'opsz' 144, 'WONK' 1",
    letterSpacing: "-0.015em",
    ...(fontSize ? { fontSize } : {}),
  };

  if (isCompact) {
    return (
      <span lang="en" className={`inline-flex items-baseline leading-none ${className}`} aria-label={label}>
        <span style={textStyle}>i</span>
        <BeaconSquare className="ml-[0.06em]" size="0.42em" />
      </span>
    );
  }

  return (
    <span lang="en" className={`inline-flex items-baseline leading-none ${className}`} aria-label={label}>
      <span style={textStyle}>inner</span>
      <BeaconSquare className="mx-[0.12em]" size="0.42em" />
      <span style={textStyle}>{suffix}</span>
    </span>
  );
}
