import { useEffect, useMemo, useState } from "react";
import { Lockup } from "@/components/Lockup";
import { useQueryClient } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { AmbientCardBackground } from "@/components/panel/AmbientCardBackground";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Shield,
  Globe,
  Github,
  Linkedin,
  ChevronRight,
  Check,
  X,
  Link2,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
} from "lucide-react";
import { Link } from "wouter";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";
import { useLocale, useT } from "@/i18n";

type CustomLink = {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
  featured: boolean;
  scheduledFrom?: string | null;
  scheduledTo?: string | null;
  icon?: string | null;
};

type CardTheme = {
  accent: string;
  bg: string;
  layout: "stack" | "card";
};

const CARD_THEME_PRESETS: { id: string; labelKey: string; theme: CardTheme }[] = [
  { id: "ink", labelKey: "id.themeInk", theme: { accent: "#0A0A0A", bg: "#F4F1EC", layout: "stack" } },
  { id: "green", labelKey: "id.themeGreen", theme: { accent: "#18FF85", bg: "#F4F1EC", layout: "stack" } },
  { id: "slate", labelKey: "id.themeSlate", theme: { accent: "#1F2937", bg: "#EEF1F4", layout: "card" } },
  { id: "olive", labelKey: "id.themeOlive", theme: { accent: "#3D4A2E", bg: "#F2EFE6", layout: "stack" } },
  { id: "navy", labelKey: "id.themeNavy", theme: { accent: "#0B1F33", bg: "#E8EEF2", layout: "card" } },
  { id: "sand", labelKey: "id.themeSand", theme: { accent: "#5C4A32", bg: "#F6F0E6", layout: "stack" } },
];

const MAX_CUSTOM_LINKS = 12;
const MAX_FEATURED = 2;

type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: "member" | "admin";
  persona?: string | null;
  membershipPlan?: string | null;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  handle?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
  websiteLogoUrl?: string | null;
  linkedinLogoUrl?: string | null;
  githubLogoUrl?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  behance?: string | null;
  phone?: string | null;
  showPhoneOnCard?: boolean | null;
  profileLinks?: CustomLink[];
  cardTheme?: CardTheme | null;
  skills?: string[];
  visibility?: string | null;
  profileCompletionPct?: number;
  createdAt?: string;
};

type LinkKey = "linkedin" | "github" | "website";

type SitePreview = {
  title: string | null;
  description: string | null;
  image: string | null;
  company?: string | null;
  website?: string | null;
};

type PreviewNetwork = "website" | "linkedin" | "github";

function stripPrefix(value: string, prefixes: string[]): string {
  let v = value.trim();
  for (const p of prefixes) {
    if (v.toLowerCase().startsWith(p.toLowerCase())) v = v.slice(p.length);
  }
  return v.replace(/^\/+/, "");
}

function toAbsoluteWebsite(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function cleanSiteTitle(title: string, hostname: string): string {
  let t = title.trim();
  const host = hostname.replace(/^www\./i, "");
  t = t.replace(new RegExp(`[\\s|\\-–—:·]+${host.replace(/\./g, "\\.")}.*$`, "i"), "").trim();
  t = t.replace(/\s*[|\-–—·]\s*(Home|Anasayfa|Official(?: Site)?|Welcome).*$/i, "").trim();
  return t.slice(0, 50);
}

function handleFromUser(user: ApiUser): string {
  if (user.handle?.trim()) return user.handle.trim().toLowerCase();
  return (user.email.split("@")[0] || "uye").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

function formatMemberSince(iso: string | undefined, locale: string, noneLabel: string): string {
  if (!iso) return noneLabel;
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
    month: "long",
    year: "numeric",
  });
}

function buildSnippets(handle: string, name: string, badgeAlt: string) {
  const profile = `https://inner.digital/u/${handle}`;
  const short = `https://inner.digital/@${handle}`;
  const badge = `https://inner.digital/api/badge/${handle}.svg`;
  const card = `https://inner.digital/api/badge/${handle}/card.svg`;
  return {
    html: `<a href="${profile}" target="_blank" rel="noopener">
  <img src="${badge}" alt="${badgeAlt}" height="28" />
</a>`,
    card: `<a href="${profile}" target="_blank" rel="noopener">
  <img src="${card}" alt="${name} · inner·id" width="320" height="96" />
</a>`,
    markdown: `[![${badgeAlt}](${badge})](${profile})

[![${name}](${card})](${profile})`,
    json: `{
  "name": ${JSON.stringify(name)},
  "handle": ${JSON.stringify(handle)},
  "verified": true,
  "profile": ${JSON.stringify(profile)},
  "short": ${JSON.stringify(short)},
  "badge": ${JSON.stringify(badge)},
  "card": ${JSON.stringify(card)}
}`,
  } as const;
}

type SnippetTab = "html" | "card" | "markdown" | "json";

