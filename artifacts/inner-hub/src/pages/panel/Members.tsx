import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Linkedin,
  ArrowRight,
  Tag,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  X,
  Trash2,
  LayoutGrid,
  List,
  Lock,
  ChevronDown,
} from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { Link, useLocation, useSearch } from "wouter";
import { cn } from "@/lib/utils";
import { PersonAvatar } from "@/components/panel/PersonAvatar";
import { compareTR, toUpperTR } from "@/lib/tr";
import { cleanDisplayText } from "@/lib/displayText";
import { norm } from "@/lib/text";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { LoadingBlock, ErrorState, CourseCardSkeleton } from "@/components/panel/Skeletons";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useT } from "@/i18n";
import { useJourneyVisit } from "@/hooks/useJourneyVisit";

type Tab = "uyeler" | "talent";
type PersonaFilter = "all" | "founder" | "investor" | "builder" | "expert";
type SortMode = "featured" | "verified" | "az";
type ViewMode = "grid" | "list";

interface Member {
  id: number;
  name: string;
  initials: string;
  title: string;
  company: string;
  bio: string;
  tags: string[];
  linkedin: string | null;
  linkedinConnected?: boolean;
  avatarUrl?: string | null;
  persona?: string | null;
  profileCompletionPct?: number;
  isAvailable?: boolean;
}

interface TalentPost {
  id: number;
  postedBy: string;
  postedByInitials: string;
  postedByCompany: string;
  postedByHandle?: string | null;
  type: "arıyor" | "sunuyor";
  role: string;
  description: string;
  tags: string[];
  postedAt: string;
  mine?: boolean;
}

function memberHaystack(m: Member): string {
  return norm(
    [m.name, m.title, m.company, m.bio, m.persona ?? "", ...(m.tags ?? [])].join(" "),
  );
}

function isProfileComplete(m: Member): boolean {
  const bio = (m.bio ?? "").trim();
  const company = (m.company ?? "").trim();
  const hasCompany = company.length > 1 && company !== "—";
  const hasLinkedin = Boolean(m.linkedin?.trim()) || Boolean(m.linkedinConnected);
  const pct = m.profileCompletionPct ?? 0;
  if (pct >= 50) return true;
  if (bio.length >= 20) return true;
  if (hasCompany && hasLinkedin) return true;
  return Boolean(bio && hasCompany);
}

function dedupeTags(tags: string[], exclude: string[] = [], max = 3): { shown: string[]; more: number } {
  const block = new Set(exclude.map((x) => norm(x)).filter(Boolean));
  const out: string[] = [];
  for (const tag of tags) {
    const t = tag.trim();
    if (!t) continue;
    const key = norm(t);
    if (block.has(key)) continue;
    if (out.some((x) => norm(x) === key)) continue;
    out.push(t);
  }
  return { shown: out.slice(0, max), more: Math.max(0, out.length - max) };
}

function roleCompanyLine(member: Member): string {
  const title = cleanDisplayText(member.title);
  const company = member.company && member.company !== "—" ? member.company : "";
  return [title, company].filter(Boolean).join(" · ");
}

function linkedInHref(raw: string): string {
  return /^https?:\/\//i.test(raw)
    ? raw
    : `https://linkedin.com/in/${raw.replace(/^\/+/, "")}`;
}

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

