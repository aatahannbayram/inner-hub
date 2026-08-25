import { renderSVG } from "./uqr.mjs";

/** Brand-aligned QR SVG for public profile URLs. */
export function renderProfileQrSvg(url: string, opts?: { pixelSize?: number }): string {
  return renderSVG(url, {
    ecc: "M",
    border: 2,
    pixelSize: opts?.pixelSize ?? 8,
    whiteColor: "#F4F1EC",
    blackColor: "#0A0A0A",
  });
}
