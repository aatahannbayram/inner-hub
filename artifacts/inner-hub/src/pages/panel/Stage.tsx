import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Globe,
  Loader2,
  Play,
  Plus,
  Rocket,
  Star,
  ThumbsUp,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { Lockup } from "@/components/Lockup";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState, CourseCardSkeleton } from "@/components/panel/Skeletons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/i18n";

const STAGE_FIELD =
  "w-full border border-[var(--ink)]/15 bg-[var(--ink)]/[0.04] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none transition-colors focus:border-[var(--ink)]/35 dark:border-white/18 dark:bg-white/[0.08] dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/35";

const STAGE_URL_INPUT =
  "min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none dark:text-white dark:placeholder:text-white/40";

type StagePeriod = "week" | "month" | "year" | "all";

type StageProduct = {
  id: number;
  title: string;
  url: string;
  pitch: string;
  votes: number;
  myVote: boolean;
  featured: boolean;
  imageUrl: string | null;
  productHuntUrl: string | null;
  productHuntId: string | null;
  phVotesCount: number | null;
  youtubeUrl: string | null;
  youtubeThumbnail: string | null;
  authorName: string | null;
  authorHandle: string | null;
};

type StageListResponse = {
  products: StageProduct[];
  stats?: { products: number; votes: number; showcase: number };
  period?: StagePeriod;
};

type LinkPreviewData = {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
};

const PERIODS: StagePeriod[] = ["week", "month", "year", "all"];
/** Bu uzunluğu aşan pitch'ler kartta kırpılır, "Devamını oku" ile açılır. */
const PITCH_CLAMP_CHARS = 140;

function ProductHuntMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      <circle cx="20" cy="20" r="20" fill="#DA552F" />
      <path
        fill="#fff"
        d="M22.7 12.5h-7.2c-.5 0-.9.4-.9.9v13.2c0 .5.4.9.9.9h2.2c.5 0 .9-.4.9-.9v-3.6h4.1c3.4 0 6.1-2.7 6.1-6.1s-2.7-6.4-6.1-6.4zm-.2 8.5h-3.9v-4.8h3.9c1.3 0 2.4 1.1 2.4 2.4s-1.1 2.4-2.4 2.4z"
      />
    </svg>
  );
}

/** Yapıştırılan metin başında değil de içinde bir http(s) linki taşıyorsa
 *  (ör. "[Ürünüm](https://site.com/x)" gibi zengin metin/markdown) o linki
 *  bulup çıkarır; yoksa metnin tamamını kullanır. Ardından şemayı ve baştaki
 *  eğik çizgileri temizler. "https://" ile yapıştırılan linkler de dahil,
 *  kullanıcının ne şekilde yapıştırdığından bağımsız tek bir temiz linke çevirir. */
function stripUrlScheme(raw: string): string {
  const trimmed = raw.trim();
  const embedded = trimmed.match(/https?:\/\/[^\s)\]"'<>]+/i);
  const candidate = embedded ? embedded[0] : trimmed;
  return candidate.replace(/^https?:\/\//i, "").replace(/^\/+/, "");
}

function toHttpsUrl(hostPath: string): string | null {
  const cleaned = stripUrlScheme(hostPath);
  if (!cleaned || !cleaned.includes(".")) return null;
  try {
    const u = new URL(`https://${cleaned}`);
    return u.toString();
  } catch {
    return null;
  }
}

function isProductHuntUrl(url: string): boolean {
  try {
    return new URL(url).hostname.replace(/^www\./, "") === "producthunt.com";
  } catch {
    return false;
  }
}

function PrefixedUrlField({
  label,
  prefix = "https://",
  value,
  onChange,
  placeholder,
  loading,
  mark,
}: {
  label: ReactNode;
  prefix?: string;
  value: string;
  onChange: (hostPath: string) => void;
  placeholder: string;
  loading?: boolean;
  mark?: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
        {mark}
        {label}
      </span>
      <div className="flex items-stretch border border-[var(--ink)]/15 bg-[var(--ink)]/[0.04] focus-within:border-[var(--ink)]/35 dark:border-white/18 dark:bg-white/[0.08] dark:focus-within:border-white/35">
        <span className="flex shrink-0 items-center border-r border-[var(--ink)]/10 bg-[var(--ink)]/[0.03] px-2.5 font-mono text-[11px] text-[var(--ink-muted)] dark:border-white/10">
          {prefix}
        </span>
        <input
          value={value}
          onChange={(e) => onChange(stripUrlScheme(e.target.value))}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (/https?:\/\//i.test(text)) {
              e.preventDefault();
              onChange(stripUrlScheme(text));
            }
          }}
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          className={STAGE_URL_INPUT}
        />
        {loading && (
          <span className="flex items-center pr-3">
            <Loader2 className="size-3.5 animate-spin text-[var(--ink-subtle)]" />
          </span>
        )}
      </div>
    </label>
  );
}

