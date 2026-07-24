// Deterministic, editorial-toned color assignment for initials avatars and
// brand marks — replaces flat ink-black placeholders with a small palette
// that stays legible with light (--bone) text and on-brand with the rest of
// the ink/bone/inner-green system.
const PALETTE = [
  "#1F4B3F", // pine
  "#5C3A21", // espresso
  "#2B4570", // indigo
  "#6B4423", // rust
  "#3F3B2B", // olive
  "#1F3A4B", // deep teal
  "#4B2B3F", // plum
  "#2F4B2B", // forest
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
