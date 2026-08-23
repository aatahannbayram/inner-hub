import { useMemo, useState } from "react";
import { Check, Copy, Newspaper, Plus } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { Lockup } from "@/components/Lockup";
import { listArtifacts } from "@/content/artifacts";
import type { Artifact, ArtifactKind } from "@/content/artifacts/types";
import { artifactPath } from "@/content/artifacts/types";
import { useT } from "@/i18n";

const DRAFT_KEY = "inner.haberler.drafts";

type Draft = {
  id: string;
  slug: string;
  kind: ArtifactKind;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  answerTr: string;
  bodyTr: string;
  tags: string;
  coverImage: string;
  updatedAt: string;
};

function readDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Draft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDrafts(drafts: Draft[]) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function emptyForm(): Omit<Draft, "id" | "updatedAt"> {
  return {
    slug: "",
    kind: "article",
    titleTr: "",
    titleEn: "",
    descriptionTr: "",
    answerTr: "",
    bodyTr: "",
    tags: "",
    coverImage: "/posters/gathering.jpg",
  };
}

/** Admin: Haberler / blog yapısı — draft + JSON export */
export default function HaberlerAdmin() {
  const t = useT();
  const published = listArtifacts();
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    typeof window === "undefined" ? [] : readDrafts(),
  );
  const [form, setForm] = useState(emptyForm);
  const [copied, setCopied] = useState(false);

  const artifactJson = useMemo(() => {
    const body = form.bodyTr
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const tags = form.tags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const slug = form.slug || slugify(form.titleTr) || "yeni-yazi";
    const artifact: Artifact = {
      slug,
      kind: form.kind,
      publishedAt: new Date().toISOString().slice(0, 10),
      author: { name: "inner hub", url: "https://inner.digital" },
      coverImage: form.coverImage || "/posters/gathering.jpg",
      coverAlt: form.titleTr || "inner hub",
      tr: {
        title: form.titleTr,
        description: form.descriptionTr,
        answer: form.answerTr,
        body,
        tags,
      },
      en: {
        title: form.titleEn || form.titleTr,
        description: form.descriptionTr,
        answer: form.answerTr,
        body,
        tags,
      },
    };
    return JSON.stringify(artifact, null, 2);
  }, [form]);

  const saveDraft = () => {
    if (!form.titleTr.trim()) return;
    const id = crypto.randomUUID();
    const next: Draft = {
      ...form,
      id,
      slug: form.slug || slugify(form.titleTr),
      updatedAt: new Date().toISOString(),
    };
    const all = [next, ...drafts];
    writeDrafts(all);
    setDrafts(all);
    setForm(emptyForm());
  };

  const copyExport = async () => {
    await navigator.clipboard.writeText(artifactJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.05rem" />
            <h1
              className="mt-2 font-display font-serif text-4xl text-[var(--ink)]"
              style={{ fontWeight: 600 }}
            >
              {t("haberlerAdmin.title")}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--ink-muted)]">{t("haberlerAdmin.subtitle")}</p>
          </div>
          <a
            href="/haberler"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] underline-offset-4 hover:underline"
          >
            {t("haberlerAdmin.viewPublic")}
          </a>
        </div>
      </FadeIn>

      <section className="panel-glass p-5">
        <div className="mb-4 flex items-center gap-2">
          <Newspaper className="size-4 text-[var(--ink-muted)]" />
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-[var(--ink-muted)]">
            {t("haberlerAdmin.published")} ({published.length})
          </h2>
        </div>
        <ul className="divide-y divide-[var(--ink)]/10">
          {published.map((p) => (
            <li key={p.slug} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="text-sm text-[var(--ink)]">{p.tr.title}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                  {p.kind} · {p.publishedAt} · {p.slug}
                </p>
              </div>
              <a
                href={artifactPath(p.slug)}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                {t("haberlerAdmin.open")}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-glass space-y-4 p-5">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-[var(--ink-muted)]">
          {t("haberlerAdmin.create")}
        </h2>
        <p className="text-xs text-[var(--ink-muted)]">{t("haberlerAdmin.createHint")}</p>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-xs">
            <span className="font-mono uppercase tracking-widest text-[var(--ink-muted)]">
              {t("haberlerAdmin.fieldTitleTr")}
            </span>
            <input
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm"
              value={form.titleTr}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  titleTr: e.target.value,
                  slug: f.slug || slugify(e.target.value),
                }))
              }
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-mono uppercase tracking-widest text-[var(--ink-muted)]">
              {t("haberlerAdmin.fieldTitleEn")}
            </span>
            <input
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm"
              value={form.titleEn}
              onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-mono uppercase tracking-widest text-[var(--ink-muted)]">Slug</span>
            <input
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 font-mono text-sm"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-mono uppercase tracking-widest text-[var(--ink-muted)]">Kind</span>
            <select
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm"
              value={form.kind}
              onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as ArtifactKind }))}
            >
              <option value="article">article</option>
              <option value="video">video</option>
            </select>
          </label>
        </div>

        <label className="block space-y-1 text-xs">
          <span className="font-mono uppercase tracking-widest text-[var(--ink-muted)]">
            {t("haberlerAdmin.fieldAnswer")}
          </span>
          <textarea
            rows={3}
            className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm"
            value={form.answerTr}
            onChange={(e) => setForm((f) => ({ ...f, answerTr: e.target.value }))}
            placeholder="AEO: 40-60 kelimelik net cevap"
          />
        </label>

        <label className="block space-y-1 text-xs">
          <span className="font-mono uppercase tracking-widest text-[var(--ink-muted)]">
            {t("haberlerAdmin.fieldDescription")}
          </span>
          <textarea
            rows={2}
            className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm"
            value={form.descriptionTr}
            onChange={(e) => setForm((f) => ({ ...f, descriptionTr: e.target.value }))}
          />
        </label>

        <label className="block space-y-1 text-xs">
          <span className="font-mono uppercase tracking-widest text-[var(--ink-muted)]">
            {t("haberlerAdmin.fieldBody")}
          </span>
          <textarea
            rows={8}
            className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm"
            value={form.bodyTr}
            onChange={(e) => setForm((f) => ({ ...f, bodyTr: e.target.value }))}
            placeholder="Her paragraf yeni satır"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-xs">
            <span className="font-mono uppercase tracking-widest text-[var(--ink-muted)]">Tags</span>
            <input
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 text-sm"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="seo, davetiye, gathering"
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-mono uppercase tracking-widest text-[var(--ink-muted)]">Cover</span>
            <input
              className="w-full border border-[var(--ink)]/15 bg-transparent px-3 py-2 font-mono text-sm"
              value={form.coverImage}
              onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveDraft}
            className="inline-flex items-center gap-2 bg-[var(--ink)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--bone)]"
          >
            <Plus className="size-3.5" />
            {t("haberlerAdmin.saveDraft")}
          </button>
          <button
            type="button"
            onClick={() => void copyExport()}
            className="inline-flex items-center gap-2 border border-[var(--ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? t("haberlerAdmin.copied") : t("haberlerAdmin.exportJson")}
          </button>
        </div>

        <pre className="max-h-56 overflow-auto border border-[var(--ink)]/10 bg-[var(--ink)]/[0.03] p-3 font-mono text-[10px] leading-relaxed text-[var(--ink-muted)]">
          {artifactJson}
        </pre>
      </section>

      {drafts.length > 0 && (
        <section className="panel-glass p-5">
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-muted)]">
            {t("haberlerAdmin.drafts")} ({drafts.length})
          </h2>
          <ul className="space-y-2">
            {drafts.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {d.titleTr}{" "}
                  <span className="font-mono text-[10px] text-[var(--ink-muted)]">/{d.slug}</span>
                </span>
                <button
                  type="button"
                  className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  onClick={() => {
                    const next = drafts.filter((x) => x.id !== d.id);
                    writeDrafts(next);
                    setDrafts(next);
                  }}
                >
                  {t("haberlerAdmin.delete")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
