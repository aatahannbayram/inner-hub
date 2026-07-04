import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { Check, Bell, Shield, Palette, Globe, LogOut, AlertTriangle } from "lucide-react";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
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
        <Icon className="mt-0.5 size-4 shrink-0 text-[var(--ink)]/25" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40">{title}</p>
          <p className="mt-0.5 text-xs text-[var(--ink)]/30">{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Setting row ──────────────────────────────────────────────────────────────

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
        <p className="text-sm text-[var(--ink)] font-light">{label}</p>
        {sub && <p className="font-mono text-[9px] text-[var(--ink)]/30">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Radio group ─────────────────────────────────────────────────────────────

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
          onClick={() => onChange(opt.value)}
          className={[
            "border px-3 py-1 font-mono text-[8px] uppercase tracking-widest transition-colors",
            value === opt.value
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
              : "border-[var(--ink)]/10 text-[var(--ink)]/30 hover:text-[var(--ink)]",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Lang = "tr" | "en";
type Theme = "light" | "dark" | "system";

export default function Settings() {
  const [saved, setSaved] = useState(false);

  // Notification prefs
  const [notifMatch, setNotifMatch]           = useState(true);
  const [notifEvents, setNotifEvents]         = useState(true);
  const [notifMessages, setNotifMessages]     = useState(true);
  const [notifCapital, setNotifCapital]       = useState(false);
  const [notifDigest, setNotifDigest]         = useState(true);
  const [notifEmail, setNotifEmail]           = useState(true);

  // Privacy
  const [showOnline, setShowOnline]           = useState(true);
  const [allowMatch, setAllowMatch]           = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  // Appearance
  const [theme, setTheme]                     = useState<Theme>("light");
  const [lang, setLang]                       = useState<Lang>("tr");
  const [compactMode, setCompactMode]         = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-lg">
      {/* Header */}
      <FadeIn>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/40 mb-2">
            inner·hub
          </p>
          <h1
            className="font-serif font-display text-4xl md:text-5xl text-[var(--ink)]"
            style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0", fontWeight: 100 }}
          >
            ayarlar
            <span className="inline-block size-[0.35em] translate-y-[0.08em] ml-[0.05em] bg-[var(--inner-green)]" />
          </h1>
          <p className="mt-2 text-sm text-[var(--ink)]/50 font-light">
            Hesap ve platform tercihlerini yönet.
          </p>
        </div>
      </FadeIn>

      {/* Notifications */}
      <Section icon={Bell} title="Bildirimler" sub="Hangi olaylarda bildirim almak istediğini seç">
        <div className="border border-[var(--ink)]/[0.08] px-4">
          <SettingRow label="inner·match önerileri" sub="Yeni eşleşme geldiğinde">
            <Toggle checked={notifMatch} onChange={setNotifMatch} />
          </SettingRow>
          <SettingRow label="Etkinlik hatırlatmaları" sub="Katıldığın etkinliklerden 1 gün önce">
            <Toggle checked={notifEvents} onChange={setNotifEvents} />
          </SettingRow>
          <SettingRow label="Chat mesajları" sub="@bahsedilme ve DM">
            <Toggle checked={notifMessages} onChange={setNotifMessages} />
          </SettingRow>
          <SettingRow label="inner·capital güncellemeleri" sub="SPV ve deal flow aktivitesi">
            <Toggle checked={notifCapital} onChange={setNotifCapital} />
          </SettingRow>
          <SettingRow label="Haftalık digest" sub="Haftanın özeti her Pazartesi">
            <Toggle checked={notifDigest} onChange={setNotifDigest} />
          </SettingRow>
          <SettingRow label="E-posta bildirimleri" sub="Platform bildirimlerini e-posta ile al">
            <Toggle checked={notifEmail} onChange={setNotifEmail} />
          </SettingRow>
        </div>
      </Section>

      {/* Privacy */}
      <Section icon={Shield} title="Gizlilik" sub="Platform içinde görünürlüğünü kontrol et">
        <div className="border border-[var(--ink)]/[0.08] px-4">
          <SettingRow label="Çevrimiçi durumu göster" sub="Diğer üyeler seni ONLINE olarak görür">
            <Toggle checked={showOnline} onChange={setShowOnline} />
          </SettingRow>
          <SettingRow label="inner·match'e dahil ol" sub="AI eşleştirme motorunda göründüğünde">
            <Toggle checked={allowMatch} onChange={setAllowMatch} />
          </SettingRow>
          <SettingRow label="Anonim analitik" sub="Platform iyileştirmesi için anonim kullanım verisi">
            <Toggle checked={analyticsConsent} onChange={setAnalyticsConsent} />
          </SettingRow>
        </div>
      </Section>

      {/* Appearance */}
      <Section icon={Palette} title="Görünüm" sub="Platform arayüz tercihleri">
        <div className="border border-[var(--ink)]/[0.08] px-4">
          <SettingRow label="Tema" sub="Renk modu">
            <RadioGroup
              options={[
                { value: "light", label: "Açık" },
                { value: "dark", label: "Koyu" },
                { value: "system", label: "Sistem" },
              ]}
              value={theme}
              onChange={setTheme}
            />
          </SettingRow>
          <SettingRow label="Kompakt mod" sub="Daha yoğun içerik düzeni">
            <Toggle checked={compactMode} onChange={setCompactMode} />
          </SettingRow>
        </div>
      </Section>

      {/* Language */}
      <Section icon={Globe} title="Dil" sub="Platform arayüz dili">
        <div className="border border-[var(--ink)]/[0.08] px-4">
          <SettingRow label="Arayüz dili">
            <RadioGroup
              options={[
                { value: "tr", label: "Türkçe" },
                { value: "en", label: "English" },
              ]}
              value={lang}
              onChange={setLang}
            />
          </SettingRow>
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          className={[
            "flex items-center gap-2 border px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all",
            saved
              ? "border-[var(--inner-green)]/40 bg-[var(--inner-green)]/10 text-[var(--inner-green)]"
              : "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)] hover:bg-[var(--ink)]/85",
          ].join(" ")}
        >
          {saved ? <><Check className="size-3" /> Kaydedildi</> : "Kaydet"}
        </button>
        {saved && (
          <p className="font-mono text-[9px] text-[var(--ink)]/30">Tercihler güncellendi</p>
        )}
      </div>

      {/* Danger zone */}
      <div className="border border-[var(--error)]/20 p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="size-3.5 text-[var(--error)]/60" />
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--error)]/60">Tehlikeli Alan</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--ink)] font-light">Hesabı askıya al</p>
              <p className="font-mono text-[9px] text-[var(--ink)]/30">Üyeliğini geçici olarak durdur</p>
            </div>
            <button className="border border-[var(--error)]/20 px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-[var(--error)]/50 hover:border-[var(--error)]/40 hover:text-[var(--error)] transition-colors">
              Askıya Al
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--ink)] font-light">Çıkış yap</p>
              <p className="font-mono text-[9px] text-[var(--ink)]/30">Bu cihazdan oturumu kapat</p>
            </div>
            <button className="flex items-center gap-1.5 border border-[var(--ink)]/10 px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/40 hover:text-[var(--ink)] transition-colors">
              <LogOut className="size-3" /> Çıkış
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--ink)]/[0.08] pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink)]/20">
          inner·hub · ayarlar · v0.1.0
        </p>
      </div>
    </div>
  );
}
