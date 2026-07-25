import { useEffect, useRef, useState } from "react";

interface HeroVideoProps {
  src: string;
  poster: string;
  className?: string;
}

/** Otomatik oynatılan hero video'ların ortak, performans-güvenli sarmalayıcısı.
 *  - poster zorunlu: LCP elementi artık VIDEO değil bu görsel olur.
 *  - preload="none": ilk yükte video dosyası indirilmez, sadece poster.
 *  - IntersectionObserver: viewport dışına çıkınca duraklatılır (arka planda CPU/GPU harcamasın).
 *  - prefers-reduced-motion: video hiç mount edilmez, sadece statik poster gösterilir. */
export function HeroVideo({ src, poster, className }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduce || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  if (reduce) {
    return <img src={poster} alt="" aria-hidden="true" className={className} />;
  }

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      poster={poster}
      preload="none"
      className={className}
      src={src}
    />
  );
}
