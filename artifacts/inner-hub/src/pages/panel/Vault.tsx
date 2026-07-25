import { useState } from "react";
import { Lockup } from "@/components/Lockup";
import { useQueryClient } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import {
  Search,
  Lock,
  Globe,
  Users,
  FileText,
  BarChart2,
  Presentation,
  BookOpen,
  Code2,
  Upload,
  ChevronRight,
  Clock,
  Download,
  Paperclip,
} from "lucide-react";
import { ProceduralPortrait, type PortraitConfig } from "@/components/panel/ProceduralPortrait";
import { toLowerTR } from "@/lib/tr";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { motion } from "framer-motion";
import { cleanDisplayText } from "@/lib/displayText";

const D60_HERO_CONFIG: PortraitConfig = {
  renderMode: "contour",
  bgMode: "blur",
  bgBlur: 12,
  bgOpacity: 46,
  cellSize: 34,
  coverage: 64,
  invert: true,
  saturation: 100,
  grayscale: 0,
  tintOpacity: 0,
  color: "#0A0A0A",
  pfx: {
    vignette: { enabled: true, intensity: 38 },
    bloom: { enabled: true, intensity: 25 },
  },
  animStyle: "wave",
  animSpeed: 100,
  animIntensity: 60,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type AccessLevel = "özel" | "topluluk" | "davetli";
type DocType = "Pitch Deck" | "Araştırma" | "Not" | "Şablon" | "Kod" | "Rapor";

interface VaultDoc {
  id: number;
  title: string;
  type: DocType;
  access: AccessLevel;
  author: string;
  tags: string[];
  excerpt: string;
  updatedDays: number;
  pages?: number;
  views: number;
  mine?: boolean;
  hasFile?: boolean;
  fileName?: string | null;
  sizeBytes?: number | null;
}

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

function formatBytes(n: number | null | undefined): string {
  if (!n || n <= 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

async function downloadVaultFile(doc: VaultDoc) {
  const res = await fetch(apiUrl(`/api/vault/${doc.id}/file`), { credentials: "include" });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "İndirme başarısız");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.fileName || `vault-${doc.id}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<DocType, React.ComponentType<{ className?: string }>> = {
  "Pitch Deck": Presentation,
  "Araştırma": BarChart2,
  "Not": FileText,
  "Şablon": BookOpen,
  "Kod": Code2,
  "Rapor": FileText,
};

const ACCESS_CONFIG: Record<AccessLevel, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  özel: { icon: Lock, label: "Özel", color: "text-[var(--error-ink)]" },
  topluluk: { icon: Users, label: "Topluluk", color: "text-[var(--ink-body)]" },
  davetli: { icon: Globe, label: "Davetli", color: "text-[var(--success-ink)]" },
};

const DOC_TYPES: (DocType | "Tümü")[] = ["Tümü", "Pitch Deck", "Araştırma", "Not", "Şablon", "Kod", "Rapor"];

// ─── Doc card ─────────────────────────────────────────────────────────────────

function DocCard({ doc }: { doc: VaultDoc }) {
  const TypeIcon = TYPE_ICONS[doc.type] ?? FileText;
  const acc = ACCESS_CONFIG[doc.access] ?? ACCESS_CONFIG.topluluk;
  const AccIcon = acc.icon;
  const [dlBusy, setDlBusy] = useState(false);
  const [dlError, setDlError] = useState<string | null>(null);
  const title = cleanDisplayText(doc.title);
  const tags = doc.tags.slice(0, 3);

  const onDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!doc.hasFile || dlBusy) return;
    setDlBusy(true);
    setDlError(null);
    try {
      await downloadVaultFile(doc);
    } catch (err: any) {
      setDlError(err.message ?? "İndirme başarısız");
    } finally {
      setDlBusy(false);
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-[var(--ink)]/[0.1] bg-[var(--bone)] p-4 transition-colors hover:border-[var(--ink)]/28 sm:p-5">
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--ink)]/15 transition-colors group-hover:bg-[var(--inner-green)]" />

      <div className="mb-3 flex items-start justify-between gap-3 pl-1">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-[var(--ink)]/[0.1] bg-[var(--ink)]/[0.03]">
            <TypeIcon className="size-3.5 text-[var(--ink-muted)]" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
              {doc.type === "Pitch Deck" ? <span lang="en">{doc.type}</span> : doc.type}
              <span className="mx-1.5 text-[var(--ink)]/20">·</span>
              {doc.author}
            </p>
            <h3
              className="mt-1 font-display font-serif text-lg leading-snug tracking-[-0.02em] text-[var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            >
              {title}
            </h3>
          </div>
        </div>
        <div className={`inline-flex shrink-0 items-center gap-1 ${acc.color}`}>
          <AccIcon className="size-3" />
          <span className="font-mono text-[9px] uppercase tracking-widest">{acc.label}</span>
        </div>
      </div>

      {doc.excerpt ? (
        <p className="mb-3 line-clamp-2 pl-1 text-sm leading-relaxed text-[var(--ink-body)]">{doc.excerpt}</p>
      ) : null}

      {doc.hasFile && (
        <div className="mb-3 ml-1 flex items-center gap-2 border border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.02] px-2.5 py-2">
          <Paperclip className="size-3 shrink-0 text-[var(--ink-muted)]" />
          <span className="min-w-0 truncate font-mono text-[10px] text-[var(--ink)]">
            {doc.fileName || "dosya"}
          </span>
          {doc.sizeBytes ? (
            <span className="shrink-0 font-mono text-[10px] text-[var(--ink-muted)]">
              {formatBytes(doc.sizeBytes)}
            </span>
          ) : null}
        </div>
      )}

      {(tags.length > 0 || doc.mine) && (
        <div className="mb-3 flex flex-wrap gap-1 pl-1">
          {tags.map((t) => (
            <span
              key={t}
              className="border border-[var(--ink)]/10 px-1.5 py-0.5 font-mono text-[9px] text-[var(--ink-muted)]"
            >
              {t}
            </span>
          ))}
          {doc.mine && (
            <span className="border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10 px-1.5 py-0.5 font-mono text-[9px] text-[var(--success-ink)]">
              benim
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--ink)]/[0.06] pt-3 pl-1">
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-[var(--ink-muted)]">
          {doc.pages ? <li>{doc.pages} sayfa</li> : null}
          <li>{doc.views} görüntülenme</li>
          <li className="inline-flex items-center gap-1">
            <Clock className="size-2.5" aria-hidden />
            {doc.updatedDays === 0 ? "bugün" : `${doc.updatedDays}g önce`}
          </li>
        </ul>
        {doc.hasFile && (
          <button
            type="button"
            onClick={(e) => void onDownload(e)}
            disabled={dlBusy}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 bg-[var(--ink)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            <Download className="size-3" />
            {dlBusy ? "…" : "İndir"}
          </button>
        )}
      </div>
      {dlError && (
        <p className="mt-2 pl-1 font-mono text-[10px] text-[var(--error-ink)]" role="alert">
          {dlError}
        </p>
      )}
    </article>
  );
}

// ─── Upload drawer (vaul) ─────────────────────────────────────────────────────

function UploadPrompt({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [access, setAccess] = useState<AccessLevel>("topluluk");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [docType, setDocType] = useState<DocType>("Not");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() || busy) return;
    if (file && file.size > MAX_UPLOAD_BYTES) {
      setError("Dosya en fazla 12 MB olabilir");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/vault"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), excerpt: excerpt.trim(), type: docType, access }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Kaydedilemedi");

      const docId = json.document?.id as number | undefined;
      if (file && docId) {
        const up = await fetch(apiUrl(`/api/vault/${docId}/file`), {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
            "X-Filename": encodeURIComponent(file.name),
          },
          body: file,
        });
        const upJson = await up.json().catch(() => ({}));
        if (!up.ok) throw new Error(upJson.error ?? "Dosya yüklenemedi");
      }

      setTitle("");
      setExcerpt("");
      setFile(null);
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Kaydedilemedi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} shouldScaleBackground={false}>
      <DrawerContent className="rounded-none border-[var(--ink)]/15 bg-[var(--bone)]">
        <DrawerHeader className="px-6 pt-2 text-left">
          <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]"><span lang="en">inner·vault</span></p>
          <DrawerTitle
            className="font-serif text-2xl font-normal text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            Belge Paylaş
          </DrawerTitle>
          <DrawerDescription className="text-[var(--ink-body)]">
            Metadata + isteğe bağlı dosya (PDF, Office, görsel · en fazla 12 MB)
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-6 pb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Başlık"
            className="w-full border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Kısa özet"
            rows={3}
            className="w-full resize-none border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <label className="flex cursor-pointer flex-col gap-1 border border-dashed border-[var(--ink)]/20 px-3 py-3 transition-colors hover:border-[var(--ink)]/40">
            <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              Dosya (opsiyonel)
            </span>
            <span className="text-sm text-[var(--ink-body)]">
              {file ? `${file.name} · ${formatBytes(file.size)}` : "PDF, DOCX, PPTX, PNG… seç"}
            </span>
            <input
              type="file"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DOC_TYPES.filter((t): t is DocType => t !== "Tümü").map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDocType(t)}
                className={[
                  "border px-2.5 py-1 font-mono text-label uppercase tracking-widest",
                  docType === t ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]" : "border-[var(--ink)]/10 text-[var(--ink-muted)]",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">Erişim Seviyesi</p>
            <div className="flex gap-2">
              {(["özel", "topluluk", "davetli"] as AccessLevel[]).map((a) => {
                const cfg = ACCESS_CONFIG[a];
                const Icon = cfg.icon;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAccess(a)}
                    className={[
                      "flex flex-1 flex-col items-center gap-1 border py-2.5 transition-all",
                      access === a
                        ? "border-[var(--ink)] bg-[var(--ink)]/[0.04]"
                        : "border-[var(--ink)]/10 hover:border-[var(--ink)]/25",
                    ].join(" ")}
                  >
                    <Icon className={`size-3.5 ${cfg.color}`} />
                    <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="font-mono text-label text-[var(--error-ink)]" role="alert">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[var(--ink)]/15 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-all hover:border-[var(--ink)]/30 hover:text-[var(--ink)]"
            >
              İptal
            </button>
            <button
              type="button"
              disabled={busy || !title.trim()}
              onClick={() => void submit()}
              className="flex flex-1 items-center justify-between border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              <span>{busy ? "Kaydediliyor…" : "Kaydet"}</span>
              <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Vault() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocType | "Tümü">("Tümü");
  const [showUpload, setShowUpload] = useState(false);
  const { data, isLoading, isError, error, refetch } = useApiQuery<{ documents: VaultDoc[] }>(
    ["vault"],
    "/api/vault",
  );
  const docs = data?.documents ?? [];

  const filtered = docs.filter((d) => {
    const matchType = typeFilter === "Tümü" || d.type === typeFilter;
    const q = toLowerTR(query);
    const matchQuery =
      !query ||
      toLowerTR(d.title).includes(q) ||
      d.tags.some((t) => toLowerTR(t).includes(q)) ||
      toLowerTR(d.author).includes(q);
    return matchType && matchQuery;
  });

  const myDocs = docs.filter((d) => d.mine).length;
  const totalDocs = docs.length;
  const totalViews = docs.reduce((s, d) => s + d.views, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-body)]">
              Knowledge base
            </p>
            <h1
              className="font-display font-serif text-4xl text-[var(--ink)] md:text-5xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
            >
              <Lockup suffix="vault" className="text-[var(--ink)]" />
            </h1>
            <p className="mt-2 max-w-[42ch] text-sm font-light text-[var(--ink-muted)]">
              Topluluğun özel bilgi tabanı. Paylaş, öğren, referans al.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[var(--ink)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-85 sm:w-auto"
          >
            <Upload className="size-3.5" />
            Paylaş
          </button>
        </div>
      </FadeIn>

      {isLoading && docs.length === 0 && <LoadingBlock label="Vault yükleniyor" />}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : "Vault yüklenemedi"}
          onRetry={() => refetch()}
        />
      )}

      {/* D60-hero portrait — topographic contour rendering of the archive's depth */}
      <FadeIn delay={0.03}>
        <div className="relative overflow-hidden border border-[var(--ink)]/[0.08] bg-[var(--bone)]">
          <ProceduralPortrait
            src="/editorial/circle-portrait.jpg"
            config={D60_HERO_CONFIG}
            className="aspect-[21/9] w-full md:aspect-[24/9]"
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              D60 · arşivin haritası
            </p>
            <p className="max-w-[26ch] font-serif text-2xl text-[var(--ink)] md:text-3xl" style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}>
              Her belge, dairenin bir katmanı.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "Toplam Belge", value: totalDocs },
          { label: "Paylaşımlarım", value: myDocs },
          { label: "Görüntülenme", value: totalViews },
        ].map((s) => (
          <div key={s.label} className="border border-[var(--ink)]/[0.1] p-3 sm:p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-muted)] sm:text-[10px]">
              {s.label}
            </p>
            <p
              className="mt-1 font-display font-serif text-xl text-[var(--ink)] sm:text-2xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 400 }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Featured strip — Embla */}
      {docs.length > 0 && (
      <FadeIn delay={0.06}>
        <div className="space-y-3">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            Öne çıkan
          </p>
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-3">
              {docs.slice(0, 5).map((doc, i) => {
                const Icon = TYPE_ICONS[doc.type] ?? FileText;
                return (
                  <CarouselItem key={doc.id} className="basis-[78%] pl-3 sm:basis-[45%] md:basis-[38%]">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative h-40 overflow-hidden border border-[var(--ink)]/[0.08] bg-[var(--ink)]"
                    >
                      <div
                        className="absolute inset-0 opacity-90 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                        style={{
                          background:
                            i % 2 === 0
                              ? "radial-gradient(circle at 20% 20%, rgba(24,255,133,0.18), transparent 45%), linear-gradient(135deg, #0A0A0A, #1a1a1a)"
                              : "radial-gradient(circle at 80% 30%, rgba(244,241,236,0.12), transparent 40%), linear-gradient(160deg, #111, #0A0A0A)",
                        }}
                      />
                      <div className="relative flex h-full flex-col justify-between p-4">
                        <div className="flex items-center gap-2">
                          <Icon className="size-3.5 text-[var(--bone)]/50" />
                          <span className="font-mono text-label uppercase tracking-widest text-[var(--bone)]/57">
                            {doc.type === "Pitch Deck" ? <span lang="en">{doc.type}</span> : doc.type}
                          </span>
                        </div>
                        <div>
                          <p className="line-clamp-2 font-serif text-lg leading-snug text-[var(--bone)]"
                            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1", fontWeight: 300 }}
                          >
                            {cleanDisplayText(doc.title)}
                          </p>
                          <p className="mt-1 font-mono text-label uppercase tracking-widest text-[var(--bone)]/52">
                            {doc.author}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-0 hidden border-[var(--ink)]/15 bg-[var(--bone)] sm:flex" />
            <CarouselNext className="right-0 hidden border-[var(--ink)]/15 bg-[var(--bone)] sm:flex" />
          </Carousel>
        </div>
      </FadeIn>
      )}

      {/* Search + filter row */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-subtle)]" />
          <input
            type="search"
            placeholder="Belge, etiket veya yazar ara…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-[var(--ink)]/[0.1] bg-transparent py-3 pl-9 pr-4 text-sm font-light text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-subtle)] focus:border-[var(--ink)]/30"
          />
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DOC_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={[
                "shrink-0 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
                typeFilter === t
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                  : "border-[var(--ink)]/12 text-[var(--ink-muted)] hover:border-[var(--ink)]/30",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((doc) => (
          <DocCard key={doc.id} doc={doc} />
        ))}
      </div>
      {!isLoading && !isError && filtered.length === 0 && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
          Belge bulunamadı.
        </p>
      )}

      <UploadPrompt
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: ["vault"] });
        }}
      />

      <div className="flex flex-wrap items-center gap-4 border-t border-[var(--ink)]/[0.08] pt-4">
        {(Object.entries(ACCESS_CONFIG) as [AccessLevel, typeof ACCESS_CONFIG[AccessLevel]][]).map(
          ([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className={`flex items-center gap-1.5 ${cfg.color}`}>
                <Icon className="size-3" />
                <span className="font-mono text-[9px] uppercase tracking-widest">{cfg.label}</span>
              </div>
            );
          },
        )}
        <p className="ml-auto font-mono text-[10px] uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·vault</span> · yalnızca üyeler
        </p>
      </div>
    </div>
  );
}
