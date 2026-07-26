import { useState, useEffect } from "react";
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
  Users2,
  Trash2,
} from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { cn } from "@/lib/utils";
import { PersonAvatar } from "@/components/panel/PersonAvatar";
import { HeroVideo } from "@/components/HeroVideo";
import { HeroQuickStat } from "@/components/panel/HeroQuickStat";
import { toLowerTR } from "@/lib/tr";
import { cleanDisplayText } from "@/lib/displayText";
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

type Tab = "uyeler" | "talent";

interface Member {
  id: number;
  name: string;
  initials: string;
  title: string;
  company: string;
  bio: string;
  tags: string[];
  linkedin: string | null;
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

function MemberCard({ member, onSelect }: { member: Member; onSelect: (m: Member) => void }) {
  return (
    <div
      className="group flex flex-col overflow-hidden border border-[var(--ink)]/[0.08] transition-all duration-200 hover:border-[var(--ink)]/20 cursor-pointer"
      onClick={() => onSelect(member)}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--ink)]/[0.04]">
        <PersonAvatar
          name={member.name}
          initials={member.initials}
          className="size-full text-3xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
        {member.isAvailable && (
          <span className="absolute bottom-2.5 right-2.5 size-3 rounded-full border-2 border-[var(--bone)] bg-[var(--inner-green)]" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p
          className="truncate font-serif text-lg text-[var(--ink)] leading-snug"
          style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
        >
          {member.name}
        </p>
        {(member.title || member.company) && (
          <p className="mt-1 truncate text-xs text-[var(--ink-muted)]">
            {[cleanDisplayText(member.title), member.company].filter(Boolean).join(" · ")}
          </p>
        )}
        {member.bio ? (
          <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--ink-muted)]">{member.bio}</p>
        ) : (
          <div className="flex-1" />
        )}
        {member.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {member.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="border border-[var(--ink)]/10 px-1.5 py-0.5 font-mono text-label uppercase tracking-wide text-[var(--ink-body)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberDetailPanel({ member, onClose }: { member: Member; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--ink)]/40" onClick={onClose} aria-hidden />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--ink)]/15 bg-[var(--bone)] shadow-none">
        <div className="flex items-start justify-between border-b border-[var(--ink)]/[0.08] p-5">
          <div className="flex items-start gap-3">
            <PersonAvatar name={member.name} initials={member.initials} className="size-12 text-sm" />
            <div>
              <p
                className="font-serif text-lg text-[var(--ink)]"
                style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
              >
                {member.name}
              </p>
              {(member.title || member.company) && (
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  {[cleanDisplayText(member.title), member.company].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[var(--ink)]/10 p-2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
            aria-label={t("common.close")}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t("members.about")}</p>
            <p className="text-sm leading-relaxed text-[var(--ink-body)]">{member.bio || t("members.noBio")}</p>
          </div>
          {member.tags.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{t("members.skills")}</p>
              <div className="flex flex-wrap gap-1.5">
                {member.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-[var(--ink)]/10 px-2 py-1 font-mono text-label uppercase tracking-wide text-[var(--ink-body)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {member.linkedin && (
            <a
              href={
                /^https?:\/\//i.test(member.linkedin)
                  ? member.linkedin
                  : `https://linkedin.com/in/${member.linkedin.replace(/^\/+/, "")}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] underline underline-offset-2"
            >
              <Linkedin className="size-3.5" /> LinkedIn
            </a>
          )}
        </div>
        <div className="flex border-t border-[var(--ink)]/[0.08]">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 border-r border-[var(--ink)]/[0.08] py-3.5 font-mono text-label uppercase tracking-widest text-[var(--ink)] hover:bg-[var(--ink)]/[0.04]"
          >
            <MessageSquare className="size-3.5" /> {t("members.message")}
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 py-3.5 font-mono text-label uppercase tracking-widest text-[var(--ink)] hover:bg-[var(--ink)]/[0.04]"
          >
            <UserPlus className="size-3.5" /> {t("members.connect")}
          </button>
        </div>
      </div>
    </>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function MembersHero({
  onTalentClick,
  memberCount,
}: {
  onTalentClick: () => void;
  memberCount: number;
}) {
  const t = useT();
  return (
    <div
      className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-8 lg:-mt-8"
      style={{ height: "min(70vh, 620px)", minHeight: 440 }}
    >
      <HeroVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-[var(--ink-fixed)]/40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[var(--ink-fixed)]/85 via-[var(--ink-fixed)]/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[var(--ink-fixed)]/60 via-transparent to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:px-12 md:pb-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-10">
          <div>
            <p className="mb-3 font-mono text-label uppercase tracking-widest text-[var(--bone)]/60 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
              {t("members.title")}
            </p>
            <AnimatedHeading
              text={"Where builders\nfind each other."}
              className="mb-4 font-display font-serif italic text-4xl leading-[1.1] text-[var(--bone)] [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl"
              style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
            />
            <FadeIn delay={0.8}>
              <p className="mb-6 max-w-[46ch] text-base text-[var(--bone)]/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg">
                {t("members.heroBody")}
              </p>
            </FadeIn>
            <FadeIn delay={1.2}>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => scrollToId("members-grid")}
                  className="group inline-flex min-h-11 items-center gap-2 bg-[var(--bone)] px-6 py-3 font-mono text-sm uppercase tracking-widest text-[var(--ink)] transition-opacity hover:opacity-90 sm:px-8"
                >
                  {t("members.viewMembers")}
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={onTalentClick}
                  className="liquid-glass group inline-flex min-h-11 items-center gap-2 border border-[var(--bone)]/25 px-6 py-3 font-mono text-sm uppercase tracking-widest text-[var(--bone)] transition-colors hover:bg-[var(--bone)] hover:text-[var(--ink)] sm:px-8"
                >
                  {t("members.talentBoard")}
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-8 flex items-end justify-start lg:mt-0 lg:justify-end">
            <HeroQuickStat
              value={memberCount}
              label={t("members.heroStat")}
              tagline={t("members.heroTagline")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-[var(--ink)]/[0.08] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">{label}</p>
        <Icon className="size-3.5 text-[var(--ink-subtle)]" />
      </div>
      <p
        className="font-serif text-2xl text-[var(--ink)]"
        style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-label text-[var(--ink-muted)]">{sub}</p>
    </div>
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
    <div className="border border-[var(--ink)]/[0.08] p-4 sm:p-5 transition-all duration-200 hover:border-[var(--ink)]/20">
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
            className="border border-[var(--ink)]/10 px-1.5 py-0.5 font-mono text-label uppercase tracking-wide text-[var(--ink-body)]"
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
              className="border border-[var(--ink)]/10 p-1.5 text-[var(--ink-muted)] hover:text-[var(--error-ink)] disabled:opacity-40"
              aria-label={t("members.deletePost")}
            >
              <Trash2 className="size-3" />
            </button>
          )}
          {post.postedByHandle ? (
            <a
              href={`/u/${post.postedByHandle}`}
              className="flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 font-mono text-label uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80"
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
        .map((t) => t.trim())
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
    } catch (e: any) {
      setError(e.message ?? "İlan oluşturulamadı");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} shouldScaleBackground={false}>
      <DrawerContent className="rounded-none border-[var(--ink)]/15 bg-[var(--bone)]">
        <DrawerHeader className="px-6 pt-2 text-left">
          <p className="mb-1 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
            Talent Board
          </p>
          <DrawerTitle
            className="font-serif text-2xl font-normal text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            İlan Ver
          </DrawerTitle>
          <DrawerDescription className="text-[var(--ink-body)]">
            Arıyorsan veya sunuyorsan daireye duyur.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 px-6 pb-8">
          <div className="flex gap-2">
            {(["arıyor", "sunuyor"] as const).map((ty) => (
              <button
                key={ty}
                type="button"
                onClick={() => setType(ty)}
                className={cn(
                  "border px-3 py-1.5 font-mono text-label uppercase tracking-widest",
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
            className="w-full border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("members.phDesc")}
            rows={4}
            className="w-full resize-none border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
          />
          <input
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder={t("members.phTags")}
            className="w-full border border-[var(--ink)]/[0.08] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]/30"
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
              className="flex-1 border border-[var(--ink)]/15 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={busy || !role.trim() || !description.trim()}
              onClick={() => void submit()}
              className="flex-1 border border-[var(--ink)] bg-[var(--ink)] py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone)] disabled:opacity-40"
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
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("uyeler");
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

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

  const filteredMembers = members.filter((m) => {
    const q = toLowerTR(search);
    return (
      toLowerTR(m.name).includes(q) ||
      toLowerTR(m.company).includes(q) ||
      m.tags.some((t) => toLowerTR(t).includes(q))
    );
  });

  const filteredTalent = talentPosts.filter((p) => {
    const q = toLowerTR(search);
    return toLowerTR(p.role).includes(q) || p.tags.some((t) => toLowerTR(t).includes(q));
  });

  const invalidateTalent = () => {
    void queryClient.invalidateQueries({ queryKey: ["talent"] });
  };

  return (
    <div className="min-w-0 space-y-8 max-w-5xl overflow-x-hidden">
      <MembersHero
        memberCount={members.length}
        onTalentClick={() => {
          setTab("talent");
          requestAnimationFrame(() => scrollToId("members-talent"));
        }}
      />

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
          <FadeIn delay={0.02}>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
              <MembersStat label={t("members.statTotal")} value={String(members.length)} sub={t("members.statTotalSub")} icon={Users2} />
              <MembersStat
                label={t("members.statProfile")}
                value={String(members.filter((m) => m.bio).length)}
                sub={t("members.statProfileSub")}
                icon={Users2}
              />
              <MembersStat
                label={t("members.statTalent")}
                value={String(talentPosts.length)}
                sub={t("members.statTalentSub")}
                icon={Tag}
              />
              <MembersStat
                label={t("members.statAdmin")}
                value={String(members.filter((m) => m.title === "Admin").length)}
                sub={t("members.statAdminSub")}
                icon={CheckCircle2}
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.03}>
            <p className="text-sm font-light text-[var(--ink-muted)]">
              {t("members.subtitle")}
            </p>
          </FadeIn>

          <FadeIn delay={0.04}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex border border-[var(--ink)]/15">
                <button
                  type="button"
                  onClick={() => setTab("uyeler")}
                  className={cn(
                    "px-5 py-2 font-mono text-label uppercase tracking-widest transition-colors",
                    tab === "uyeler"
                      ? "bg-[var(--ink)] text-[var(--bone)]"
                      : "text-[var(--ink-body)] hover:text-[var(--ink)]",
                  )}
                >
                  {t("members.tabMembers")}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("talent")}
                  className={cn(
                    "flex items-center gap-1.5 px-5 py-2 font-mono text-label uppercase tracking-widest transition-colors",
                    tab === "talent"
                      ? "bg-[var(--ink)] text-[var(--bone)]"
                      : "text-[var(--ink-body)] hover:text-[var(--ink)]",
                  )}
                >
                  {t("members.talentBoard")}
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tab === "uyeler" ? t("members.searchPlaceholder") : t("members.searchTalent")}
                  className="border border-[var(--ink)]/15 bg-transparent py-2 pl-9 pr-4 font-mono text-caption text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--ink)]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </FadeIn>

          <div id={tab === "uyeler" ? "members-grid" : "members-talent"} className="scroll-mt-6">
            {tab === "uyeler" ? (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                    {t("members.memberCount", { n: filteredMembers.length })}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-label uppercase tracking-widest text-[var(--ink-muted)]">
                    <span className="size-1.5 rounded-full bg-[var(--ink-subtle)]" />
                    {t("members.liveSoon")}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredMembers.map((member) => (
                    <MemberCard key={member.id} member={member} onSelect={setSelectedMember} />
                  ))}
                </div>
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
                  <span className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                    {t("members.postCount", { n: filteredTalent.length })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setComposeOpen(true)}
                    className="flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--bone)] transition-opacity hover:opacity-80"
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
            <MemberDetailPanel member={selectedMember} onClose={() => setSelectedMember(null)} />
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
