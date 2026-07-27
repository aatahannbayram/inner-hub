import { FadeIn } from "@/components/FadeIn";
import { Lockup } from "@/components/Lockup";
import { MemberAvatar } from "@/components/panel/MemberAvatar";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";
import { useApiQuery } from "@/hooks/useApiQuery";
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

export default function OrgPage() {
  const t = useT();
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
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
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
          <Link
            href="/panel/profile"
            className="mt-5 inline-flex border border-[var(--ink)] px-4 py-2.5 font-mono text-label uppercase tracking-widest text-[var(--ink)]"
          >
            {t("org.goProfile")}
          </Link>
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
