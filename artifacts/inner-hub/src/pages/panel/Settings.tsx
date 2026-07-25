import { useEffect, useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiUrl } from "@/lib/api";
import { ErrorState, LoadingBlock } from "@/components/panel/Skeletons";
import { Check, Bell, Shield, Palette, Globe, LogOut, AlertTriangle } from "lucide-react";

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
          "absolute top-0.5 size-3.5 bg-[var(--bone)] transition-transform duration-150",
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
};

export default function Settings() {
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
      if (!res.ok) throw new Error(json.error ?? "Kaydedilemedi");
      if (json.prefs) setPrefs({ ...DEFAULT_PREFS, ...json.prefs });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setSaveError(e.message ?? "Kaydedilemedi");
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
    return <LoadingBlock label="Ayarlar yükleniyor" />;
  }
  if (isError && !hydrated) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Ayarlar alınamadı"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="max-w-lg space-y-8">
      <FadeIn>
        <div>
          <p className="mb-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)]">
            <span lang="en">inner·hub</span>
          </p>
          <h1
            className="font-serif font-display text-4xl text-[var(--ink)] md:text-5xl"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 300 }}
          >
            ayarlar
            <span className="ml-[0.05em] inline-block size-[0.35em] translate-y-[0.08em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm font-light text-[var(--ink-muted)]">
            Hesap ve platform tercihlerini yönet.
          </p>
        </div>
      </FadeIn>

      <Section icon={Bell} title="Bildirimler" sub="Hangi olaylarda bildirim almak istediğini seç">
        <div className="border border-[var(--ink)]/[0.08] px-4">
          <SettingRow label="inner·match önerileri" sub="Yeni eşleşme geldiğinde">
            <Toggle checked={prefs.notifMatch} onChange={(v) => patch("notifMatch", v)} />
          </SettingRow>
          <SettingRow label="Etkinlik hatırlatmaları" sub="Katıldığın etkinliklerden 1 gün önce">
            <Toggle checked={prefs.notifEvents} onChange={(v) => patch("notifEvents", v)} />
          </SettingRow>
          <SettingRow label="Chat mesajları" sub="@bahsedilme ve DM">
            <Toggle checked={prefs.notifMessages} onChange={(v) => patch("notifMessages", v)} />
          </SettingRow>
          <SettingRow label="inner·capital güncellemeleri" sub="SPV ve deal flow aktivitesi">
            <Toggle checked={prefs.notifCapital} onChange={(v) => patch("notifCapital", v)} />
          </SettingRow>
          <SettingRow label="Haftalık digest" sub="Haftanın özeti her Pazartesi">
            <Toggle checked={prefs.notifDigest} onChange={(v) => patch("notifDigest", v)} />
          </SettingRow>
          <SettingRow label="E-posta bildirimleri" sub="Platform bildirimlerini e-posta ile al">
            <Toggle checked={prefs.notifEmail} onChange={(v) => patch("notifEmail", v)} />
          </SettingRow>
        </div>
      </Section>

      <Section icon={Shield} title="Gizlilik" sub="Platform içinde görünürlüğünü kontrol et">
        <div className="border border-[var(--ink)]/[0.08] px-4">
          <SettingRow label="Çevrimiçi durumu göster" sub="Diğer üyeler seni ONLINE olarak görür">
            <Toggle checked={prefs.showOnline} onChange={(v) => patch("showOnline", v)} />
          </SettingRow>
          <SettingRow label="inner·match'e dahil ol" sub="AI eşleştirme motorunda göründüğünde">
            <Toggle checked={prefs.allowMatch} onChange={(v) => patch("allowMatch", v)} />
          </SettingRow>
          <SettingRow label="Anonim analitik" sub="Platform iyileştirmesi için anonim kullanım verisi">
            <Toggle checked={prefs.analyticsConsent} onChange={(v) => patch("analyticsConsent", v)} />
          </SettingRow>
        </div>
      </Section>

      <Section icon={Palette} title="Görünüm" sub="Platform arayüz tercihleri">
        <div className="border border-[var(--ink)]/[0.08] px-4">
          <SettingRow label="Tema" sub="Renk modu (kayıt edilir; koyu tema yakında)">
            <RadioGroup<Theme>
              options={[
                { value: "light", label: "Açık" },
                { value: "dark", label: "Koyu" },
                { value: "system", label: "Sistem" },
              ]}
              value={prefs.theme}
              onChange={(v) => patch("theme", v)}
            />
          </SettingRow>
          <SettingRow label="Kompakt mod" sub="Daha yoğun içerik düzeni">
            <Toggle checked={prefs.compactMode} onChange={(v) => patch("compactMode", v)} />
          </SettingRow>
        </div>
      </Section>

      <Section icon={Globe} title="Dil" sub="Platform arayüz dili">
        <div className="border border-[var(--ink)]/[0.08] px-4">
          <SettingRow label="Arayüz dili">
            <RadioGroup<Lang>
              options={[
                { value: "tr", label: "Türkçe" },
                { value: "en", label: "English" },
              ]}
              value={prefs.lang}
              onChange={(v) => patch("lang", v)}
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
              <Check className="size-3" /> Kaydedildi
            </>
          ) : busy ? (
            "Kaydediliyor…"
          ) : (
            "Kaydet"
          )}
        </button>
        {saved && (
          <p className="font-mono text-label text-[var(--ink-muted)]">Tercihler güncellendi</p>
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
            Tehlikeli Alan
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-light text-[var(--ink)]">Hesabı askıya al</p>
              <p className="font-mono text-label text-[var(--ink-muted)]">Üyeliğini geçici olarak durdur</p>
            </div>
            <button
              type="button"
              disabled
              className="border border-[var(--error)]/20 px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--error-ink)] opacity-40"
            >
              Yakında
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-light text-[var(--ink)]">Çıkış yap</p>
              <p className="font-mono text-label text-[var(--ink-muted)]">Bu cihazdan oturumu kapat</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="hit-40 relative flex items-center gap-1.5 border border-[var(--ink)]/10 px-4 py-2 font-mono text-label uppercase tracking-widest text-[var(--ink-body)] transition-colors hover:text-[var(--ink)]"
            >
              <LogOut className="size-3" /> Çıkış
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-label uppercase tracking-widest text-[var(--ink-subtle)]">
          <span lang="en">inner·hub</span> · ayarlar
        </p>
      </div>
    </div>
  );
}
