import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

type AutoplayVideoProps = {
  src: string;
  poster?: string;
  label?: string;
  className?: string;
};

/** Muted autoplay; kontrol barı hover’da video altına yapışık görünür */
export function AutoplayVideo({ src, poster, label, className }: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => {
      void v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    tryPlay();
    const onVis = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [src]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const seek = (ratio: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = Math.max(0, Math.min(1, ratio)) * duration;
    setProgress(ratio);
  };

  const fmt = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div
      className={`relative aspect-video overflow-hidden bg-black ${className ?? ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHover(false);
      }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        playsInline
        muted={muted}
        loop
        autoPlay
        poster={poster}
        preload="auto"
        onClick={togglePlay}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (!v || !v.duration) return;
          setProgress(v.currentTime / v.duration);
        }}
        onLoadedMetadata={() => {
          const v = videoRef.current;
          if (v) setDuration(v.duration);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={src} type="video/mp4" />
      </video>

      {label ? (
        <span className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 bg-black/60 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-[var(--bone-fixed)]">
          <Play className="size-2.5 fill-current" />
          {label}
        </span>
      ) : null}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-white/10 bg-gradient-to-t from-black/90 via-black/70 to-black/40 px-3 py-2.5 backdrop-blur-sm transition-opacity duration-200 ${
          hover ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={togglePlay}
          className="flex size-8 shrink-0 items-center justify-center text-[var(--bone-fixed)]"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </button>

        <button
          type="button"
          className="relative h-1 flex-1 overflow-hidden bg-white/20"
          aria-label="Seek"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - rect.left) / Math.max(rect.width, 1));
          }}
        >
          <span
            className="absolute inset-y-0 left-0 bg-[var(--inner-green)]"
            style={{ width: `${progress * 100}%` }}
          />
        </button>

        <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/55">
          {fmt(progress * duration)} / {fmt(duration)}
        </span>

        <button
          type="button"
          onClick={toggleMute}
          className="flex size-8 shrink-0 items-center justify-center text-[var(--bone-fixed)]"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
