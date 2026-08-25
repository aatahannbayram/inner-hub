export type QrCodeDataType = number;

export function encode(
  data: string | number[],
  options?: {
    ecc?: "L" | "M" | "Q" | "H";
    boostEcc?: boolean;
    minVersion?: number;
    maxVersion?: number;
    maskPattern?: number;
    border?: number;
    invert?: boolean;
  },
): { version: number; size: number; data: boolean[][]; types: number[][] };

export function renderSVG(
  data: string | number[],
  options?: {
    ecc?: "L" | "M" | "Q" | "H";
    boostEcc?: boolean;
    border?: number;
    pixelSize?: number;
    whiteColor?: string;
    blackColor?: string;
    invert?: boolean;
  },
): string;
