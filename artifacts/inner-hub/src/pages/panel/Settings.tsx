import { useEffect, useState } from "react";
import { Lockup } from "@/components/Lockup";
import { FadeIn } from "@/components/FadeIn";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";
import { Check, Bell, Shield, Palette, Globe, LogOut, AlertTriangle } from "lucide-react";
import { useLocale, useT } from "@/i18n";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "relative h-5 w-9 shrink-0 border transition-colors duration-150",
        checked ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--ink)]/20 bg-transparent",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 size-3.5 bg-[var(--bone-fixed)] transition-transform duration-150",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  sub,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[var(--ink)]/[0.08] pt-6">
      <div className="mb-4 flex items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0 text-[var(--ink-subtle)]" />
        <div>
          <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">{title}</p>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--ink)]/[0.05] py-3 last:border-0">
      <div>
        <p className="text-sm font-light text-[var(--ink)]">{label}</p>
        {sub && <p className="font-mono text-label text-[var(--ink-muted)]">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            "border px-3 py-1 font-mono text-label uppercase tracking-widest transition-colors",
            value === opt.value
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
              : "border-[var(--ink)]/10 text-[var(--ink-muted)] hover:text-[var(--ink)]",
          ].join(" ")}
        >
          {opt.label === "English" ? <span lang="en">{opt.label}</span> : opt.label}
        </button>
      ))}
    </div>
  );
}

type Lang = "tr" | "en";
type Theme = "light" | "dark" | "system";

type SettingsPrefs = {
  notifMatch: boolean;
  notifEvents: boolean;
  notifMessages: boolean;
  notifCapital: boolean;
  notifDigest: boolean;
  notifEmail: boolean;
  showOnline: boolean;
  allowMatch: boolean;
  analyticsConsent: boolean;
  theme: Theme;
  lang: Lang;
  compactMode: boolean;
  onboardingCompleted: boolean;
};

const DEFAULT_PREFS: SettingsPrefs = {
  notifMatch: true,
  notifEvents: true,
  notifMessages: true,
  notifCapital: false,
  notifDigest: true,
  notifEmail: true,
  showOnline: true,
  allowMatch: true,
  analyticsConsent: true,
  theme: "light",
  lang: "tr",
  compactMode: false,
  onboardingCompleted: false,
};

