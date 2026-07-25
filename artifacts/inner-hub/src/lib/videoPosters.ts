/** CloudFront hero videoları → LCP poster eşlemesi (F11). */
const BY_FRAGMENT: Record<string, string> = {
  "hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994": "/posters/courses-hero.jpg",
  "hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959": "/posters/capital-events.jpg",
  "hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4": "/posters/gathering.jpg",
  "hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711": "/posters/match-hero.jpg",
  "hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08": "/posters/perks-ambient.jpg",
};

export function posterForVideo(src: string, fallback = "/posters/courses-hero.jpg"): string {
  for (const [fragment, poster] of Object.entries(BY_FRAGMENT)) {
    if (src.includes(fragment)) return poster;
  }
  return fallback;
}