function IdCard({
  user,
  handle,
  skills,
}: {
  user: ApiUser;
  handle: string;
  skills: string[];
}) {
  const t = useT();
  const { locale } = useLocale();
  const isFounder =
    user.membershipPlan === "founder" || user.persona === "founder";
  const tier = isFounder ? t("id.tierFounder") : t("id.tierMember");
  const badges = [
    isFounder ? t("id.badgeFounder") : t("id.badgeMember"),
    ...(user.title ? [user.title] : []),
    ...skills.slice(0, 2),
  ].filter(Boolean);

  return (
    <div className="relative overflow-hidden panel-glass-ink p-6">
      <AmbientCardBackground />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 23px,var(--bone-fixed) 23px,var(--bone-fixed) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,var(--bone-fixed) 23px,var(--bone-fixed) 24px)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/47">
              <span lang="en">inner·id</span>
            </span>
            <span className="font-mono text-label text-[var(--bone-fixed)]/37">·</span>
            <span className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/47">
              #{String(user.id).padStart(3, "0")}
            </span>
          </div>

          <div className="mb-1 flex items-start gap-2">
            <span
              className="min-w-0 break-words font-serif text-2xl text-[var(--bone-fixed)] sm:text-3xl"
              style={{ fontWeight: 600 }}
            >
              {user.name}
            </span>
            <CheckCircle2 className="size-4 shrink-0 text-[var(--success-ink)]" />
          </div>

          <p className="mb-4 break-words font-mono text-caption text-[var(--bone-fixed)]/57">
            @{handle}
            {user.title || user.company
              ? ` · ${[user.title, user.company].filter(Boolean).join(", ")}`
              : ""}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b}
                className="border border-[var(--bone-fixed)]/15 px-2 py-0.5 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/50"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <div className="size-16 overflow-hidden border border-[var(--bone-fixed)]/15 bg-[var(--bone-fixed)]">
            <img
              src={apiUrl(`/api/me/id/qr.svg?t=${user.id}`)}
              alt=""
              width={64}
              height={64}
              className="size-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center");
              }}
            />
          </div>
          <span className="border border-[var(--inner-green)]/40 bg-[var(--inner-green)]/10 px-2.5 py-1 font-mono text-label uppercase tracking-widest text-[var(--success-ink)]">
            {tier}
          </span>
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-[var(--bone-fixed)]/[0.08] pt-4">
        <div>
          <p className="font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]/42">
            {t("id.profileCompletion")}
          </p>
          <p className="font-mono text-sm text-[var(--bone-fixed)]/70">%{user.profileCompletionPct ?? 0}</p>
        </div>
        <p className="font-mono text-label text-[var(--bone-fixed)]/37">
          {t("id.memberSince", {
            date: formatMemberSince(user.createdAt, locale, t("id.none")),
          })}
        </p>
      </div>
    </div>
  );
}

type Visibility = "public" | "members" | "private";

function CardStudio({
  handle,
  visibility,
  onVisibility,
  saving,
  phone,
  showPhoneOnCard,
  onShowPhone,
}: {
  handle: string;
  visibility: Visibility;
  onVisibility: (v: Visibility) => Promise<void>;
  saving: boolean;
  phone: string;
  showPhoneOnCard: boolean;
  onShowPhone: (v: boolean) => Promise<void>;
}) {
  const t = useT();
  const isPublic = visibility === "public";
  const qrSrc = apiUrl(`/api/me/id/qr.svg`);
  const options: { value: Visibility; label: string; desc: string }[] = [
    {
      value: "public",
      label: t("id.visibilityPublic"),
      desc: t("id.visibilityPublicDesc").replace("{handle}", handle || "…"),
    },
    {
      value: "members",
      label: t("id.visibilityMembers"),
      desc: t("id.visibilityMembersDesc"),
    },
    {
      value: "private",
      label: t("id.visibilityPrivate"),
      desc: t("id.visibilityPrivateDesc"),
    },
  ];

  const downloadSvg = async () => {
    const res = await fetch(qrSrc, { credentials: "include" });
    if (!res.ok) return;
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `inner-id-${handle || "card"}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPng = async () => {
    const res = await fetch(qrSrc, { credentials: "include" });
    if (!res.ok) return;
    const svgText = await res.text();
    const img = new Image();
    const svgUrl = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("png"));
      img.src = svgUrl;
    });
    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#F4F1EC";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(svgUrl);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `inner-id-${handle || "card"}.png`;
    a.click();
  };

  return (
    <section className="space-y-4">
      <div className="border-t border-[var(--ink)]/[0.08] pt-3">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
          {t("id.cardStudio")}
        </p>
        <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{t("id.cardStudioHint")}</p>
      </div>

      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label={t("id.cardStudio")}>
        {options.map((opt) => {
          const active = visibility === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={saving}
              onClick={() => void onVisibility(opt.value)}
              className={[
                "flex items-start gap-3 border px-3 py-3 text-left transition-colors",
                active
                  ? "border-[var(--ink)] bg-[var(--ink)]/[0.04]"
                  : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/25",
              ].join(" ")}
            >
              <span
                className={[
                  "mt-0.5 flex size-3.5 shrink-0 items-center justify-center border",
                  active ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--ink)]/30",
                ].join(" ")}
              >
                {active && <span className="size-1.5 bg-[var(--bone)]" />}
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-label uppercase tracking-widest text-[var(--ink)]">
                  {opt.label}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">{opt.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={showPhoneOnCard}
        disabled={saving || !phone}
        onClick={() => void onShowPhone(!showPhoneOnCard)}
        className={[
          "flex w-full items-start gap-3 border px-3 py-3 text-left transition-colors",
          showPhoneOnCard
            ? "border-[var(--ink)] bg-[var(--ink)]/[0.04]"
            : "border-[var(--ink)]/[0.08] hover:border-[var(--ink)]/25",
          !phone ? "opacity-60" : "",
        ].join(" ")}
      >
        <span
          className={[
            "mt-0.5 flex h-4 w-7 shrink-0 items-center border px-0.5 transition-colors",
            showPhoneOnCard ? "border-[var(--ink)] bg-[var(--ink)] justify-end" : "border-[var(--ink)]/30 justify-start",
          ].join(" ")}
        >
          <span className="size-2.5 bg-[var(--bone)]" />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-label uppercase tracking-widest text-[var(--ink)]">
            {t("id.showPhone")}
          </span>
          <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
            {phone ? t("id.showPhoneDesc") : t("id.phoneMissing")}
            {phone ? ` · ${phone}` : ""}
          </span>
        </span>
      </button>

      {!isPublic && (
        <div className="flex flex-col gap-2 border border-[var(--ink)]/10 bg-[var(--ink)]/[0.02] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-label text-[var(--ink-muted)]">{t("id.qrNeedsPublic")}</p>
          <button
            type="button"
            disabled={saving}
            onClick={() => void onVisibility("public")}
            className="shrink-0 border border-[var(--ink)] bg-[var(--ink)] px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone)]"
          >
            {t("id.makePublic")}
          </button>
        </div>
      )}

      <div className="panel-glass p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="mx-auto size-36 shrink-0 overflow-hidden border border-[var(--ink)]/10 bg-[var(--bone)] sm:mx-0">
            <img src={qrSrc} alt="" width={144} height={144} className="size-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                {t("id.qrTitle")}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">
                {t("id.qrHint").replace("{handle}", handle || "…")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void downloadSvg()}
                className="flex items-center gap-1.5 border border-[var(--ink)]/15 px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] hover:border-[var(--ink)]/40"
              >
                <Download className="size-3" />
                {t("id.qrDownloadSvg")}
              </button>
              <button
                type="button"
                onClick={() => void downloadPng()}
                className="flex items-center gap-1.5 border border-[var(--ink)]/15 px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] hover:border-[var(--ink)]/40"
              >
                <Download className="size-3" />
                {t("id.qrDownloadPng")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <PrintCardPanel handle={handle} />
      <CardStatsPanel />
    </section>
  );
}

function downloadNamedSvg(url: string, filename: string) {
  return fetch(url, { credentials: "include" })
    .then((res) => (res.ok ? res.blob() : null))
    .then((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    });
}

function PrintCardPanel({ handle }: { handle: string }) {
  const t = useT();
  const frontSrc = apiUrl("/api/me/id/card-front.svg");
  const backSrc = apiUrl("/api/me/id/card-back.svg");
  const shortUrl = handle ? `inner.digital/@${handle}` : "inner.digital/@…";

  const printBoth = () => {
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>inner·id card</title>
<style>
  @page { size: auto; margin: 12mm; }
  body { margin: 0; font-family: ui-monospace, monospace; background: #fff; color: #0a0a0a; }
  .sheet { display: flex; flex-direction: column; gap: 16mm; align-items: center; padding: 12mm; }
  img { width: 85mm; height: 55mm; border: 0.2mm solid #ccc; }
  p { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #666; }
  @media print { p { display: none; } }
</style></head><body>
<div class="sheet">
  <p>Front · 85×55mm</p>
  <img src="${frontSrc}" alt="front" />
  <p>Back · NFC: ${shortUrl}</p>
  <img src="${backSrc}" alt="back" />
</div>
<script>window.onload=()=>{setTimeout(()=>window.print(),200)}</script>
</body></html>`);
    w.document.close();
  };

  return (
    <div className="panel-glass space-y-3 p-4">
      <div>
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
          {t("id.printCard")}
        </p>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">{t("id.printCardHint")}</p>
        <p className="mt-1 font-mono text-caption text-[var(--ink-subtle)]">{shortUrl}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <img
          src={frontSrc}
          alt=""
          className="w-full max-w-[220px] border border-[var(--ink)]/10 bg-[var(--ink)]"
        />
        <img
          src={backSrc}
          alt=""
          className="w-full max-w-[220px] border border-[var(--ink)]/10 bg-[var(--bone)]"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void downloadNamedSvg(frontSrc, `inner-id-${handle || "card"}-front.svg`)}
          className="flex items-center gap-1.5 border border-[var(--ink)]/15 px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] hover:border-[var(--ink)]/40"
        >
          <Download className="size-3" />
          {t("id.printFront")}
        </button>
        <button
          type="button"
          onClick={() => void downloadNamedSvg(backSrc, `inner-id-${handle || "card"}-back.svg`)}
          className="flex items-center gap-1.5 border border-[var(--ink)]/15 px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] hover:border-[var(--ink)]/40"
        >
          <Download className="size-3" />
          {t("id.printBack")}
        </button>
        <button
          type="button"
          onClick={printBoth}
          className="flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--ink)] px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone)]"
        >
          {t("id.printNow")}
        </button>
      </div>
    </div>
  );
}

