import { useEffect, useRef } from "react";

/**
 * Mouse X konumunu video playhead'ine bağlar — karakterin bakışını takip ettirmek için.
 * Seek'ler `onSeeked` kuyruğuyla yapılır; hızlı harekette üst üste seek birikmez.
 */
export function useScrubVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let targetTime: number | null = null;
    let seeking = false;
    let cancelled = false;

    const requestSeek = (time: number) => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const clamped = Math.min(Math.max(time, 0), video.duration);
      targetTime = clamped;
      if (!seeking) {
        seeking = true;
        video.currentTime = clamped;
      }
    };

    const onSeeked = () => {
      if (targetTime !== null && Math.abs(video.currentTime - targetTime) > 0.03) {
        video.currentTime = targetTime;
      } else {
        seeking = false;
      }
    };

    const scrubFromClientX = (clientX: number) => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const ratio = Math.min(1, Math.max(0, clientX / window.innerWidth));
      requestSeek(ratio * video.duration);
    };

    const onMouseMove = (e: MouseEvent) => scrubFromClientX(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) scrubFromClientX(t.clientX);
    };

    // İlk kareyi boya + metadata için yüklemeyi tetikle
    const paintFirstFrame = () => {
      if (cancelled) return;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            if (!cancelled) video.pause();
          })
          .catch(() => {});
      } else {
        video.pause();
      }
      // Ortaya hizala (nötr bakış)
      if (video.duration && !Number.isNaN(video.duration)) {
        requestSeek(video.duration * 0.5);
      }
    };

    const onLoadedMeta = () => {
      if (!cancelled) paintFirstFrame();
    };

    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadedmetadata", onLoadedMeta);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // preload=none olsa bile yüklemeyi başlat
    try {
      video.load();
    } catch {
      /* ignore */
    }
    if (video.readyState >= 1) {
      paintFirstFrame();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return videoRef;
}
