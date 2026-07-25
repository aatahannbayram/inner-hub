import { useEffect, useRef } from "react";

const CHARS = ["·", "•", "+", "×", "/", "\\", "|", "-", ":", "°", "*", "="];

interface AsciiFieldProps {
  /** "dark" for light characters on a dark/--ink surface, "light" for ink characters on a bone surface. */
  tone?: "dark" | "light";
  cell?: number;
  className?: string;
}

/**
 * Animated ASCII-noise texture, canvas-based (retro-terminal feel referenced
 * from 21st.dev/community/ascii). Sits behind banner content as a pointer-events-none
 * absolute layer — pair with a relative z-10 wrapper for foreground content.
 */
export function AsciiField({ tone = "dark", cell = 15, className = "" }: AsciiFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color = tone === "dark" ? "244, 241, 232" : "20, 20, 18";
    let raf = 0;
    let phase = 0;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / cell) + 1;
      rows = Math.ceil(height / cell) + 1;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.font = `${Math.round(cell * 0.68)}px 'JetBrains Mono', monospace`;
      ctx!.textBaseline = "middle";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const n =
            Math.sin(x * 0.4 + phase) * Math.cos(y * 0.35 - phase * 0.7) +
            Math.sin((x + y) * 0.2 + phase * 1.3) * 0.5;
          const brightness = (n + 1.5) / 3;
          if (brightness < 0.35) continue;
          const alpha = Math.min(brightness * 0.16, 0.14);
          const char = CHARS[Math.floor(Math.abs(n * 37 + x * 3 + y * 7)) % CHARS.length];
          ctx!.fillStyle = `rgba(${color}, ${alpha})`;
          ctx!.fillText(char, x * cell, y * cell);
        }
      }
    }

    function loop() {
      phase += 0.008;
      draw();
      raf = requestAnimationFrame(loop);
    }

    resize();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas.parentElement!);

    if (!prefersReducedMotion) {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [tone, cell]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