function MemberCard({
  member,
  view,
  onMessage,
  onNavigate,
}: {
  member: Member;
  view: ViewMode;
  onMessage: (e: React.MouseEvent, m: Member) => void;
  onNavigate?: () => void;
}) {
  const t = useT();
  const line = roleCompanyLine(member);
  const { shown, more } = dedupeTags(member.tags, [member.title, member.company, member.persona ?? ""]);
  const href = `/panel/members?uye=${member.id}`;

  if (view === "list") {
    return (
      <Link
        href={href}
        onClick={() => onNavigate?.()}
        className="group flex items-center gap-3 panel-glass px-3 py-2.5 transition-colors hover:border-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
      >
        <PersonAvatar
          name={member.name}
          initials={member.initials}
          src={member.avatarUrl}
          className="size-10 shrink-0 text-xs"
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate font-serif text-base text-[var(--ink)]" style={{ fontWeight: 300 }}>
            <span className="truncate">{member.name}</span>
            {member.linkedinConnected && (
              <CheckCircle2 className="size-3.5 shrink-0 text-[var(--success-ink)]" aria-label={t("publicProfile.linkedinVerified")} />
            )}
          </p>
          {line ? <p className="truncate text-xs text-[var(--ink-muted)]">{line}</p> : null}
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">
          {shown.map((tag) => (
            <span
              key={tag}
              className="max-w-[7rem] truncate panel-glass px-1.5 py-0.5 font-mono text-label tracking-wide text-[var(--ink-body)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      className="group flex h-full flex-col panel-glass p-3.5 transition-all duration-200 hover:border-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
    >
      <div className="flex items-start gap-3">
        <PersonAvatar
          name={member.name}
          initials={member.initials}
          src={member.avatarUrl}
          className="size-[52px] shrink-0 text-sm"
        />
        <div className="min-w-0 flex-1">
          <p
            className="flex items-center gap-1.5 truncate font-serif text-base leading-snug text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            <span className="truncate">{member.name}</span>
            {member.linkedinConnected && (
              <CheckCircle2
                className="size-3.5 shrink-0 text-[var(--success-ink)]"
                aria-label={t("publicProfile.linkedinVerified")}
              />
            )}
          </p>
          {line ? (
            <p className="mt-0.5 truncate text-xs text-[var(--ink-muted)]">{line}</p>
          ) : null}
        </div>
      </div>

      {member.bio ? (
        <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--ink-muted)]">{member.bio}</p>
      ) : (
        <div className="flex-1" />
      )}

      {(shown.length > 0 || more > 0) && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {shown.map((tag) => (
            <span
              key={tag}
              className="max-w-[9rem] truncate panel-glass px-1.5 py-0.5 font-mono text-label tracking-wide text-[var(--ink-body)]"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {more > 0 && (
            <span className="panel-glass px-1.5 py-0.5 font-mono text-label text-[var(--ink-muted)]">+{more}</span>
          )}
        </div>
      )}

      <div
        className={cn(
          "mt-auto flex gap-2 pt-3 opacity-100 transition-opacity",
          "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100",
        )}
      >
        <button
          type="button"
          onClick={(e) => onMessage(e, member)}
          className="flex flex-1 items-center justify-center gap-1.5 panel-glass py-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
        >
          <MessageSquare className="size-3" /> {t("members.message")}
        </button>
        <span className="flex flex-1 items-center justify-center gap-1.5 panel-glass-ink py-1.5 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)]">
          {t("members.profile")}
        </span>
      </div>
    </Link>
  );
}

function MemberDetailPanel({
  member,
  allMembers,
  talentPosts,
  onClose,
  returnFocusRef,
}: {
  member: Member;
  allMembers: Member[];
  talentPosts: TalentPost[];
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const t = useT();
  const panelRef = useRef<HTMLDivElement>(null);
  const line = roleCompanyLine(member);
  const { shown } = dedupeTags(member.tags, [member.title, member.company, member.persona ?? ""], 12);
  const ownPosts = talentPosts.filter((p) => p.postedBy === member.name);
  const shared = useMemo(() => {
    const myTags = new Set(shown.map((x) => norm(x)));
    if (myTags.size === 0) return [] as { tag: string; names: string[] }[];
    const map = new Map<string, string[]>();
    for (const other of allMembers) {
      if (other.id === member.id) continue;
      for (const tag of other.tags) {
        const key = norm(tag);
        if (!myTags.has(key)) continue;
        const list = map.get(tag) ?? [];
        if (!list.includes(other.name)) list.push(other.name);
        map.set(tag, list);
      }
    }
    return [...map.entries()].slice(0, 3).map(([tag, names]) => ({ tag, names }));
  }, [allMembers, member.id, shown]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const root = panelRef.current;
    const focusable = root?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", trap);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keydown", trap);
      returnFocusRef.current?.focus();
    };
  }, [onClose, returnFocusRef]);

  const pct = member.profileCompletionPct ?? 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--ink-fixed)]/40" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-drawer-title"
        className="panel-glass-strong fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--ink)]/15 shadow-none"
      >
        <div className="flex items-start justify-between border-b border-[var(--ink)]/[0.08] p-5">
          <div className="flex items-start gap-3">
            <PersonAvatar
              name={member.name}
              initials={member.initials}
              src={member.avatarUrl}
              className="size-12 text-sm"
            />
            <div>
              <p
                id="member-drawer-title"
                className="font-serif text-lg text-[var(--ink)]"
                style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
              >
                {member.name}
              </p>
              {line ? <p className="mt-1 text-sm text-[var(--ink-muted)]">{line}</p> : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="panel-glass p-2 text-[var(--ink-muted)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
            aria-label={t("common.close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-2">
            <div className="panel-glass p-3">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                {t("members.metaVerified")}
              </p>
              <p className="mt-1 text-sm text-[var(--ink)]">
                {member.linkedinConnected ? t("members.metaVerifiedYes") : t("members.metaVerifiedNo")}
              </p>
            </div>
            <div className="panel-glass p-3">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                {t("members.metaCompletion")}
              </p>
              <p className="mt-1 text-sm text-[var(--ink)]">%{pct}</p>
            </div>
            {member.linkedin && (
              <a
                href={linkedInHref(member.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 inline-flex items-center gap-2 panel-glass p-3 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
              >
                <Linkedin className="size-3.5" /> LinkedIn
              </a>
            )}
          </div>

          <div>
            <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              {t("members.about")}
            </p>
            {member.bio ? (
              <p className="text-sm leading-relaxed text-[var(--ink-body)]">{member.bio}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-[var(--ink-muted)]">{t("members.noBio")}</p>
                <Link
                  href="/panel/profile"
                  className="inline-flex font-mono text-[11px] uppercase tracking-widest text-[var(--inner-green)] hover:underline"
                >
                  {t("members.noBioCta")}
                </Link>
              </div>
            )}
          </div>

          {shown.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                {t("members.skills")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {shown.map((tag) => (
                  <span
                    key={tag}
                    className="max-w-full truncate panel-glass px-2 py-1 font-mono text-label tracking-wide text-[var(--ink-body)]"
                    title={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ownPosts.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                {t("members.drawerTalent")}
              </p>
              <ul className="space-y-2">
                {ownPosts.map((p) => (
                  <li key={p.id} className="panel-glass p-3">
                    <p className="text-sm text-[var(--ink)]">{cleanDisplayText(p.role)}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--ink-muted)]">{p.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {shared.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                {t("members.drawerShared")}
              </p>
              <ul className="space-y-1.5">
                {shared.map(({ tag, names }) => (
                  <li key={tag} className="text-sm text-[var(--ink-body)]">
                    {t("members.sharedInterest", { tag, names: names.slice(0, 2).join(", ") })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex border-t border-[var(--ink)]/[0.08]">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 border-r border-[var(--ink)]/[0.08] py-3.5 font-mono text-label uppercase tracking-widest text-[var(--ink)] hover:bg-[var(--ink)]/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
          >
            <MessageSquare className="size-3.5" /> {t("members.message")}
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 py-3.5 font-mono text-label uppercase tracking-widest text-[var(--ink)] hover:bg-[var(--ink)]/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
          >
            <UserPlus className="size-3.5" /> {t("members.connect")}
          </button>
        </div>
      </div>
    </>
  );
}

function TalentCard({
  post,
  onDeleted,
}: {
  post: TalentPost;
  onDeleted: () => void;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (!post.mine || busy) return;
    setBusy(true);
    try {
      const res = await fetch(apiUrl(`/api/talent/${post.id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Silinemedi");
      }
      onDeleted();
    } catch {
      /* keep card */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel-glass p-4 sm:p-5 transition-all duration-200 hover:border-white/20">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <PersonAvatar name={post.postedBy} initials={post.postedByInitials} className="size-8 shrink-0 text-label" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--ink)]">{post.postedBy}</p>
            {post.postedByCompany ? (
              <p className="truncate text-sm text-[var(--ink-muted)]">{post.postedByCompany}</p>
            ) : null}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 border px-2 py-0.5 font-mono text-label uppercase tracking-widest",
            post.type === "arıyor"
              ? "border-[var(--ink)]/15 text-[var(--ink-muted)]"
              : "border-[var(--inner-green)]/30 bg-[var(--inner-green)]/10 text-[var(--ink-body)]",
          )}
        >
          {post.type === "arıyor" ? t("members.typeSeeking") : t("members.typeOffering")}
        </span>
      </div>

      <p
        className="mb-1.5 font-serif text-base leading-snug text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
      >
        {cleanDisplayText(post.role)}
      </p>
      <p className="mb-3 text-sm leading-relaxed text-[var(--ink-muted)]">{post.description}</p>

      <div className="mb-4 flex flex-wrap gap-1">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="max-w-[9rem] truncate panel-glass px-1.5 py-0.5 font-mono text-label tracking-wide text-[var(--ink-body)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-label text-[var(--ink-subtle)]">{post.postedAt}</span>
        <div className="flex items-center gap-2">
          {post.mine && (
            <button
              type="button"
              onClick={() => void remove()}
              disabled={busy}
              className="panel-glass p-1.5 text-[var(--ink-muted)] hover:text-[var(--error-ink)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
              aria-label={t("members.deletePost")}
            >
              <Trash2 className="size-3" />
            </button>
          )}
          {post.postedByHandle ? (
            <a
              href={`/u/${post.postedByHandle}`}
              className="flex items-center gap-1.5 panel-glass-ink px-3 py-1.5 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80"
            >
              {t("members.profile")} <ArrowRight className="size-2.5" />
            </a>
          ) : (
            <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
              {t("members.connectViaPanel")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TalentCompose({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useT();
  const [type, setType] = useState<"arıyor" | "sunuyor">("arıyor");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!role.trim() || !description.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const tags = tagsRaw
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 12);
      const res = await fetch(apiUrl("/api/talent"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, role: role.trim(), description: description.trim(), tags }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "İlan oluşturulamadı");
      setRole("");
      setDescription("");
      setTagsRaw("");
      onCreated();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "İlan oluşturulamadı");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} shouldScaleBackground={false}>
      <DrawerContent className="rounded-none panel-glass-strong border-white/10">
        <DrawerHeader className="px-6 pt-2 text-left">
          <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            Talent Board
          </p>
          <DrawerTitle
            className="font-serif text-2xl font-normal text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("members.composeTitle")}
          </DrawerTitle>
          <DrawerDescription className="text-[var(--ink-body)]">{t("members.composeSub")}</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 px-6 pb-8">
          <div className="flex gap-2">
            {(["arıyor", "sunuyor"] as const).map((ty) => (
              <button
                key={ty}
                type="button"
                onClick={() => setType(ty)}
                aria-pressed={type === ty}
                className={cn(
                  "border px-3 py-1.5 font-mono text-label uppercase tracking-widest focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
                  type === ty
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                    : "border-[var(--ink)]/10 text-[var(--ink-muted)]",
                )}
              >
                {ty === "arıyor" ? t("members.typeSeeking") : t("members.typeOffering")}
              </button>
            ))}
          </div>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder={t("members.phRole")}
            className="w-full panel-glass bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("members.phDesc")}
            rows={4}
            className="w-full resize-none panel-glass bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <input
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder={t("members.phTags")}
            className="w-full panel-glass bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          {error && (
            <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 panel-glass py-2.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={busy || !role.trim() || !description.trim()}
              onClick={() => void submit()}
              className="flex-1 panel-glass-ink py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] disabled:opacity-40"
            >
              {busy ? t("common.saving") : t("members.publish")}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default function Members() {
  const t = useT();
  useJourneyVisit("members");
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const uyeParam = useMemo(() => new URLSearchParams(searchString).get("uye"), [searchString]);

  const [tab, setTab] = useState<Tab>("uyeler");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 140);
  const [persona, setPersona] = useState<PersonaFilter>("all");
  const [sort, setSort] = useState<SortMode>("featured");
  const [view, setView] = useState<ViewMode>("grid");
  const [composeOpen, setComposeOpen] = useState(false);
  const [incompleteOpen, setIncompleteOpen] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const { data, isLoading, isError, error, refetch } = useApiQuery<{ members: Member[] }>(
    ["members"],
    "/api/members",
  );
  const {
    data: talentData,
    isLoading: talentLoading,
    isError: talentError,
    error: talentErr,
    refetch: refetchTalent,
  } = useApiQuery<{ posts: TalentPost[] }>(["talent"], "/api/talent");

  const members = data?.members ?? [];
  const talentPosts = talentData?.posts ?? [];

  const selectedMember = useMemo(() => {
    if (!uyeParam) return null;
    const id = Number(uyeParam);
    if (!Number.isFinite(id)) return null;
    return members.find((m) => m.id === id) ?? null;
  }, [uyeParam, members]);

  const closeMember = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1 && uyeParam) {
      window.history.back();
      return;
    }
    const params = new URLSearchParams(searchString);
    params.delete("uye");
    const q = params.toString();
    setLocation(q ? `/panel/members?${q}` : "/panel/members", { replace: true });
  }, [searchString, setLocation, uyeParam]);

  const haystacks = useMemo(
    () => new Map(members.map((m) => [m.id, memberHaystack(m)])),
    [members],
  );

  const personaCounts = useMemo(() => {
    const counts: Record<string, number> = { all: members.length };
    for (const m of members) {
      const p = (m.persona ?? "").toLowerCase();
      if (p) counts[p] = (counts[p] ?? 0) + 1;
    }
    return counts;
  }, [members]);

  const { completeMembers, incompleteMembers } = useMemo(() => {
    const q = norm(debouncedSearch);
    let list = members.filter((m) => {
      if (persona !== "all" && (m.persona ?? "").toLowerCase() !== persona) return false;
      if (!q) return true;
      return (haystacks.get(m.id) ?? "").includes(q);
    });

    const complete = list.filter(isProfileComplete);
    const incomplete = list.filter((m) => !isProfileComplete(m));

    const rank = (a: Member, b: Member) => {
      if (sort === "az") return compareTR(a.name, b.name);
      if (sort === "verified") {
        const av = a.linkedinConnected ? 1 : 0;
        const bv = b.linkedinConnected ? 1 : 0;
        if (bv !== av) return bv - av;
        return compareTR(a.name, b.name);
      }
      const ac = isProfileComplete(a) ? 1 : 0;
      const bc = isProfileComplete(b) ? 1 : 0;
      if (bc !== ac) return bc - ac;
      const av = a.linkedinConnected ? 1 : 0;
      const bv = b.linkedinConnected ? 1 : 0;
      if (bv !== av) return bv - av;
      const ap = a.profileCompletionPct ?? 0;
      const bp = b.profileCompletionPct ?? 0;
      if (bp !== ap) return bp - ap;
      return compareTR(a.name, b.name);
    };

    complete.sort(rank);
    incomplete.sort(rank);
    return { completeMembers: complete, incompleteMembers: incomplete };
  }, [members, debouncedSearch, haystacks, persona, sort]);

  const filteredTalent = useMemo(() => {
    const q = norm(debouncedSearch);
    if (!q) return talentPosts;
    return talentPosts.filter(
      (p) =>
        norm(p.role).includes(q) ||
        norm(p.description).includes(q) ||
        norm(p.postedBy).includes(q) ||
        p.tags.some((tag) => norm(tag).includes(q)),
    );
  }, [talentPosts, debouncedSearch]);

  const visibleCount =
    tab === "uyeler" ? completeMembers.length + incompleteMembers.length : filteredTalent.length;

  const resetFilters = () => {
    setSearch("");
    setPersona("all");
    setSort("featured");
  };

  const invalidateTalent = () => {
    void queryClient.invalidateQueries({ queryKey: ["talent"] });
  };

  const onMessage = (e: React.MouseEvent, m: Member) => {
    e.preventDefault();
    e.stopPropagation();
    setLocation(`/panel/chat?to=${m.id}`);
  };

  // Deep link: if ?uye= points at incomplete member still open drawer when loaded
  useEffect(() => {
    if (!uyeParam || isLoading) return;
    const id = Number(uyeParam);
    if (!Number.isFinite(id)) return;
    if (!members.some((m) => m.id === id)) {
      /* keep param; member may be filtered as system */
    }
  }, [uyeParam, members, isLoading]);

  const filterChips: { id: PersonaFilter; label: string }[] = [
    { id: "all", label: t("members.filterAll") },
    { id: "founder", label: t("members.filterFounder") },
    { id: "investor", label: t("members.filterInvestor") },
    { id: "builder", label: t("members.filterBuilder") },
    { id: "expert", label: t("members.filterExpert") },
  ];

  return (
    <div className="min-w-0 space-y-5 max-w-5xl overflow-x-hidden motion-reduce:transition-none">
      <FadeIn delay={0.02}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
              INNER.HUB · {toUpperTR(t("members.title"))}
            </p>
            <h1
              className="mt-1 font-serif text-2xl text-[var(--ink)] sm:text-3xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
            >
              {t("members.pageHeadline")}
            </h1>
            <p className="mt-1.5 max-w-[48ch] text-sm text-[var(--ink-muted)]">{t("members.pageSub")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("talent")}
              className="panel-glass px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
            >
              {t("members.talentBoard")}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("talent");
                setComposeOpen(true);
              }}
              className="panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
            >
              {t("members.postCta")}
            </button>
          </div>
        </div>
      </FadeIn>

      {isLoading && tab === "uyeler" ? (
        <LoadingBlock label={t("members.loading")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </LoadingBlock>
      ) : isError && tab === "uyeler" ? (
        <ErrorState
          message={error instanceof Error ? error.message : t("members.loadError")}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="sticky top-0 z-20 -mx-1 space-y-3 bg-[var(--bone)]/90 px-1 py-3 backdrop-blur-md dark:bg-[var(--ink)]/80">
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label={t("members.filterGroup")}
            >
              {filterChips.map((chip) => {
                const count =
                  chip.id === "all" ? members.length : (personaCounts[chip.id] ?? 0);
                if (chip.id !== "all" && count === 0) return null;
                const pressed = persona === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setPersona(chip.id)}
                    className={cn(
                      "border px-2.5 py-1.5 font-mono text-label tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
                      pressed
                        ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)] dark:border-white/30 dark:bg-white/[0.14] dark:text-[#F4F1EC]"
                        : "border-[var(--ink)]/10 text-[var(--ink-body)] hover:border-[var(--ink)]/25",
                    )}
                  >
                    {chip.label} {count}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="flex panel-glass overflow-hidden"
                role="tablist"
                aria-label={t("members.tabMembers")}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "uyeler"}
                  onClick={() => setTab("uyeler")}
                  className={cn(
                    "px-5 py-2 font-mono text-label uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
                    tab === "uyeler"
                      ? "bg-[var(--ink)] text-[var(--bone)] dark:bg-white/[0.12] dark:text-[#F4F1EC]"
                      : "text-[var(--ink-body)] hover:text-[var(--ink)] dark:text-white/50 dark:hover:text-white",
                  )}
                >
                  {t("members.tabMembers")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "talent"}
                  onClick={() => setTab("talent")}
                  className={cn(
                    "flex items-center gap-1.5 px-5 py-2 font-mono text-label uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
                    tab === "talent"
                      ? "bg-[var(--ink)] text-[var(--bone)] dark:bg-white/[0.12] dark:text-[#F4F1EC]"
                      : "text-[var(--ink-body)] hover:text-[var(--ink)] dark:text-white/50 dark:hover:text-white",
                  )}
                >
                  {t("members.talentBoard")}
                </button>
              </div>

              <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
                {tab === "uyeler" && (
                  <>
                    <label className="sr-only" htmlFor="members-sort">
                      {t("members.sortLabel")}
                    </label>
                    <select
                      id="members-sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortMode)}
                      className="panel-glass bg-transparent px-2 py-2 font-mono text-caption text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
                    >
                      <option value="featured">{t("members.sortFeatured")}</option>
                      <option value="verified">{t("members.sortVerified")}</option>
                      <option value="az">{t("members.sortAZ")}</option>
                    </select>
                    <div className="flex panel-glass overflow-hidden">
                      <button
                        type="button"
                        aria-label={t("members.viewGrid")}
                        aria-pressed={view === "grid"}
                        onClick={() => setView("grid")}
                        className={cn(
                          "p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
                          view === "grid" ? "bg-[var(--ink)] text-[var(--bone)]" : "text-[var(--ink-muted)]",
                        )}
                      >
                        <LayoutGrid className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={t("members.viewList")}
                        aria-pressed={view === "list"}
                        onClick={() => setView("list")}
                        className={cn(
                          "p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]",
                          view === "list" ? "bg-[var(--ink)] text-[var(--bone)]" : "text-[var(--ink-muted)]",
                        )}
                      >
                        <List className="size-3.5" />
                      </button>
                    </div>
                  </>
                )}

                <div className="relative min-w-[min(100%,16rem)] flex-1 sm:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-muted)]" />
                  <input
                    type="search"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={
                      tab === "uyeler" ? t("members.searchPlaceholder") : t("members.searchTalent")
                    }
                    aria-label={t("members.searchPlaceholder")}
                    className="w-full panel-glass py-2 pl-9 pr-9 font-mono text-caption text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-white/25 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)] dark:text-[#F4F1EC]"
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--ink-muted)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
                      aria-label={t("members.clearSearch")}
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div id={tab === "uyeler" ? "members-grid" : "members-talent"} className="scroll-mt-6">
            {tab === "uyeler" ? (
              <div>
                <p
                  className="mb-4 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"
                  aria-live="polite"
                >
                  {t("members.readyCount", {
                    ready: completeMembers.length,
                    incomplete: incompleteMembers.length,
                  })}
                </p>

                {visibleCount === 0 ? (
                  <div className="panel-glass px-5 py-10 text-center">
                    <p className="font-serif text-xl text-[var(--ink)]" style={{ fontWeight: 300 }}>
                      {t("members.emptyTitle", { q: debouncedSearch || "…" })}
                    </p>
                    <p className="mx-auto mt-2 max-w-[40ch] text-sm text-[var(--ink-muted)]">
                      {t("members.emptyBody")}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
                      >
                        {t("members.resetFilters")}
                      </button>
                      <Link
                        href="/panel/members"
                        className="panel-glass inline-flex items-center gap-1.5 px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
                      >
                        <UserPlus className="size-3" /> {t("members.inviteSomeone")}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        view === "grid"
                          ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
                          : "flex flex-col gap-2",
                      )}
                    >
                      {completeMembers.map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          view={view}
                          onMessage={onMessage}
                          onNavigate={() => {
                            returnFocusRef.current = document.activeElement as HTMLElement | null;
                          }}
                        />
                      ))}
                    </div>

                    {incompleteMembers.length > 0 && (
                      <div className="mt-6 border-t border-[var(--ink)]/[0.08] pt-4">
                        <button
                          type="button"
                          onClick={() => setIncompleteOpen((v) => !v)}
                          className="flex w-full items-center justify-between gap-2 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
                          aria-expanded={incompleteOpen}
                        >
                          <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                            {t("members.incompleteToggle", { n: incompleteMembers.length })}
                          </span>
                          <ChevronDown
                            className={cn(
                              "size-4 text-[var(--ink-muted)] transition-transform",
                              incompleteOpen && "rotate-180",
                            )}
                          />
                        </button>
                        {incompleteOpen && (
                          <div
                            className={cn(
                              "mt-2",
                              view === "grid"
                                ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
                                : "flex flex-col gap-2",
                            )}
                          >
                            {incompleteMembers.map((member) => (
                              <MemberCard
                                key={member.id}
                                member={member}
                                view={view}
                                onMessage={onMessage}
                                onNavigate={() => {
                                  returnFocusRef.current = document.activeElement as HTMLElement | null;
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : talentLoading ? (
              <LoadingBlock label={t("members.talentLoading")} />
            ) : talentError ? (
              <ErrorState
                message={talentErr instanceof Error ? talentErr.message : t("members.talentError")}
                onRetry={() => refetchTalent()}
              />
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]" aria-live="polite">
                    {t("members.postCount", { n: filteredTalent.length })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setComposeOpen(true)}
                    className="flex items-center gap-1.5 panel-glass-ink px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone-fixed)] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--inner-green)]"
                  >
                    <Tag className="size-3" /> {t("members.postCta")}
                  </button>
                </div>
                {filteredTalent.length === 0 ? (
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    {t("members.talentEmpty")}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {filteredTalent.map((post) => (
                      <TalentCard key={post.id} post={post} onDeleted={invalidateTalent} />
                    ))}
                  </div>
                )}
                <div className="mt-6 border-t border-[var(--ink)]/[0.08] pt-4">
                  <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
                    {t("members.talentFooter")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {selectedMember && (
            <MemberDetailPanel
              member={selectedMember}
              allMembers={members}
              talentPosts={talentPosts}
              onClose={closeMember}
              returnFocusRef={returnFocusRef}
            />
          )}

          {uyeParam && !selectedMember && !isLoading && members.length > 0 && (
            <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 panel-glass px-4 py-2 text-sm text-[var(--ink-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-3" /> {t("members.memberNotFound")}
              </span>
            </div>
          )}
        </>
      )}

      <TalentCompose
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={invalidateTalent}
      />
    </div>
  );
}
