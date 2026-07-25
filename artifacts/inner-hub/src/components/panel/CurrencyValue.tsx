/**
 * The site's display serif (Fraunces, via fontVariationSettings) doesn't
 * carry a glyph for ₺ (or most other currency symbols) — the browser falls
 * back to a mismatched system font for just that character, which reads as
 * a rendering glitch next to the rest of the serif number. Splits the
 * leading symbol into its own span on a safe font stack.
 */
export function CurrencyValue({ value }: { value: string }) {
  const match = value.match(/^([₺$€£])(.+)$/);
  if (!match) return <>{value}</>;
  return (
    <>
      <span className="font-sans">{match[1]}</span>
      {match[2]}
    </>
  );
}
