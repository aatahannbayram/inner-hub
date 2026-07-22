const HF_BASE = "https://platform.higgsfield.ai";

/** Kredi-tasarruflu varsayılanlar — deneme/yanılma yerine tek net üretim */
export const HF_EFFICIENT = {
  /** Platform API model id (soul ailesi, düşük maliyet) */
  modelId: "higgsfield-ai/soul/standard",
  aspectRatio: "16:9" as const,
  resolution: "720p" as const,
  /** Aynı insight için yeniden üretim cooldown (ms) */
  cooldownMs: 10 * 60 * 1000,
};

function getAuthHeader(): string {
  const key = process.env.HF_API_KEY ?? process.env.HIGGSFIELD_API_KEY;
  const secret =
    process.env.HF_API_SECRET ?? process.env.HIGGSFIELD_API_SECRET;
  if (!key || !secret) {
    throw new Error(
      "HF_API_KEY ve HF_API_SECRET ortam değişkenleri tanımlı değil",
    );
  }
  return `Key ${key}:${secret}`;
}

export type HiggsfieldStatus =
  | "queued"
  | "in_progress"
  | "completed"
  | "failed"
  | "nsfw"
  | "canceled";

export type HiggsfieldResult = {
  status: HiggsfieldStatus;
  request_id: string;
  status_url?: string;
  cancel_url?: string;
  images?: Array<{ url: string }>;
  video?: { url: string };
  error?: string;
};

/** Marka kilidi: ilk denemede tutarlı sonuç, yeniden üretim ihtiyacını düşürür */
export function buildSignalVisualPrompt(insight: string): string {
  const cleaned = insight.replace(/\s+/g, " ").trim().slice(0, 280);
  return [
    "Single editorial photograph, private founders circle mood, Istanbul at dusk.",
    "Palette: warm bone #F4F1EC surfaces, deep ink #0A0A0A shadows, one small accent of electric green light #18FF85.",
    "Restrained luxury, cinematic shallow depth of field, no people faces, no logos, no typography, no UI.",
    "Quiet architecture and atmosphere only.",
    `Concept: ${cleaned}`,
  ].join(" ");
}

const lastSubmitByKey = new Map<string, number>();

export async function submitImageGeneration(input: {
  prompt: string;
  aspectRatio?: string;
  resolution?: string;
  modelId?: string;
  /** Aynı anahtar için cooldown (kredi koruması) */
  rateLimitKey?: string;
  force?: boolean;
}): Promise<HiggsfieldResult> {
  const modelId = input.modelId ?? HF_EFFICIENT.modelId;
  const resolution = HF_EFFICIENT.resolution; // HQ'ya yükseltmeyi bilinçli olarak kapat
  const aspectRatio = input.aspectRatio ?? HF_EFFICIENT.aspectRatio;

  if (input.rateLimitKey && !input.force) {
    const last = lastSubmitByKey.get(input.rateLimitKey) ?? 0;
    const left = HF_EFFICIENT.cooldownMs - (Date.now() - last);
    if (left > 0) {
      throw new Error(
        `Kredi koruması: ${Math.ceil(left / 60000)} dk içinde yeniden üretim yok. Mevcut görseli kullan.`,
      );
    }
  }

  const res = await fetch(`${HF_BASE}/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      prompt: input.prompt,
      aspect_ratio: aspectRatio,
      resolution,
    }),
  });

  const data = (await res.json()) as HiggsfieldResult & { detail?: string };
  if (!res.ok) {
    throw new Error(data.detail ?? data.error ?? `Higgsfield ${res.status}`);
  }

  if (input.rateLimitKey) {
    lastSubmitByKey.set(input.rateLimitKey, Date.now());
  }

  return data;
}

export async function getGenerationStatus(
  requestId: string,
): Promise<HiggsfieldResult> {
  const res = await fetch(`${HF_BASE}/requests/${requestId}/status`, {
    headers: {
      Authorization: getAuthHeader(),
      Accept: "application/json",
    },
  });

  const data = (await res.json()) as HiggsfieldResult & { detail?: string };
  if (!res.ok) {
    throw new Error(data.detail ?? data.error ?? `Higgsfield ${res.status}`);
  }
  return data;
}

export function isHiggsfieldConfigured(): boolean {
  return Boolean(
    (process.env.HF_API_KEY ?? process.env.HIGGSFIELD_API_KEY) &&
      (process.env.HF_API_SECRET ?? process.env.HIGGSFIELD_API_SECRET),
  );
}
