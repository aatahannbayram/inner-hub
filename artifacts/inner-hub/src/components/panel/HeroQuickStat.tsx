import { FadeIn } from "@/components/FadeIn";

/** Panel hero'larının sağ tarafındaki tek satır etiket yerine kullanılan,
 *  gerçek bir sayı + kısa açıklama taşıyan blok. Amaç: sağ boşluğu
 *  dolgu metinle değil, sayfanın anlık durumunu gösteren bir bilgiyle
 *  doldurmak — tüm hero'larda aynı bileşen kullanılarak bütünlük sağlanır. */
export function HeroQuickStat({
  value,
  label,
  tagline,
  delay = 1.4,
}: {
  value: string | number;
  label: string;
  tagline: string;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="liquid-glass panel-glass-ink flex max-w-md flex-col divide-y divide-white/15 sm:flex-row sm:divide-x sm:divide-y-0">
        <div className="px-6 py-4">
          <p
            className="font-serif text-3xl leading-none text-white md:text-4xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {value}
          </p>
          <p className="mt-1.5 font-mono text-label uppercase tracking-widest text-white/50">
            {label}
          </p>
        </div>
        <div className="flex items-center px-6 py-4 sm:max-w-[200px]">
          <span className="text-sm leading-relaxed text-white/70">{tagline}</span>
        </div>
      </div>
    </FadeIn>
  );
}