type CardStats = {
  views7d: number;
  views30d: number;
  vcards7d: number;
  links7d: number;
  qr7d: number;
  shares7d: number;
  viewsTotal: number;
  linkClicks?: { key: string; n: number }[];
  devices?: { device: string; n: number }[];
  topReferrers?: { referrer: string; n: number }[];
};

function CardStatsPanel() {
  const t = useT();
  const { data } = useApiQuery<{ stats: CardStats }>(["id-card-stats"], "/api/me/id/stats");
  const s = data?.stats;

  if (!s) return null;

  const items = [
    { label: t("id.statViews7"), value: s.views7d },
    { label: t("id.statViews30"), value: s.views30d },
    { label: t("id.statLinks"), value: s.links7d },
    { label: t("id.statVcards"), value: s.vcards7d },
  ];

  return (
    <div className="border border-[var(--ink)]/[0.08] px-4 py-3">
      <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
        {t("id.statTitle")}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label}>
            <p className="font-mono text-xl text-[var(--ink)]">{it.value}</p>
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {it.label}
            </p>
          </div>
        ))}
      </div>
      {(s.linkClicks?.length ?? 0) > 0 && (
        <div className="mt-3 border-t border-[var(--ink)]/[0.06] pt-3">
          <p className="mb-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("id.statPerLink")}
          </p>
          <ul className="space-y-1">
            {s.linkClicks!.map((row) => (
              <li
                key={row.key}
                className="flex items-center justify-between gap-3 font-mono text-caption text-[var(--ink-body)]"
              >
                <span className="truncate">{row.key}</span>
                <span className="tabular-nums text-[var(--ink)]">{row.n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {(s.devices?.length ?? 0) > 0 && (
        <div className="mt-3 border-t border-[var(--ink)]/[0.06] pt-3">
          <p className="mb-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("id.statDevices")}
          </p>
          <div className="flex flex-wrap gap-2">
            {s.devices!.map((d) => (
              <span
                key={d.device}
                className="border border-[var(--ink)]/10 px-2 py-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]"
              >
                {d.device} · {d.n}
              </span>
            ))}
          </div>
        </div>
      )}
      {(s.topReferrers?.length ?? 0) > 0 && (
        <div className="mt-3 border-t border-[var(--ink)]/[0.06] pt-3">
          <p className="mb-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            {t("id.statReferrers")}
          </p>
          <ul className="space-y-1">
            {s.topReferrers!.slice(0, 5).map((r) => (
              <li
                key={r.referrer}
                className="flex items-center justify-between gap-3 font-mono text-caption text-[var(--ink-body)]"
              >
                <span className="truncate">{r.referrer}</span>
                <span className="tabular-nums text-[var(--ink)]">{r.n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-2 font-mono text-caption text-[var(--ink-subtle)]">
        {t("id.statTotal", { n: String(s.viewsTotal) })}
      </p>
    </div>
  );
}

function EmbedSection({ handle, name }: { handle: string; name: string }) {
  const t = useT();
  const badgeAlt = `inner·hub ${t("common.member")}`;
  const snippets = useMemo(() => buildSnippets(handle, name, badgeAlt), [handle, name, badgeAlt]);
  const [tab, setTab] = useState<SnippetTab>("html");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippets[tab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="panel-glass">
      <div className="flex border-b border-[var(--ink)]/[0.08]">
        {(Object.keys(snippets) as SnippetTab[]).map((snippetTab) => (
          <button
            key={snippetTab}
            type="button"
            onClick={() => setTab(snippetTab)}
            className={[
              "border-r border-[var(--ink)]/[0.08] px-4 py-2.5 font-mono text-label uppercase tracking-widest transition-colors last:border-0",
              tab === snippetTab
                ? "bg-[var(--ink)] text-[var(--bone)]"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {snippetTab}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void copy()}
          className="ml-auto flex items-center gap-1.5 px-4 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
        >
          <Copy className="size-3" />
          {copied ? t("common.copied") : t("common.copy")}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[var(--ink)]/[0.02] p-4 font-mono text-caption leading-relaxed text-[var(--ink-body)]">
        {snippets[tab]}
      </pre>
    </div>
  );
}

function PlatformBindRow({
  icon: Icon,
  label,
  desc,
  brandColor,
  iconOnLight,
  logoUrl,
  prefix,
  value,
  placeholder,
  connected,
  previewNetwork,
  onSave,
  onUnlink,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  brandColor?: string;
  iconOnLight?: boolean;
  logoUrl?: string | null;
  prefix: string;
  value: string;
  placeholder: string;
  connected: boolean;
  previewNetwork?: PreviewNetwork;
  onSave: (payload: {
    value: string;
    preview?: SitePreview | null;
  }) => Promise<void>;
  onUnlink: () => Promise<void>;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SitePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const enableSitePreview = Boolean(previewNetwork);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!previewNetwork || !editing) return;
    const trimmed = draft.trim();
    if (!trimmed) {
      setPreview(null);
      setPreviewFailed(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewFailed(false);
      try {
        let data: SitePreview | null = null;
        if (previewNetwork === "website") {
          const absolute = toAbsoluteWebsite(trimmed);
          if (!absolute) {
            if (!cancelled) {
              setPreview(null);
              setPreviewFailed(false);
            }
            return;
          }
          const res = await fetch(
            apiUrl(`/api/stage/link-preview?url=${encodeURIComponent(absolute)}`),
            { credentials: "include" },
          );
          if (!res.ok) throw new Error("preview failed");
          data = (await res.json()) as SitePreview;
        } else {
          const res = await fetch(
            apiUrl(
              `/api/social-preview?network=${previewNetwork}&handle=${encodeURIComponent(trimmed)}`,
            ),
            { credentials: "include" },
          );
          if (!res.ok) throw new Error("preview failed");
          data = (await res.json()) as SitePreview;
        }
        if (!cancelled) setPreview(data);
      } catch {
        if (!cancelled) {
          setPreview(null);
          setPreviewFailed(true);
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [draft, editing, previewNetwork]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSave({ value: draft.trim(), preview: enableSitePreview ? preview : null });
      setEditing(false);
    } catch (e: any) {
      setError(e.message ?? t("id.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    setError(null);
    try {
      await onUnlink();
      setEditing(false);
      setPreview(null);
    } catch (e: any) {
      setError(e.message ?? t("id.removeFailed"));
    } finally {
      setBusy(false);
    }
  };

  const displayLogo = (editing && preview?.image) || logoUrl || null;

  return (
    <div className="panel-glass p-4 transition-all hover:border-[var(--ink)]/20">
      <div className="flex items-center gap-4">
        <div
          className={
            brandColor || displayLogo
              ? "flex size-9 shrink-0 items-center justify-center overflow-hidden border shadow-sm"
              : "flex size-9 shrink-0 items-center justify-center panel-glass"
          }
          style={
            brandColor && !displayLogo
              ? {
                  backgroundColor: brandColor,
                  borderColor: iconOnLight ? "rgba(255,255,255,0.25)" : brandColor,
                }
              : displayLogo
                ? { backgroundColor: "#fff", borderColor: "rgba(255,255,255,0.2)" }
                : undefined
          }
        >
          {displayLogo ? (
            <img
              src={displayLogo}
              alt=""
              className="size-full object-contain p-0.5"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Icon
              className={
                brandColor
                  ? iconOnLight
                    ? "size-[18px] text-[#0d1117] [&_path]:fill-current"
                    : "size-4 text-[var(--bone-fixed,#F4F1EC)]"
                  : "size-4 text-[var(--ink)]"
              }
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm text-[var(--ink)]">{label}</p>
            {connected && (
              <span className="border border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10 px-1.5 py-0.5 font-mono text-label uppercase tracking-widest text-[var(--success-ink)]">
                {t("id.connected")}
              </span>
            )}
          </div>
          <p className="font-mono text-label text-[var(--ink-muted)]">
            {connected ? `${prefix}${value}` : desc}
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setEditing(true);
              setError(null);
              setPreview(null);
            }}
            className="flex shrink-0 items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            {connected ? t("common.edit") : t("id.connect")} <ChevronRight className="size-3" />
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-3 space-y-2 border-t border-[var(--ink)]/[0.06] pt-3">
          <div className="flex items-stretch panel-glass focus-within:border-[var(--ink)]/30">
            <span className="flex items-center border-r border-[var(--ink)]/[0.08] bg-[var(--ink)]/[0.03] px-3 font-mono text-label text-[var(--ink-body)]">
              {prefix}
            </span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent px-3 py-2 font-mono text-caption text-[var(--ink)] outline-none"
              autoFocus
            />
            {enableSitePreview && previewLoading && (
              <span className="flex items-center pr-3">
                <Loader2 className="size-3.5 animate-spin text-[var(--ink-subtle)]" />
              </span>
            )}
          </div>

          {enableSitePreview && (preview || previewLoading || (draft.trim() && !previewFailed)) && (
            <div className="flex items-start gap-3 border border-[var(--ink)]/12 bg-[var(--ink)]/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.04]">
              {preview?.image ? (
                <img
                  src={preview.image}
                  alt=""
                  className="size-9 shrink-0 border border-[var(--ink)]/10 bg-white object-contain p-0.5"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center border border-[var(--ink)]/10 text-[var(--ink-subtle)]">
                  <Globe className="size-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[var(--ink)]">
                  {previewLoading
                    ? t("id.sitePreviewLoading")
                    : preview?.title || t("id.sitePreviewHint")}
                </p>
                {preview?.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--ink-muted)]">
                    {preview.description}
                  </p>
                )}
                {!previewLoading && preview && (
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-subtle)]">
                    {t("id.siteBridgeHint")}
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !draft.trim()}
              onClick={() => void save()}
              className="flex items-center gap-1.5 panel-glass-ink px-3 py-1.5 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] disabled:opacity-40"
            >
              <Check className="size-3" /> {busy ? t("common.saving") : t("common.save")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 panel-glass px-3 py-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"
            >
              <X className="size-3" /> {t("common.cancel")}
            </button>
            {connected && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void unlink()}
                className="ml-auto font-mono text-label uppercase tracking-widest text-[var(--error-ink)]"
              >
                {t("id.unlink")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const t = Date.parse(s);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

function normalizeLinks(links: CustomLink[]): CustomLink[] {
  return links
    .map((l, i) => ({
      ...l,
      sortOrder: i,
      featured: Boolean(l.featured),
      scheduledFrom: l.scheduledFrom ?? null,
      scheduledTo: l.scheduledTo ?? null,
    }))
    .map((l, i, arr) => {
      const featuredBefore = arr.slice(0, i).filter((x) => x.featured).length;
      return {
        ...l,
        featured: l.featured && featuredBefore < MAX_FEATURED,
      };
    });
}

function CustomLinksEditor({
  links,
  onSave,
}: {
  links: CustomLink[];
  onSave: (next: CustomLink[]) => Promise<void>;
}) {
  const t = useT();
  const [draftUrl, setDraftUrl] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ordered = useMemo(
    () =>
      normalizeLinks(
        [...links].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id)),
      ),
    [links],
  );
  const atLimit = ordered.length >= MAX_CUSTOM_LINKS;
  const featuredCount = ordered.filter((l) => l.featured).length;

  const persist = async (next: CustomLink[]) => {
    setBusy(true);
    setError(null);
    try {
      await onSave(normalizeLinks(next));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("id.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    const url = draftUrl.trim();
    if (!url || busy) return;
    if (atLimit) {
      setError(t("id.linkLimit"));
      return;
    }
    await persist([
      ...ordered,
      {
        id: crypto.randomUUID().slice(0, 8),
        label: draftLabel.trim(),
        url,
        sortOrder: ordered.length,
        featured: false,
        scheduledFrom: null,
        scheduledTo: null,
      },
    ]);
    setDraftUrl("");
    setDraftLabel("");
  };

  const remove = async (id: string) => {
    if (busy) return;
    await persist(ordered.filter((l) => l.id !== id));
  };

  const move = async (id: string, dir: -1 | 1) => {
    if (busy) return;
    const idx = ordered.findIndex((l) => l.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= ordered.length) return;
    const next = [...ordered];
    const tmp = next[idx]!;
    next[idx] = next[swap]!;
    next[swap] = tmp;
    await persist(next);
  };

  const toggleFeatured = async (id: string) => {
    if (busy) return;
    const target = ordered.find((l) => l.id === id);
    if (!target) return;
    if (!target.featured && featuredCount >= MAX_FEATURED) {
      setError(t("id.featuredLimit"));
      return;
    }
    await persist(
      ordered.map((l) => (l.id === id ? { ...l, featured: !l.featured } : l)),
    );
  };

  const setSchedule = async (
    id: string,
    field: "scheduledFrom" | "scheduledTo",
    value: string,
  ) => {
    if (busy) return;
    await persist(
      ordered.map((l) =>
        l.id === id ? { ...l, [field]: localInputToIso(value) } : l,
      ),
    );
  };

  return (
    <section>
      <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            {t("id.moreLinks")}
          </p>
          <p className="font-mono text-label tabular-nums text-[var(--ink-subtle)]">
            {ordered.length}/{MAX_CUSTOM_LINKS}
          </p>
        </div>
        <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{t("id.moreLinksHint")}</p>
      </div>
      <div className="space-y-2">
        {ordered.length > 0 && (
          <div className={ordered.length > 4 ? "max-h-[28rem] space-y-2 overflow-y-auto pr-0.5" : "space-y-2"}>
            {ordered.map((link, idx) => (
              <div
                key={link.id}
                className={[
                  "panel-glass space-y-2 px-3 py-2.5 transition-colors hover:border-[var(--ink)]/25",
                  link.featured ? "border-[var(--ink)]/35 bg-[var(--ink)]/[0.03]" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={busy || idx === 0}
                      onClick={() => void move(link.id, -1)}
                      className="p-0.5 text-[var(--ink-muted)] disabled:opacity-30 hover:text-[var(--ink)]"
                      aria-label={t("id.moveUp")}
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={busy || idx === ordered.length - 1}
                      onClick={() => void move(link.id, 1)}
                      className="p-0.5 text-[var(--ink-muted)] disabled:opacity-30 hover:text-[var(--ink)]"
                      aria-label={t("id.moveDown")}
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                  <Globe className="size-3.5 shrink-0 text-[var(--ink-muted)]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[var(--ink)]">{link.label || link.url}</p>
                    <p className="truncate font-mono text-label text-[var(--ink-muted)]">{link.url}</p>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void toggleFeatured(link.id)}
                    className={[
                      "shrink-0 p-2",
                      link.featured ? "text-[var(--ink)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                    ].join(" ")}
                    aria-label={t("id.featured")}
                    title={t("id.featured")}
                  >
                    <Star className={`size-3.5 ${link.featured ? "fill-current" : ""}`} />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void remove(link.id)}
                    className="shrink-0 p-2 text-[var(--ink-muted)] hover:text-[var(--error-ink)]"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 pl-8">
                  <label>
                    <span className="mb-0.5 block font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
                      {t("id.scheduleFrom")}
                    </span>
                    <input
                      type="datetime-local"
                      value={isoToLocalInput(link.scheduledFrom)}
                      disabled={busy}
                      onChange={(e) => void setSchedule(link.id, "scheduledFrom", e.target.value)}
                      className="h-8 w-full bg-transparent font-mono text-caption text-[var(--ink)] outline-none"
                    />
                  </label>
                  <label>
                    <span className="mb-0.5 block font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
                      {t("id.scheduleTo")}
                    </span>
                    <input
                      type="datetime-local"
                      value={isoToLocalInput(link.scheduledTo)}
                      disabled={busy}
                      onChange={(e) => void setSchedule(link.id, "scheduledTo", e.target.value)}
                      className="h-8 w-full bg-transparent font-mono text-caption text-[var(--ink)] outline-none"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        {atLimit ? (
          <p className="font-mono text-label text-[var(--ink-muted)]">{t("id.linkLimit")}</p>
        ) : (
          <div className="flex flex-col gap-2 panel-glass p-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="mb-1 block font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                {t("id.linkUrl")}
              </span>
              <input
                type="url"
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                placeholder={t("id.linkUrlPlaceholder")}
                className="h-10 w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-subtle)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void add();
                  }
                }}
              />
            </label>
            <label className="min-w-0 sm:w-40">
              <span className="mb-1 block font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                {t("id.linkLabel")}
              </span>
              <input
                type="text"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder={t("id.linkLabelPlaceholder")}
                maxLength={48}
                className="h-10 w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-subtle)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void add();
                  }
                }}
              />
            </label>
            <button
              type="button"
              disabled={busy || !draftUrl.trim()}
              onClick={() => void add()}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 bg-[var(--ink)] px-3 font-mono text-label uppercase tracking-widest text-[var(--bone)] disabled:opacity-40"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              {t("id.addLink")}
            </button>
          </div>
        )}
        {error && (
          <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

function CardThemeStudio({
  theme,
  onSave,
}: {
  theme: CardTheme;
  onSave: (next: CardTheme) => Promise<void>;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const current = theme ?? CARD_THEME_PRESETS[0]!.theme;

  const apply = async (next: CardTheme) => {
    setBusy(true);
    try {
      await onSave(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
          {t("id.cardTheme")}
        </p>
        <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{t("id.cardThemeHint")}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CARD_THEME_PRESETS.map((p) => {
          const active =
            p.theme.accent.toUpperCase() === current.accent.toUpperCase() &&
            p.theme.bg.toUpperCase() === current.bg.toUpperCase() &&
            p.theme.layout === current.layout;
          return (
            <button
              key={p.id}
              type="button"
              disabled={busy}
              onClick={() => void apply(p.theme)}
              className={[
                "border px-3 py-3 text-left transition-colors",
                active
                  ? "border-[var(--ink)] bg-[var(--ink)]/[0.04]"
                  : "border-[var(--ink)]/10 hover:border-[var(--ink)]/30",
              ].join(" ")}
            >
              <span className="mb-2 flex gap-1.5">
                <span className="size-4 border border-[var(--ink)]/15" style={{ background: p.theme.accent }} />
                <span className="size-4 border border-[var(--ink)]/15" style={{ background: p.theme.bg }} />
              </span>
              <span className="block font-mono text-label uppercase tracking-widest text-[var(--ink)]">
                {t(p.labelKey)}
              </span>
              <span className="font-mono text-caption text-[var(--ink-muted)]">{p.theme.layout}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function InnerId() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useApiQuery<{ user: ApiUser }>(
    ["auth-me"],
    "/api/auth/me",
  );
  const user = data?.user;
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [visibilitySaving, setVisibilitySaving] = useState(false);

  const handle = user ? handleFromUser(user) : "";
  const skills = Array.isArray(user?.skills) ? user!.skills! : [];
  const linkedin = stripPrefix(user?.linkedin ?? "", ["https://", "http://", "www.", "linkedin.com/in/"]);
  const github = stripPrefix(user?.github ?? "", ["https://", "http://", "www.", "github.com/"]);
  const website = stripPrefix(user?.website ?? "", ["https://", "http://"]);
  const websiteLogoUrl = user?.websiteLogoUrl ?? null;
  const linkedinLogoUrl = user?.linkedinLogoUrl ?? null;
  const githubLogoUrl = user?.githubLogoUrl ?? null;
  const publicUrl = handle ? `inner.digital/u/${handle}` : "inner.digital/u/…";
  const visibility: Visibility =
    user?.visibility === "public" || user?.visibility === "private" || user?.visibility === "members"
      ? user.visibility
      : "members";

  const patchProfile = async (fields: Record<string, unknown>) => {
    if (!user) return;
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    const res = await fetch(apiUrl("/api/auth/me"), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: parts[0] ?? user.name,
        lastName: parts.slice(1).join(" "),
        handle: user.handle ?? handle,
        title: user.title ?? "",
        company: user.company ?? "",
        bio: user.bio ?? "",
        skills,
        linkedin,
        github,
        website,
        websiteLogoUrl: websiteLogoUrl ?? "",
        linkedinLogoUrl: linkedinLogoUrl ?? "",
        githubLogoUrl: githubLogoUrl ?? "",
        twitter: stripPrefix(user.twitter ?? "", ["https://", "http://", "www.", "x.com/", "twitter.com/"]),
        phone: user.phone ?? "",
        showPhoneOnCard: Boolean(user.showPhoneOnCard),
        profileLinks: Array.isArray(user.profileLinks) ? user.profileLinks : [],
        cardTheme: user.cardTheme ?? CARD_THEME_PRESETS[0]!.theme,
        visibility:
          user.visibility === "public" || user.visibility === "private" || user.visibility === "members"
            ? user.visibility
            : "members",
        ...fields,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? t("id.saveFailed"));
    await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    window.dispatchEvent(new CustomEvent("inner-profile-updated", { detail: json.user }));
  };

  const setVisibility = async (next: Visibility) => {
    setVisibilitySaving(true);
    try {
      await patchProfile({ visibility: next });
    } finally {
      setVisibilitySaving(false);
    }
  };

  const setShowPhone = async (next: boolean) => {
    setVisibilitySaving(true);
    try {
      await patchProfile({ showPhoneOnCard: next });
    } finally {
      setVisibilitySaving(false);
    }
  };

  const patchLinks = async (
    patch: Partial<Record<LinkKey, string | null>> & {
      websiteLogoUrl?: string | null;
      linkedinLogoUrl?: string | null;
      githubLogoUrl?: string | null;
    },
  ) => {
    await patchProfile({
      linkedin: patch.linkedin !== undefined ? patch.linkedin ?? "" : linkedin,
      github: patch.github !== undefined ? patch.github ?? "" : github,
      website: patch.website !== undefined ? patch.website ?? "" : website,
      websiteLogoUrl:
        patch.websiteLogoUrl !== undefined
          ? patch.websiteLogoUrl ?? ""
          : patch.website === "" || patch.website === null
            ? ""
            : websiteLogoUrl ?? "",
      linkedinLogoUrl:
        patch.linkedinLogoUrl !== undefined
          ? patch.linkedinLogoUrl ?? ""
          : patch.linkedin === "" || patch.linkedin === null
            ? ""
            : linkedinLogoUrl ?? "",
      githubLogoUrl:
        patch.githubLogoUrl !== undefined
          ? patch.githubLogoUrl ?? ""
          : patch.github === "" || patch.github === null
            ? ""
            : githubLogoUrl ?? "",
    });
  };

  if (isLoading && !user) {
    return (
      <div className="max-w-2xl">
        <LoadingBlock label={t("id.loading")} />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-2xl">
        <ErrorState
          message={error instanceof Error ? error.message : t("id.loadError")}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-2xl space-y-8 overflow-x-hidden">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("id.eyebrow")}
            </p>
            <h1
              className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
              style={{ fontWeight: 600 }}
            >
              <Lockup suffix="id" className="text-[var(--ink)]" />
            </h1>
            <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">
              {t("id.subtitle")}
            </p>
          </div>
          <Link
            href="/panel/profile"
            className="flex shrink-0 items-center gap-1.5 self-start panel-glass px-3 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
          >
            <Link2 className="size-3" /> {t("id.editProfile")}
          </Link>
        </div>
      </FadeIn>

      <IdCard user={user} handle={handle} skills={skills} />

      <div>
        <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
          {t("id.publicProfile")}
        </p>
        <div className="flex flex-col gap-3 panel-glass px-4 py-3 sm:flex-row sm:items-center sm:gap-2">
          <Globe className="size-3.5 shrink-0 text-[var(--ink-subtle)]" />
          <span className="min-w-0 flex-1 break-all font-mono text-sm text-[var(--ink-body)] sm:text-caption">{publicUrl}</span>
          <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`https://${publicUrl}`);
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2000);
              } catch {
                /* ignore */
              }
            }}
            className="flex items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            <Copy className="size-3" /> {copiedUrl ? t("common.copied") : t("common.copy")}
          </button>
          <a
            href={`https://${publicUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            <ExternalLink className="size-3" /> {t("common.view")}
          </a>
          </div>
        </div>
        {handle && (
          <p className="mt-2 font-mono text-label text-[var(--ink-muted)]">
            {t("id.shortUrl")}:{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-[var(--ink)]"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`https://inner.digital/@${handle}`);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                } catch {
                  /* ignore */
                }
              }}
            >
              inner.digital/@{handle}
            </button>
          </p>
        )}
        {!user.handle && (
          <p className="mt-2 font-mono text-label text-[var(--ink-muted)]">
            <Link href="/panel/profile" className="underline underline-offset-2">
              {t("id.setHandle")}
            </Link>
          </p>
        )}
      </div>

      <CardStudio
        handle={handle}
        visibility={visibility}
        onVisibility={setVisibility}
        saving={visibilitySaving}
        phone={(user.phone ?? "").trim()}
        showPhoneOnCard={Boolean(user.showPhoneOnCard)}
        onShowPhone={setShowPhone}
      />

      <div>
        <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
          {t("id.skills")}
        </p>
        {skills.length === 0 ? (
          <p className="font-mono text-label text-[var(--ink-muted)]">
            {t("id.noSkills")}{" "}
            <Link href="/panel/profile" className="underline underline-offset-2">
              {t("id.addInProfile")}
            </Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="panel-glass px-3 py-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <section>
        <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            {t("id.platformLinks")}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            {t("id.platformLinksHint")}
          </p>
        </div>
        <div className="space-y-2">
          <PlatformBindRow
            icon={Linkedin}
            label="LinkedIn"
            desc={t("id.linkedinDesc")}
            brandColor="#0A66C2"
            logoUrl={linkedinLogoUrl}
            prefix="linkedin.com/in/"
            placeholder="profiladin"
            value={linkedin}
            connected={!!linkedin}
            previewNetwork="linkedin"
            onSave={async ({ value: v, preview }) => {
              const cleaned = stripPrefix(v, [
                "linkedin.com/in/",
                "www.linkedin.com/in/",
                "https://",
                "http://",
              ]);
              const nextCompany =
                !user.company?.trim() && preview?.company ? preview.company : undefined;
              const nextBio =
                !user.bio?.trim() && preview?.description
                  ? preview.description.slice(0, 160)
                  : undefined;
              const nextTitle =
                !user.title?.trim() && preview?.company && preview?.title
                  ? undefined
                  : !user.title?.trim() &&
                      preview?.description &&
                      preview.description.length <= 50
                    ? preview.description
                    : undefined;
              await patchProfile({
                linkedin: cleaned,
                linkedinLogoUrl: preview?.image ?? "",
                ...(nextCompany ? { company: nextCompany } : {}),
                ...(nextBio ? { bio: nextBio } : {}),
                ...(nextTitle ? { title: nextTitle } : {}),
              });
            }}
            onUnlink={() => patchLinks({ linkedin: "", linkedinLogoUrl: "" })}
          />
          <PlatformBindRow
            icon={Github}
            label="GitHub"
            desc={t("id.githubDesc")}
            brandColor="#FFFFFF"
            iconOnLight
            logoUrl={githubLogoUrl}
            prefix="github.com/"
            placeholder="kullaniciadi"
            value={github}
            connected={!!github}
            previewNetwork="github"
            onSave={async ({ value: v, preview }) => {
              const cleaned = stripPrefix(v, ["github.com/", "https://", "http://", "www."]);
              const nextCompany =
                !user.company?.trim() && preview?.company ? preview.company : undefined;
              const nextBio =
                !user.bio?.trim() && preview?.description
                  ? preview.description.slice(0, 160)
                  : undefined;
              const nextWebsite =
                !user.website?.trim() && preview?.website
                  ? stripPrefix(preview.website, ["https://", "http://"])
                  : undefined;
              await patchProfile({
                github: cleaned,
                githubLogoUrl: preview?.image ?? `https://github.com/${cleaned}.png`,
                ...(nextCompany ? { company: nextCompany } : {}),
                ...(nextBio ? { bio: nextBio } : {}),
                ...(nextWebsite
                  ? { website: nextWebsite, websiteLogoUrl: websiteLogoUrl ?? "" }
                  : {}),
              });
            }}
            onUnlink={() => patchLinks({ github: "", githubLogoUrl: "" })}
          />
          <PlatformBindRow
            icon={Globe}
            label={t("id.personalSite")}
            desc={t("id.websiteDesc")}
            logoUrl={websiteLogoUrl}
            prefix="https://"
            placeholder="siteadresin.com"
            value={website}
            connected={!!website}
            previewNetwork="website"
            onSave={async ({ value: v, preview }) => {
              const cleaned = stripPrefix(v, ["https://", "http://"]);
              const absolute = toAbsoluteWebsite(cleaned);
              let host = "";
              try {
                host = absolute ? new URL(absolute).hostname : "";
              } catch {
                host = "";
              }
              const nextCompany =
                !user.company?.trim() && preview?.title
                  ? cleanSiteTitle(preview.title, host || cleaned)
                  : undefined;
              const nextBio =
                !user.bio?.trim() && preview?.description
                  ? preview.description.slice(0, 500).slice(0, 160)
                  : undefined;
              await patchProfile({
                website: cleaned,
                websiteLogoUrl: preview?.image ?? "",
                ...(nextCompany ? { company: nextCompany } : {}),
                ...(nextBio ? { bio: nextBio } : {}),
              });
            }}
            onUnlink={() => patchLinks({ website: "", websiteLogoUrl: "" })}
          />
        </div>
      </section>

      <CardThemeStudio
        theme={user.cardTheme ?? CARD_THEME_PRESETS[0]!.theme}
        onSave={(next) => patchProfile({ cardTheme: next })}
      />

      <CustomLinksEditor
        links={Array.isArray(user.profileLinks) ? user.profileLinks : []}
        onSave={(next) => patchProfile({ profileLinks: next })}
      />

      <section>
        <div className="mb-3 border-t border-[var(--ink)]/[0.08] pt-3">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            {t("id.badgeEmbed")}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            {t("id.badgeEmbedHint")}
          </p>
        </div>
        <EmbedSection handle={handle} name={user.name} />
      </section>

      <div className="flex items-start gap-3 border border-[var(--inner-green)]/20 bg-[var(--inner-green)]/5 p-4">
        <Shield className="mt-0.5 size-4 shrink-0 text-[var(--success-ink)]" />
        <div>
          <p className="mb-0.5 font-mono text-label uppercase tracking-widest text-[var(--success-ink)]">
            {t("id.verified")}
          </p>
          <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
            {t("id.verifiedBody")}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·id</span> · {t("id.footer")}
        </p>
      </div>
    </div>
  );
}
