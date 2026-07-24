import { useEffect, useRef } from "react";

const SENSITIVITY = 0.8;

/**
 * Binds a <video> element's playhead to horizontal mouse movement instead of
 * autoplaying. Seeks are queued via `onSeeked` so rapid mouse movement can't
 * flood the video element with overlapping seek requests.
 */
export function useScrubVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let prevX: number | null = null;
    let targetTime: number | null = null;
    let seeking = false;

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

    const onMouseMove = (e: MouseEvent) => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      if (prevX === null) {
        prevX = e.clientX;
        return;
      }
      const delta = e.clientX - prevX;
      prevX = e.clientX;
      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      requestSeek((targetTime ?? video.currentTime) + offset);
    };

    // Without autoplay, some browsers never decode/paint a frame until
    // playback actually starts — a currentTime nudge alone isn't reliable.
    // Kick off a muted play() and immediately pause it once a frame is
    // available, so the poster frame shows instead of a black rectangle.
    let cancelled = false;
    const paintFirstFrame = () => {
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
    };
    if (video.readyState >= 2) {
      paintFirstFrame();
    } else {
      video.addEventListener("loadeddata", paintFirstFrame, { once: true });
    }

    video.addEventListener("seeked", onSeeked);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", paintFirstFrame);
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return videoRef;
}
