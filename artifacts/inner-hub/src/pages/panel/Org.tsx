import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { Lockup } from "@/components/Lockup";
import { MemberAvatar } from "@/components/panel/MemberAvatar";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { useT } from "@/i18n";
import { Link } from "wouter";

type OrgRow = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  type: string;
  membershipRole?: string;
};

type OrgMember = {
  id: number;
  name: string;
  handle: string | null;
  title: string | null;
  membershipRole: string;
  avatarUrl: string | null;
  avatarStyle: string | null;
  seed: string;
};

const ORG_TYPES = ["startup", "company", "fund", "studio"] as const;

function CreateOrgForm({ onCreated }: { onCreated: () => void }) {
  const t = useT();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [type, setType] = useState<(typeof ORG_TYPES)[number]>("startup");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const create = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(apiUrl("/api/orgs"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          logoUrl: logoUrl.trim() || undefined,
          type,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("profile.orgCreateError"));
      setName("");
      setLogoUrl("");
      onCreated();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : t("profile.orgCreateError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 space-y-3 text-left">
      <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-strong)]">
        {t("profile.createOrg")}
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("profile.orgNamePlaceholder")}
        maxLength={80}
        className="min-h-11 w-full panel-glass bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] outline-none"
      />
      <input
        value={logoUrl}
        onChange={(e) => setLogoUrl(e.target.value)}
        placeholder="https://…"
        className="min-h-11 w-full panel-glass bg-transparent px-3 py-2.5 font-mono text-sm text-[var(--ink)] outline-none"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as (typeof ORG_TYPES)[number])}
        className="min-h-11 w-full panel-glass bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] outline-none"
      >
        {ORG_TYPES.map((ot) => (
          <option key={ot} value={ot}>
            {t(`profile.orgType_${ot}`)}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={busy || name.trim().length < 2}
        onClick={() => void create()}
        className="min-h-11 w-full border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--bone)] disabled:opacity-30"
      >
        {t("profile.createOrg")}
      </button>
      {msg ? <p className="font-mono text-label text-[var(--error-ink)]">{msg}</p> : null}
      <p className="text-center text-xs text-[var(--ink-muted)]">
        <Link href="/panel/profile" className="underline-offset-2 hover:underline">
          {t("org.goProfile")}
        </Link>
      </p>
    </div>
  );
}

export default function OrgPage() {
  const t = useT();
  const qc = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useApiQuery<{
    primaryOrgId: number | null;
    orgs: OrgRow[];
  }>(["orgs-mine"], "/api/orgs/mine");

  const orgs = data?.orgs ?? [];
  const primaryId = data?.primaryOrgId ?? orgs[0]?.id ?? null;
  const primary = orgs.find((o) => o.id === primaryId) ?? orgs[0] ?? null;

  const membersQ = useApiQuery<{ members: OrgMember[]; org: OrgRow | null }>(
    ["org-members", primary?.id ?? 0],
    `/api/orgs/${primary?.id ?? 0}/members`,
    { enabled: Boolean(primary?.id) },
  );

  if (isLoading) {
    return <LoadingBlock label={t("org.loading")} />;
  }
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : t("org.loadError")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="min-w-0 max-w-2xl space-y-8 overflow-x-hidden">
      <FadeIn>
        <div>
          <div className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            <Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" />
          </div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontWeight: 600 }}
          >
            {t("org.title")}
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">{t("org.subtitle")}</p>
        </div>
      </FadeIn>

      {orgs.length === 0 ? (
        <div className="panel-glass px-5 py-10 text-center">
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            {t("org.empty")}
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">{t("org.emptyHint")}</p>
          <CreateOrgForm
            onCreated={() => {
              void refetch();
              void qc.invalidateQueries({ queryKey: ["auth-me"] });
            }}
          />
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
              {t("org.mine")}
            </p>
            <ul className="space-y-2">
              {orgs.map((o) => (
                <li
                  key={o.id}
                  className={[
                    "flex items-center gap-3 panel-glass px-4 py-3",
                    primary?.id === o.id ? "border-[var(--ink)]/25" : "",
                  ].join(" ")}
                >
                  {o.logoUrl ? (
                    <img
                      src={o.logoUrl}
                      alt=""
                      className="size-10 shrink-0 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center bg-[var(--ink)]/[0.06] font-mono text-caption uppercase text-[var(--ink-muted)]">
                      {o.name.slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[var(--ink)]">{o.name}</p>
                    <p className="font-mono text-label text-[var(--ink-muted)]">
                      {o.type}
                      {o.membershipRole ? ` · ${o.membershipRole}` : ""}
                      {primary?.id === o.id ? ` · ${t("org.primary")}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {primary ? (
            <section className="space-y-3 border-t border-[var(--ink)]/[0.08] pt-6">
              <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
                {t("org.members")} · {primary.name}
              </p>
              {membersQ.isLoading ? (
                <LoadingBlock label={t("org.loadingMembers")} />
              ) : membersQ.isError ? (
                <ErrorState
                  message={t("org.membersError")}
                  onRetry={() => membersQ.refetch()}
                />
              ) : (
                <ul className="divide-y divide-[var(--ink)]/[0.06] panel-glass">
                  {(membersQ.data?.members ?? []).map((m) => (
                    <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                      <MemberAvatar
                        seed={m.seed || m.handle || m.name}
                        avatarUrl={m.avatarUrl}
                        avatarStyle={m.avatarStyle}
                        orgLogoUrl={primary.logoUrl}
                        orgName={primary.name}
                        size="md"
                        alt={m.name}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-[var(--ink)]">{m.name}</p>
                        <p className="truncate font-mono text-label text-[var(--ink-muted)]">
                          {[m.title, m.membershipRole].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </li>
                  ))}
                  {(membersQ.data?.members ?? []).length === 0 ? (
                    <li className="px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
                      {t("org.noMembers")}
                    </li>
                  ) : null}
                </ul>
              )}
            </section>
          ) : null}
        </>
      )}

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·hub</span> · {t("org.footer")}
        </p>
      </div>
    </div>
  );
}
