import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { useT } from "@/i18n";
import { compressImageToDataUrl, stripUrlScheme } from "@/lib/coverImage";

const URL_INPUT =
  "min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none dark:text-white dark:placeholder:text-white/40";

/** Kapak görseli alanı: link yapıştırma + sürükle-bırak/dosya seçme ile yükleme
 *  bir arada (avatar / Stage yüklemedeki desenle aynı - ayrı bir dosya
 *  depolama servisi gerekmez, sıkıştırılmış data URL olarak saklanır). */
export function CoverImageField({
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
  label: string;
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
            {t("common.coverUploaded")}
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
          placeholder={dragOver ? t("common.coverDropHint") : placeholder}
          className={URL_INPUT}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="hit-40 flex shrink-0 items-center gap-1 border-l border-[var(--ink)]/10 px-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40 dark:border-white/10 dark:text-white/50 dark:hover:text-white"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
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
        {error ? t("common.coverUploadFailed") : t("common.coverDragHint")}
      </p>
    </div>
  );
}