/** Dosyayı canvas üzerinden JPEG'e sıkıştırıp data URL'e çevirir (avatar
 *  yüklemedeki desenle aynı - ayrı bir dosya depolama servisi gerekmez). */
async function compressImageToDataUrl(file: File, maxChars = 280_000): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let w = bitmap.width;
  let h = bitmap.height;
  const maxDim = 1200;
  if (Math.max(w, h) > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  let quality = 0.85;
  let dataUrl = "";
  for (let attempt = 0; attempt < 12; attempt++) {
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(bitmap, 0, 0, w, h);
    dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= maxChars) break;
    if (quality > 0.45) quality -= 0.1;
    else {
      w = Math.max(160, Math.round(w * 0.75));
      h = Math.max(160, Math.round(h * 0.75));
    }
  }
  bitmap.close();
  if (dataUrl.length > maxChars) throw new Error("too_large");
  return dataUrl;
}

/** Kapak görseli alanı: link yapıştırma + sürükle-bırak/dosya seçme ile yükleme bir arada. */
function CoverImageField({
  urlPath,
  onUrlChange,
  uploadDataUrl,
  onUploadChange,
  label,
  placeholder,
}: {
  urlPath: string;
  onUrlChange: (hostPath: string) => void;
  uploadDataUrl: string | null;
  onUploadChange: (dataUrl: string | null) => void;
  label: ReactNode;
  placeholder: string;
}) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(true);
      return;
    }
    setBusy(true);
    setError(false);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      onUploadChange(dataUrl);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  if (uploadDataUrl) {
    return (
      <div className="space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          {label}
        </span>
        <div className="flex items-center gap-3 border border-[var(--ink)]/15 bg-[var(--ink)]/[0.04] p-2 dark:border-white/18 dark:bg-white/[0.08]">
          <img
            src={uploadDataUrl}
            alt=""
            className="size-10 shrink-0 border border-[var(--ink)]/10 object-cover dark:border-white/10"
          />
          <p className="min-w-0 flex-1 truncate text-xs text-[var(--ink-muted)] dark:text-white/55">
            {t("stage.coverUploaded")}
          </p>
          <button
            type="button"
            onClick={() => onUploadChange(null)}
            className="hit-40 flex shrink-0 items-center justify-center text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] dark:text-white/50 dark:hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
        {label}
      </span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={[
          "flex items-stretch border bg-[var(--ink)]/[0.04] transition-colors focus-within:border-[var(--ink)]/35 dark:bg-white/[0.08] dark:focus-within:border-white/35",
          dragOver
            ? "border-[var(--inner-green)]/60 bg-[var(--inner-green)]/5"
            : "border-[var(--ink)]/15 dark:border-white/18",
        ].join(" ")}
      >
        <span className="flex shrink-0 items-center border-r border-[var(--ink)]/10 bg-[var(--ink)]/[0.03] px-2.5 font-mono text-[11px] text-[var(--ink-muted)] dark:border-white/10">
          https://
        </span>
        <input
          value={urlPath}
          onChange={(e) => onUrlChange(stripUrlScheme(e.target.value))}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (/https?:\/\//i.test(text)) {
              e.preventDefault();
              onUrlChange(stripUrlScheme(text));
            }
          }}
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={dragOver ? t("stage.coverDropHint") : placeholder}
          className={STAGE_URL_INPUT}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="hit-40 flex shrink-0 items-center gap-1 border-l border-[var(--ink)]/10 px-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40 dark:border-white/10 dark:text-white/50 dark:hover:text-white"
        >
          {busy ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
      <p className="font-mono text-[9px] uppercase tracking-wide text-[var(--ink-subtle)] dark:text-white/35">
        {error ? t("stage.coverUploadFailed") : t("stage.coverDragHint")}
      </p>
    </div>
  );
}

