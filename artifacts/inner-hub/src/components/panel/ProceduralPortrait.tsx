import { useEffect, useRef } from "react";

/**
 * Canvas2D "photo → procedural portrait" engine, reimplementing the parts of
 * the 21st.dev ASCII-art pipeline that a given preset actually exercises
 * (grid sampling → per-cell shape → color grade → tint → post-fx → animate).
 * Only the render modes / pfx keys used by the presets we ship ("characters"
 * for Phosphor, "contour" for D60-hero) are wired up — the rest of the
 * original spec's ~20 render modes and pfx keys are left out rather than
 * stubbed.
 */

export type PortraitConfig = {
  renderMode: "characters" | "contour";
  bgMode: "solid" | "blur";
  bgColor?: string;
  bgBlur?: number;
  bgOpacity?: number;
  cellSize: number;
  coverage: number;
  invert?: boolean;
  charSet?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  grayscale?: number;
  tint?: string;
  tintOpacity?: number;
  overlayBlend?: GlobalCompositeOperation;
  color?: string;
  pfx?: {
    vignette?: { enabled: boolean; intensity: number };
    scanLines?: { enabled: boolean; intensity: number };
    bloom?: { enabled: boolean; intensity: number };
  };
  animStyle?: "flicker" | "wave";
  animSpeed?: number;
  animIntensity?: number;
};

const STANDARD_CHARS = " .:-=+*#%@";

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function applyContrastBrightness(lum: number, brightness: number, contrast: number) {
  const factor = contrast / 100;
  const v = (lum - 0.5) * factor + 0.5 + brightness / 100;
  return Math.min(1, Math.max(0, v));
}