export default function Settings() {
  const t = useT();
  const { setLocale } = useLocale();
  const { setMode: setThemeMode } = useTheme();
  const { data, isLoading, isError, error, refetch } = useApiQuery<{ prefs: SettingsPrefs }>(
    ["settings"],
    "/api/settings",
  );

  const [prefs, setPrefs] = useState<SettingsPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.prefs) {
      setPrefs({ ...DEFAULT_PREFS, ...data.prefs });
      setHydrated(true);
    }
  }, [data]);

  const patch = <K extends keyof SettingsPrefs>(key: K, value: SettingsPrefs[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const patchTheme = (v: ThemeMode) => {
    patch("theme", v);
    setThemeMode(v);
  };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setSaveError(null);
    try {
      const res = await fetch(apiUrl("/api/settings"), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefs }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? t("settings.saveError"));
      if (json.prefs) setPrefs({ ...DEFAULT_PREFS, ...json.prefs });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setSaveError(e.message ?? t("settings.saveError"));
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    window.location.href = "/panel";
  };

  if (isLoading && !hydrated) {
    return <LoadingBlock label={t("settings.loading")} />;
  }
  if (isError && !hydrated) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : t("settings.loadError")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="max-w-lg space-y-8">
      <FadeIn>
        <div>
          <div className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            <Lockup suffix="hub" className="text-[var(--ink)]" fontSize="1.15rem" />
          </div>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            {t("settings.title")}
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">{t("settings.subtitle")}</p>
        </div>
      </FadeIn>

      <Section icon={Bell} title={t("settings.sectionNotif")} sub={t("settings.sectionNotifSub")}>
        <div className="panel-glass px-4">
          <SettingRow label={t("settings.notifMatch")} sub={t("settings.notifMatchSub")}>
            <Toggle checked={prefs.notifMatch} onChange={(v) => patch("notifMatch", v)} />
          </SettingRow>
          <SettingRow label={t("settings.notifEvents")} sub={t("settings.notifEventsSub")}>
            <Toggle checked={prefs.notifEvents} onChange={(v) => patch("notifEvents", v)} />
          </SettingRow>
          <SettingRow label={t("settings.notifMessages")} sub={t("settings.notifMessagesSub")}>
            <Toggle checked={prefs.notifMessages} onChange={(v) => patch("notifMessages", v)} />
          </SettingRow>
          <SettingRow label={t("settings.notifCapital")} sub={t("settings.notifCapitalSub")}>
            <Toggle checked={prefs.notifCapital} onChange={(v) => patch("notifCapital", v)} />
          </SettingRow>
          <SettingRow label={t("settings.notifDigest")} sub={t("settings.notifDigestSub")}>
            <Toggle checked={prefs.notifDigest} onChange={(v) => patch("notifDigest", v)} />
          </SettingRow>
          <SettingRow label={t("settings.notifEmail")} sub={t("settings.notifEmailSub")}>
            <Toggle checked={prefs.notifEmail} onChange={(v) => patch("notifEmail", v)} />
          </SettingRow>
        </div>
      </Section>

      <Section icon={Shield} title={t("settings.sectionPrivacy")} sub={t("settings.sectionPrivacySub")}>
        <div className="panel-glass px-4">
          <SettingRow label={t("settings.showOnline")} sub={t("settings.showOnlineSub")}>
            <Toggle checked={prefs.showOnline} onChange={(v) => patch("showOnline", v)} />
          </SettingRow>
          <SettingRow label={t("settings.allowMatch")} sub={t("settings.allowMatchSub")}>
            <Toggle checked={prefs.allowMatch} onChange={(v) => patch("allowMatch", v)} />
          </SettingRow>
          <SettingRow label={t("settings.analyticsConsent")} sub={t("settings.analyticsConsentSub")}>
            <Toggle checked={prefs.analyticsConsent} onChange={(v) => patch("analyticsConsent", v)} />
          </SettingRow>
        </div>
      </Section>

      <Section icon={Palette} title={t("settings.sectionAppearance")} sub={t("settings.sectionAppearanceSub")}>
        <div className="panel-glass px-4">
          <SettingRow label={t("settings.theme")} sub={t("settings.themeSub")}>
            <RadioGroup<Theme>
              options={[
                { value: "light", label: t("settings.themeLight") },
                { value: "dark", label: t("settings.themeDark") },
                { value: "system", label: t("settings.themeSystem") },
              ]}
              value={prefs.theme}
              onChange={(v) => patchTheme(v)}
            />
          </SettingRow>
          <SettingRow label={t("settings.compactMode")} sub={t("settings.compactModeSub")}>
            <Toggle checked={prefs.compactMode} onChange={(v) => patch("compactMode", v)} />
          </SettingRow>
        </div>
      </Section>

      <Section icon={Globe} title={t("settings.sectionLang")} sub={t("settings.sectionLangSub")}>
        <div className="panel-glass px-4">
          <SettingRow label={t("settings.uiLang")}>
            <RadioGroup<Lang>
              options={[
                { value: "tr", label: t("settings.langTr") },
                { value: "en", label: t("settings.langEn") },
              ]}
              value={prefs.lang}
              onChange={(v) => {
                patch("lang", v);
                setLocale(v);
              }}
            />
          </SettingRow>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className={[
            "flex items-center gap-2 border px-6 py-2.5 font-mono text-label uppercase tracking-widest transition-all disabled:opacity-40",
            saved
              ? "border-[var(--inner-green)]/40 bg-[var(--inner-green)]/10 text-[var(--success-ink)]"
              : "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)] hover:bg-[var(--ink)]/85",
          ].join(" ")}
        >
          {saved ? (
            <>
              <Check className="size-3" /> {t("common.saved")}
            </>
          ) : busy ? (
            t("common.saving")
          ) : (
            t("common.save")
          )}
        </button>
        {saved && (
          <p className="font-mono text-label text-[var(--ink-muted)]">{t("settings.prefsUpdated")}</p>
        )}
        {saveError && (
          <p className="font-mono text-label text-[var(--error-ink)]" role="alert">
            {saveError}
          </p>
        )}
      </div>

      <div className="border border-[var(--error)]/20 p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="size-3.5 text-[var(--error-ink)]" />
          <p className="font-mono text-label uppercase tracking-widest text-[var(--error-ink)]">
            {t("settings.danger")}
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-light text-[var(--ink)]">{t("settings.suspend")}</p>
              <p className="font-mono text-label text-[var(--ink-muted)]">{t("settings.suspendSub")}</p>
            </div>
            <button
              type="button"
              disabled
              className="border border-[var(--error)]/20 px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--error-ink)] opacity-40"
            >
              {t("common.soon")}
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-light text-[var(--ink)]">{t("common.logoutLong")}</p>
              <p className="font-mono text-label text-[var(--ink-muted)]">{t("settings.logoutSub")}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="hit-40 relative flex items-center gap-1.5 panel-glass px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:text-[var(--ink)]"
            >
              <LogOut className="size-3" /> {t("common.logout")}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·hub</span> · {t("settings.footer")}
        </p>
      </div>
    </div>
  );
}