const RANK_STYLES: Record<number, string> = {
  1: "border-[var(--inner-green)]/45 bg-[var(--inner-green)]/12 text-[var(--success-ink)]",
  2: "border-[var(--ink)]/25 bg-[var(--ink)]/8 text-[var(--ink)]",
  3: "border-[var(--ink)]/15 bg-[var(--ink)]/5 text-[var(--ink-body)]",
};

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={[
        "inline-flex size-6 shrink-0 items-center justify-center border font-mono text-[11px] font-medium",
        RANK_STYLES[rank] ?? "border-[var(--ink)]/10 bg-transparent text-[var(--ink-muted)]",
      ].join(" ")}
    >
      {rank}
    </span>
  );
}

function StageStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="panel-glass px-4 py-3">
      <p
        className="font-display font-serif text-2xl leading-none text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
      >
        {value}
      </p>
      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">
        {label}
      </p>
    </div>
  );
}

function ProductCard({
  product,
  rank,
  busy,
  onVote,
  isAdmin,
  adminBusy,
  onToggleFeatured,
  onRemove,
}: {
  product: StageProduct;
  rank?: number;
  busy?: boolean;
  onVote: (id: number) => void;
  isAdmin?: boolean;
  adminBusy?: boolean;
  onToggleFeatured?: (id: number, next: boolean) => void;
  onRemove?: (id: number) => void;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const isPitchLong = product.pitch.length > PITCH_CLAMP_CHARS;
  // Görsel 404/bozuksa banner'ı tamamen düşür - başlık/etiket/yazar artık
  // banner içinde render olduğu için, aksi halde bunlar da kaybolurdu.
  const banner = product.imageUrl && !imgFailed ? product.imageUrl : null;

  const badges = (
    <>
      {product.featured && (
        <span className="inline-flex items-center gap-1 border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[var(--success-ink)]">
          <Star className="size-2.5 fill-current" />
          {t("stage.featuredBadge")}
        </span>
      )}
      {product.productHuntUrl && (
        <span className="inline-flex items-center gap-1 border border-[#DA552F]/35 bg-[#DA552F]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[#DA552F]">
          <ProductHuntMark className="size-3 shrink-0" />
          {product.phVotesCount != null
            ? t("stage.phVotes", { n: product.phVotesCount })
            : t("stage.phBadge")}
        </span>
      )}
    </>
  );

  const voteButton = (overlay?: boolean) => (
    <button
      type="button"
      disabled={busy}
      onClick={() => onVote(product.id)}
      className={[
        "inline-flex shrink-0 items-center gap-1.5 px-3 py-2 font-mono text-label uppercase tracking-widest transition-colors disabled:opacity-40",
        overlay ? "min-h-9 backdrop-blur-sm" : "min-h-10",
        product.myVote
          ? overlay
            ? "border border-[var(--inner-green)]/50 bg-[var(--inner-green)]/25 text-[var(--inner-green)]"
            : "border border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 text-[var(--success-ink)]"
          : overlay
            ? "border border-white/25 bg-black/35 text-white hover:bg-black/50"
            : "panel-glass text-[var(--ink-body)] hover:border-[var(--ink)]/30",
      ].join(" ")}
    >
      <ThumbsUp className="size-3.5" />
      {product.votes}
    </button>
  );

  return (
    <article className="panel-glass overflow-hidden">
      {banner && (
        /* Kapak görseli her renkte olabilir (kullanıcı yüklüyor) - metnin
           her koşulda okunur kalması için alt kısımda sabit koyu bir
           gradyan var; metin rengi görsele göre değil, bu gradyana göre
           seçiliyor (her zaman beyaz + hafif gölge). */
        <div className="relative aspect-video w-full overflow-hidden bg-[var(--ink)]/[0.04]">
          <a
            href={product.youtubeUrl || product.url}
            target="_blank"
            rel="noreferrer"
            className="group/banner absolute inset-0 block"
          >
            <img
              src={banner}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover/banner:scale-[1.02]"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
            {product.youtubeUrl && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover/banner:bg-black/25">
                <span className="flex size-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                  <Play className="size-4 translate-x-0.5 fill-current" />
                </span>
              </span>
            )}
          </a>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
          {rank !== undefined && (
            <span className="pointer-events-none absolute left-3 top-3">
              <RankBadge rank={rank} />
            </span>
          )}
          <div className="absolute right-3 top-3">{voteButton(true)}</div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <p
                className="font-serif text-lg text-white"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.55)" }}
              >
                {product.title}
              </p>
              {badges}
            </div>
            {product.authorName ? (
              <p className="mt-0.5 font-mono text-label uppercase tracking-widest text-white/75">
                {product.authorHandle ? `@${product.authorHandle}` : product.authorName}
              </p>
            ) : null}
          </div>
        </div>
      )}
      <div className="p-4">
        {!banner && (
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {rank !== undefined && <RankBadge rank={rank} />}
              <div className="flex size-10 shrink-0 items-center justify-center border border-[var(--ink)]/10 bg-[var(--ink)]/[0.03] text-[var(--ink-subtle)]">
                <Globe className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-serif text-lg text-[var(--ink)]">{product.title}</p>
                  {badges}
                </div>
                {product.authorName ? (
                  <p className="mt-0.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {product.authorHandle ? `@${product.authorHandle}` : product.authorName}
                  </p>
                ) : null}
              </div>
            </div>
            {voteButton()}
          </div>
        )}

        <p
          className={[
            "whitespace-pre-line text-sm leading-relaxed text-[var(--ink-body)]",
            isPitchLong && !expanded ? "line-clamp-3" : "",
          ].join(" ")}
        >
          {product.pitch}
        </p>
        {isPitchLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="hit-40 mt-0.5 inline-flex items-center gap-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            {expanded ? t("stage.showLess") : t("stage.readMore")}
            {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          </button>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            {t("stage.openLink")}
            <ExternalLink className="size-3" />
          </a>
          {product.productHuntUrl && (
            <a
              href={product.productHuntUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            >
              {t("stage.openPh")}
              <ExternalLink className="size-3" />
            </a>
          )}
          {product.youtubeUrl && (
            <a
              href={product.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            >
              <Play className="size-3" />
              {t("stage.watchVideo")}
            </a>
          )}
        </div>

        {isAdmin && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--ink)]/[0.08] pt-3">
          <button
            type="button"
            disabled={adminBusy}
            onClick={() => onToggleFeatured?.(product.id, !product.featured)}
            className={[
              "inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40",
              product.featured
                ? "border-[var(--inner-green)]/35 bg-[var(--inner-green)]/10 text-[var(--success-ink)]"
                : "border-[var(--ink)]/10 text-[var(--ink-muted)] hover:border-[var(--ink)]/30",
            ].join(" ")}
          >
            <Star className={product.featured ? "size-3 fill-current" : "size-3"} />
            {product.featured ? t("stage.adminUnfeature") : t("stage.adminFeature")}
          </button>
          <button
            type="button"
            disabled={adminBusy}
            onClick={() => onRemove?.(product.id)}
            className="inline-flex items-center gap-1.5 border border-[var(--error-ink)]/25 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--error-ink)] transition-colors hover:bg-[var(--error-ink)]/5 disabled:opacity-40"
          >
            <Trash2 className="size-3" />
            {t("stage.adminRemove")}
          </button>
          </div>
        )}
      </div>
    </article>
  );
}

function SubmitDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [urlPath, setUrlPath] = useState("");
  const [pitch, setPitch] = useState("");
  const [phPath, setPhPath] = useState("");
  const [youtubePath, setYoutubePath] = useState("");
  const [coverPath, setCoverPath] = useState("");
  const [coverUpload, setCoverUpload] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleTouched, setTitleTouched] = useState(false);
  const [pitchTouched, setPitchTouched] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [phPreviewLoading, setPhPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  const applyPreview = (data: LinkPreviewData, opts?: { force?: boolean }) => {
    setPreview(data);
    if ((!titleTouched || opts?.force) && data.title) setTitle(data.title.slice(0, 120));
    if ((!pitchTouched || opts?.force) && data.description) setPitch(data.description.slice(0, 500));
  };

  // Ürün URL → başlık, pitch, logo, site adı; PH ise PH alanını da doldur
  useEffect(() => {
    const absolute = toHttpsUrl(urlPath);
    if (!absolute) {
      setPreview(null);
      setPreviewFailed(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewFailed(false);
      try {
        const res = await fetch(
          apiUrl(`/api/stage/link-preview?url=${encodeURIComponent(absolute)}`),
          { credentials: "include" },
        );
        if (!res.ok) {
          if (!cancelled) setPreviewFailed(true);
          return;
        }
        const data = (await res.json()) as LinkPreviewData;
        if (cancelled) return;
        applyPreview(data);
        if (isProductHuntUrl(absolute) && !phPath.trim()) {
          setPhPath(stripUrlScheme(absolute));
        }
      } catch {
        if (!cancelled) setPreviewFailed(true);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPath]);

  // Product Hunt URL → eksik alanları tamamla (ürün URL'si yoksa birincil kaynak)
  useEffect(() => {
    const absolute = toHttpsUrl(phPath);
    if (!absolute || !isProductHuntUrl(absolute)) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPhPreviewLoading(true);
      try {
        const res = await fetch(
          apiUrl(`/api/stage/link-preview?url=${encodeURIComponent(absolute)}`),
          { credentials: "include" },
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as LinkPreviewData;
        if (cancelled) return;
        if (!title.trim() || !titleTouched) {
          if (data.title) setTitle(data.title.slice(0, 120));
        }
        if (!pitch.trim() || !pitchTouched) {
          if (data.description) setPitch(data.description.slice(0, 500));
        }
        if (!preview?.image && data.image) {
          setPreview((prev) => ({
            title: prev?.title ?? data.title,
            description: prev?.description ?? data.description,
            image: data.image,
            siteName: prev?.siteName ?? data.siteName ?? "Product Hunt",
          }));
        }
      } catch {
        /* PH scrape opsiyonel */
      } finally {
        if (!cancelled) setPhPreviewLoading(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phPath]);

  const resetForm = () => {
    setTitle("");
    setUrlPath("");
    setPitch("");
    setPhPath("");
    setYoutubePath("");
    setCoverPath("");
    setCoverUpload(null);
    setPreview(null);
    setTitleTouched(false);
    setPitchTouched(false);
    setPreviewFailed(false);
    setError(null);
  };

  const submit = async () => {
    const absoluteUrl = toHttpsUrl(urlPath);
    if (!title.trim() || !absoluteUrl || !pitch.trim()) {
      setError(t("stage.urlInvalid"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const phAbsolute = toHttpsUrl(phPath);
      const youtubeAbsolute = toHttpsUrl(youtubePath);
      const coverAbsolute = toHttpsUrl(coverPath);
      const res = await fetch(apiUrl("/api/stage/products"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          url: absoluteUrl,
          pitch: pitch.trim(),
          imageUrl: coverUpload || coverAbsolute || preview?.image || null,
          productHuntUrl: phAbsolute || undefined,
          youtubeUrl: youtubeAbsolute || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("stage.submitFailed"));
      resetForm();
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e.message ?? t("stage.submitFailed"));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = Boolean(title.trim() && toHttpsUrl(urlPath) && pitch.trim());

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[min(92dvh,680px)] w-[calc(100%-1.5rem)] max-w-md gap-0 overflow-y-auto rounded-none border-[var(--ink)]/10 bg-[var(--bone)] p-0 dark:border-white/12 dark:bg-[#141414] sm:rounded-none">
        <DialogHeader className="space-y-1 border-b border-[var(--ink)]/[0.08] px-5 py-4 text-left dark:border-white/10">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            <span lang="en">inner·stage</span>
          </p>
          <DialogTitle
            className="font-serif text-2xl font-normal text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("stage.submit")}
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--ink-body)] dark:text-white/55">
            {t("stage.submitHint")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3.5 px-5 py-4">
          <PrefixedUrlField
            label={t("stage.fieldUrl")}
            value={urlPath}
            onChange={setUrlPath}
            placeholder={t("stage.urlPlaceholder")}
            loading={previewLoading}
          />

          {(preview || previewLoading || (urlPath.trim() && !previewFailed)) && (
            <div className="flex items-start gap-3 border border-[var(--ink)]/12 bg-[var(--ink)]/[0.03] p-3 dark:border-white/12 dark:bg-white/[0.05]">
              {preview?.image ? (
                <img
                  src={preview.image}
                  alt=""
                  className="size-10 shrink-0 border border-[var(--ink)]/10 bg-white object-contain p-0.5 dark:border-white/10"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center border border-[var(--ink)]/10 text-[var(--ink-subtle)] dark:border-white/10">
                  <Globe className="size-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[var(--ink)]">
                  {previewLoading
                    ? t("stage.previewLoading")
                    : preview?.title || t("stage.previewHint")}
                </p>
                {preview?.siteName && (
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-subtle)]">
                    {preview.siteName}
                  </p>
                )}
                {preview?.description && (
                  <p className="mt-1 line-clamp-2 text-xs leading-snug text-[var(--ink-muted)]">
                    {preview.description}
                  </p>
                )}
              </div>
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              {t("stage.fieldTitle")}
            </span>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleTouched(true);
              }}
              placeholder={t("stage.titlePlaceholder")}
              className={STAGE_FIELD}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
              {t("stage.fieldPitch")}
            </span>
            <textarea
              value={pitch}
              onChange={(e) => {
                setPitch(e.target.value);
                setPitchTouched(true);
              }}
              placeholder={t("stage.pitchPlaceholder")}
              rows={3}
              className={`${STAGE_FIELD} resize-none`}
            />
          </label>

          <CoverImageField
            label={t("stage.fieldCover")}
            urlPath={coverPath}
            onUrlChange={setCoverPath}
            uploadDataUrl={coverUpload}
            onUploadChange={setCoverUpload}
            placeholder={t("stage.coverPlaceholder")}
          />

          <PrefixedUrlField
            label={t("stage.fieldYoutube")}
            mark={<Play className="size-3 shrink-0" />}
            value={youtubePath}
            onChange={setYoutubePath}
            placeholder={t("stage.youtubePlaceholder")}
          />

          <PrefixedUrlField
            label={t("stage.fieldPh")}
            mark={<ProductHuntMark className="size-3.5 shrink-0" />}
            value={phPath}
            onChange={setPhPath}
            placeholder={t("stage.phPlaceholder")}
            loading={phPreviewLoading}
          />

          {error && <p className="text-xs text-[var(--error-ink)]">{error}</p>}
          <button
            type="button"
            disabled={busy || !canSubmit}
            onClick={() => void submit()}
            className="flex w-full items-center justify-center gap-1.5 panel-glass-ink px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3" />}
            {t("stage.submit")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function Stage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [adminBusyId, setAdminBusyId] = useState<number | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [sortMode, setSortMode] = useState<"votes" | "newest">("votes");
  const [period, setPeriod] = useState<StagePeriod>("week");

  const showcase = useApiQuery<StageListResponse>(
    ["stage-showcase", period],
    `/api/stage/showcase?period=${period}`,
  );
  const products = useApiQuery<StageListResponse>(
    ["stage-products", period],
    `/api/stage/products?period=${period}`,
  );
  const { data: meData } = useApiQuery<{ user: { role: "member" | "admin" } }>(
    ["auth-me"],
    "/api/auth/me",
  );
  const isAdmin = meData?.user?.role === "admin";

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["stage-showcase"] });
    void queryClient.invalidateQueries({ queryKey: ["stage-products"] });
  };

  const vote = async (id: number) => {
    setBusyId(id);
    try {
      const res = await fetch(apiUrl(`/api/stage/products/${id}/vote`), {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) refresh();
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = async (id: number, next: boolean) => {
    setAdminBusyId(id);
    try {
      const res = await fetch(apiUrl(`/api/stage/products/${id}`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: next }),
      });
      if (res.ok) refresh();
    } finally {
      setAdminBusyId(null);
    }
  };

  const removeProduct = async (id: number) => {
    if (!window.confirm(t("stage.confirmRemove"))) return;
    setAdminBusyId(id);
    try {
      const res = await fetch(apiUrl(`/api/stage/products/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) refresh();
    } finally {
      setAdminBusyId(null);
    }
  };

  const loading = showcase.isLoading || products.isLoading;
  const errored = showcase.isError || products.isError;
  const showcaseList = showcase.data?.products ?? [];
  const productList = products.data?.products ?? [];

  const sortedProducts = useMemo(() => {
    const list = [...productList];
    if (sortMode === "newest") list.sort((a, b) => b.id - a.id);
    return list;
  }, [productList, sortMode]);

  const statsProducts = products.data?.stats?.products ?? productList.length;
  const statsVotes = products.data?.stats?.votes ?? productList.reduce((s, p) => s + p.votes, 0);
  const statsShowcase = showcaseList.length;

  const showcaseHintKey =
    period === "week"
      ? "stage.showcaseHintWeek"
      : period === "month"
        ? "stage.showcaseHintMonth"
        : period === "year"
          ? "stage.showcaseHintYear"
          : "stage.showcaseHintAll";

  const periodLabel = (p: StagePeriod) =>
    p === "week"
      ? t("stage.periodWeek")
      : p === "month"
        ? t("stage.periodMonth")
        : p === "year"
          ? t("stage.periodYear")
          : t("stage.periodAll");

  return (
    <div className="min-w-0 max-w-2xl space-y-8">
      <FadeIn>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Lockup suffix="stage" className="text-[var(--ink)]" fontSize="1.15rem" />
          </div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("stage.title")}
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">{t("stage.subtitle")}</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.01}>
        <div className="flex flex-wrap gap-1 border border-[var(--ink)]/10 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={[
                "flex-1 px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors sm:flex-none",
                period === p
                  ? "bg-[var(--ink)] text-[var(--bone)]"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              {periodLabel(p)}
            </button>
          ))}
        </div>
      </FadeIn>

      {loading ? (
        <LoadingBlock label={t("stage.loading")}>
          <div className="space-y-2">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </LoadingBlock>
      ) : errored ? (
        <ErrorState
          message={t("stage.loadFailed")}
          onRetry={() => {
            void showcase.refetch();
            void products.refetch();
          }}
        />
      ) : (
        <>
          <FadeIn delay={0.02}>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StageStat value={statsProducts} label={t("stage.statsProducts")} />
              <StageStat value={statsVotes} label={t("stage.statsVotes")} />
              <StageStat value={statsShowcase} label={t("stage.statsShowcase")} />
            </div>
          </FadeIn>

          {showcaseList.length > 0 && (
            <FadeIn delay={0.04}>
              <section>
                <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                    {t("stage.showcase")}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">{t(showcaseHintKey)}</p>
                </div>
                <div className="space-y-3">
                  {showcaseList.map((p, i) => (
                    <ProductCard
                      key={`s-${p.id}`}
                      product={p}
                      rank={i + 1}
                      busy={busyId === p.id}
                      onVote={vote}
                      isAdmin={isAdmin}
                      adminBusy={adminBusyId === p.id}
                      onToggleFeatured={toggleFeatured}
                      onRemove={removeProduct}
                    />
                  ))}
                </div>
              </section>
            </FadeIn>
          )}

          <FadeIn delay={0.08}>
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ink)]/[0.08] pt-3">
                <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                  {t("stage.allProducts")}
                </p>
                <div className="flex items-center gap-2">
                  {productList.length > 0 && (
                    <div className="flex border border-[var(--ink)]/10">
                      <button
                        type="button"
                        onClick={() => setSortMode("votes")}
                        className={[
                          "px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                          sortMode === "votes"
                            ? "bg-[var(--ink)] text-[var(--bone)]"
                            : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                        ].join(" ")}
                      >
                        {t("stage.sortVotes")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortMode("newest")}
                        className={[
                          "px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                          sortMode === "newest"
                            ? "bg-[var(--ink)] text-[var(--bone)]"
                            : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                        ].join(" ")}
                      >
                        {t("stage.sortNewest")}
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setComposeOpen(true)}
                    className="inline-flex items-center gap-1.5 panel-glass-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80"
                  >
                    <Plus className="size-3" />
                    {t("stage.addProduct")}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {sortedProducts.length === 0 ? (
                  <div className="panel-glass flex flex-col items-center gap-3 px-6 py-10 text-center">
                    <Rocket className="size-6 text-[var(--ink-subtle)]" />
                    <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                      {t("stage.empty")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setComposeOpen(true)}
                      className="mt-1 inline-flex items-center gap-1.5 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80"
                    >
                      <Plus className="size-3" />
                      {t("stage.emptyCta")}
                    </button>
                  </div>
                ) : (
                  sortedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      busy={busyId === p.id}
                      onVote={vote}
                      isAdmin={isAdmin}
                      adminBusy={adminBusyId === p.id}
                      onToggleFeatured={toggleFeatured}
                      onRemove={removeProduct}
                    />
                  ))
                )}
              </div>
            </section>
          </FadeIn>
        </>
      )}

      <SubmitDialog open={composeOpen} onClose={() => setComposeOpen(false)} onAdded={refresh} />
    </div>
  );
}