export function ProceduralPortrait({
  src,
  config,
  className,
}: {
  src: string;
  config: PortraitConfig;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let disposed = false;
    let luminance: Float32Array | null = null;
    let cols = 0;
    let rows = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssW = 0;
    let cssH = 0;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    const {
      renderMode,
      bgMode,
      bgColor = "#0A0A0A",
      bgBlur = 12,
      bgOpacity = 60,
      cellSize,
      coverage,
      invert = false,
      charSet = STANDARD_CHARS,
      brightness = 0,
      contrast = 100,
      saturation = 100,
      grayscale = 0,
      tint = "#18FF85",
      tintOpacity = 0,
      overlayBlend = "screen",
      color = "#18FF85",
      pfx = {},
      animStyle = "flicker",
      animSpeed = 60,
      animIntensity = 50,
    } = config;

    const sampleLuminance = () => {
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = cols;
      sampleCanvas.height = rows;
      const sctx = sampleCanvas.getContext("2d");
      if (!sctx) return;
      // Draw the image scaled down to one pixel per grid cell — the browser's
      // own downscale filtering gives us a fast per-cell average.
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cssW / cssH;
      let dw = cssW;
      let dh = cssH;
      let dx = 0;
      let dy = 0;
      if (imgRatio > canvasRatio) {
        dh = cssH;
        dw = cssH * imgRatio;
        dx = (cssW - dw) / 2;
      } else {
        dw = cssW;
        dh = cssW / imgRatio;
        dy = (cssH - dh) / 2;
      }
      sctx.drawImage(img, dx * (cols / cssW), dy * (rows / cssH), dw * (cols / cssW), dh * (rows / cssH));
      const data = sctx.getImageData(0, 0, cols, rows).data;
      luminance = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const r = data[i * 4] / 255;
        const g = data[i * 4 + 1] / 255;
        const b = data[i * 4 + 2] / 255;
        let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        lum = applyContrastBrightness(lum, brightness, contrast);
        luminance[i] = invert ? 1 - lum : lum;
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.ceil(cssW / cellSize));
      rows = Math.max(1, Math.ceil(cssH / cellSize));
      if (img.complete && img.naturalWidth > 0) sampleLuminance();
    };

    const drawBackground = () => {
      ctx.save();
      ctx.filter = `saturate(${saturation}%) grayscale(${grayscale}%)`;
      if (bgMode === "solid") {
        ctx.filter = "none";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cssW, cssH);
      } else {
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = cssW / cssH;
        let dw = cssW;
        let dh = cssH;
        let dx = 0;
        let dy = 0;
        if (imgRatio > canvasRatio) {
          dh = cssH;
          dw = cssH * imgRatio;
          dx = (cssW - dw) / 2;
        } else {
          dw = cssW;
          dh = cssW / imgRatio;
          dy = (cssH - dh) / 2;
        }
        ctx.filter += ` blur(${bgBlur}px)`;
        ctx.globalAlpha = bgOpacity / 100;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    };

    const drawCharacters = (t: number) => {
      if (!luminance) return;
      ctx.save();
      ctx.font = `${Math.round(cellSize * 0.95)}px "SF Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const ramp = charSet;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cellSeed = hash(x, y);
          if (cellSeed * 100 > coverage) continue;
          const lum = luminance[y * cols + x];
          const flicker =
            animStyle === "flicker"
              ? 1 - (animIntensity / 100) * 0.35 * (0.5 + 0.5 * Math.sin(t * (animSpeed / 20) + cellSeed * 12))
              : 1;
          const idx = Math.min(ramp.length - 1, Math.floor(lum * flicker * (ramp.length - 1)));
          const ch = ramp[idx];
          if (ch === " ") continue;
          ctx.globalAlpha = Math.min(1, lum * flicker + 0.08);
          ctx.fillStyle = color;
          ctx.fillText(ch, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
        }
      }
      ctx.restore();
    };

    const drawContour = (t: number) => {
      if (!luminance) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Classic topographic-scan look: one flowing line per grid row, its
      // vertical offset driven by the underlying luminance at each x — reads
      // as contour lines tracing the portrait, and can never fragment into
      // disconnected dashes the way per-cell threshold banding does.
      const amplitude = cellSize * 0.9;
      const waveAmp = animStyle === "wave" ? (animIntensity / 100) * cellSize * 0.5 : 0;
      const waveFreq = animSpeed / 4000;
      const sampleStep = Math.max(2, Math.floor(cellSize / 6));

      for (let ry = 0; ry < rows; ry++) {
        const rowSeed = hash(ry, 7.3);
        if (rowSeed * 100 > coverage) continue;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px <= cssW; px += sampleStep) {
          const gx = Math.min(cols - 1, Math.floor(px / cellSize));
          const lum = luminance[ry * cols + gx];
          const wave = Math.sin(px * 0.012 + t * waveFreq * 60 + ry * 0.6) * waveAmp;
          const baseY = ry * cellSize + cellSize / 2;
          const py = baseY - (lum - 0.5) * amplitude + wave;
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.globalAlpha = 0.3 + 0.4 * hash(ry, 2.1);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawTint = () => {
      if (!tintOpacity) return;
      ctx.save();
      ctx.globalCompositeOperation = overlayBlend;
      ctx.globalAlpha = tintOpacity / 100;
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.restore();
    };

    const drawVignette = () => {
      const v = pfx.vignette;
      if (!v?.enabled) return;
      ctx.save();
      const grad = ctx.createRadialGradient(
        cssW / 2, cssH / 2, Math.min(cssW, cssH) * 0.25,
        cssW / 2, cssH / 2, Math.max(cssW, cssH) * 0.75,
      );
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `rgba(0,0,0,${v.intensity / 100})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.restore();
    };

    const drawScanLines = () => {
      const s = pfx.scanLines;
      if (!s?.enabled) return;
      ctx.save();
      ctx.globalAlpha = s.intensity / 100;
      ctx.fillStyle = "#000000";
      for (let y = 0; y < cssH; y += 3) {
        ctx.fillRect(0, y, cssW, 1);
      }
      ctx.restore();
    };

    const drawBloom = () => {
      const b = pfx.bloom;
      if (!b?.enabled) return;
      ctx.save();
      ctx.filter = "blur(6px)";
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = b.intensity / 100;
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, cssW, cssH);
      ctx.restore();
    };

    const render = (t: number) => {
      if (disposed) return;
      ctx.clearRect(0, 0, cssW, cssH);
      drawBackground();
      if (renderMode === "characters") drawCharacters(t / 1000);
      else drawContour(t / 1000);
      drawTint();
      drawBloom();
      drawVignette();
      drawScanLines();
      raf = requestAnimationFrame(render);
    };

    const onResize = () => resize();
    img.onload = () => {
      resize();
      raf = requestAnimationFrame(render);
    };
    if (img.complete && img.naturalWidth > 0) {
      resize();
      raf = requestAnimationFrame(render);
    }

    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
