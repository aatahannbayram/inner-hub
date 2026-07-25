# inner.hub Panel — Kademeli İyileştirme Planı

> Tarih: 2026-07-25
> Rol: Kıdemli Frontend Engineer — canlı (production) SaaS panelinde kullanıcıyı bozmadan iyileştirme
> Öncelik sırası: (1) sıfır kırılma, (2) geri alınabilir değişiklikler, (3) ölçülebilir iyileştirme
> Yaklaşım: additive-first, kademeli (incremental) — toptan refactor / tasarım sistemi değişimi yok
> Artifact (görsel/etkileşimli versiyon): https://claude.ai/code/artifact/5e5fd320-d9f8-4e52-9f8d-1cb37be6b673

Bu belge repo'daki gerçek dosyalar okunarak yazıldı (`index.html`, `src/index.css`, `src/App.tsx`,
`src/components/panel/PanelShell.tsx`, `src/components/panel/PanelNav.tsx`, `src/components/FadeIn.tsx`,
`src/components/AnimatedHeading.tsx`, `src/components/panel/PanelPageTransition.tsx`,
`src/pages/panel/Courses.tsx`) — dosya yolları ve satır referansları gerçek. **Bu bir plan/öneri
dokümanıdır; repo'da henüz hiçbir dosya değiştirilmedi.**

---

## 1) Teknik eylem planı

15 bulgunun her biri tek satır. Aynı dosyaya dokunan işler **Grup** sütununda işaretli — bunlar aynı
commit'te birleştirilmeli, aksi halde art arda gelen küçük commit'ler birbirini ezer.

| # | Dosya / Bileşen | Yapılacak değişiklik | Risk | Efor | Rollback | Grup |
|---|---|---|---|---|---|---|
| **F1** | `src/index.css` + 19× `pages/panel/*.tsx` | Additive `--text-*` ölçeği eklenir (bkz. 2a); sonrasında sayfa başına ad-hoc `text-[9px]` vb. → semantik class migrasyonu. | Düşük (token) / Orta (migrasyon) | S + 19×S | Token: bloğu sil · Sayfa: o sayfanın commit'ini revert et | A / E |
| **F2** | Aynı 19 sayfa (F1 ile aynı satırlar) | Opaklık tabanlı `--ink)]/NN` yerine düz hex semantik token (`--ink-muted` vb.) — F1 ile **aynı commit'te**. | Orta | (F1'e dahil) | Sayfa başına commit revert | E |
| **F3** | Courses.tsx:69, InnerApi.tsx:349, InnerId.tsx:87/305, Members.tsx:298, Membership.tsx:192 + 35 diğer | `text-[var(--inner-green)]` → `text-[var(--success-ink)]`. Sadece *metin/ikon*; `bg-`/nokta/beacon dokunulmaz. | Düşük | M (40 nokta, tek regex) | Sayfa başına commit revert | E |
| **F4** | Analytics.tsx, Applications.tsx, Events.tsx, Courses.tsx, Membership.tsx, InnerApi.tsx + 26 diğer | `text-[var(--error)]` (küçük metin) → `text-[var(--error-ink)]`. | Düşük | M | Sayfa başına commit revert | E |
| **F5** | `index.html` · yeni `src/lib/tr.ts` · marka lockup bileşenleri | `lang="en"` → `"tr"`; İngilizce marka metnine (`Lockup`, `BrandMark`) `lang="en"` dil adası; locale-aware casing yardımcıları. | Orta | XS + S | `index.html` tek satır revert | B (index.html tekil) |
| **F6** | yeni `src/components/panel/Skeletons.tsx` + 19 sayfa | Ölçülmüş gerçek yükseklikte skeleton bileşenleri; sayfa başına `{loading && …}` bloğu değişimi (Courses.tsx pilot). | Düşük | S + 19×XS | Sayfa importunu eski `<p>Yükleniyor…</p>`'a döndür | D (component) + sayfa başına |
| **F7** | yeni `src/hooks/useApiQuery.ts` + 10 çağrı noktası | Elle `useEffect+fetch` → `useQuery` (`staleTime`, `placeholderData: keepPreviousData`). | Orta | M + 10×S | Sayfa başına commit revert | K (hook) + sayfa başına |
| **F8** | `PanelShell.tsx` (`ShellInner`, ~L367–449) | `main` ref + route değişiminde `scrollTop=0`; geri/ileri için scroll-pozisyon haritası. | Orta | S | Tek `useEffect` bloğunu kaldır | B |
| **F9** | `PanelPageTransition.tsx` | `mode="wait"` → `"sync"`, `exit` kaldırılır, süre 0.28s → 0.16s. | Düşük | XS | Tek satır (mode + duration) revert | C (tekil) |
| **F10** | `FadeIn.tsx` · `AnimatedHeading.tsx` | `delay` tavanı 0.3s (62 call-site); harf bazlı `split("")` → kelime bazlı, toplam stagger ≤0.35s. | Düşük/Orta | S | İki dosyada fonksiyon revert | F (birlikte) |
| **F11** | yeni `src/components/HeroVideo.tsx` + 10 call-site (Courses, Home, Invitation, Events, Members, Match, Perks, Capital, PlatformFeatures, EditorialCard) | `poster`, `preload="none"`, IntersectionObserver play/pause, reduced-motion'da statik poster, blur yerine gradient scrim. | **Yüksek** | M + 10×S | Sayfa başına commit revert | G (component) + sayfa başına |

> **Durum 2026-07-25 (Cursor devam 4):** F1–F15 çekirdek kapandı. Applications canlı: `GET/PATCH /api/applications` (admin). Frontend dist rebuild + `origin/main` push (`e76e464`). Prod DB `invitation_requests.role/linkedin` ALTER uygulandı. Hostinger MCP deploy tetiklenemedi — hPanel redeploy bekleniyor.
| **F12** | `src/App.tsx` | 19 panel route'u `React.lazy` + `Suspense`; Home/Invitation/Requests eager kalır (SEO/prerender). | Orta | M | Tek dosya, lazy → eager | C (tekil) |
| **F13** | `src/index.css` (`.hit-40`) + PanelShell.tsx, Settings.tsx, Courses.tsx | Görsel etkisiz `::after` tabanlı ≥40px dokunma alanı utility'si. | Düşük | XS + S | className'i kaldır | A (utility) + dağınık |
| **F14** | PanelNav.tsx · PanelShell.tsx (F8 ile aynı) · index.html · Courses.tsx | `aria-current="page"`, skip-link, `maximum-scale=1` kaldırma, ölü "Devam Et" CTA düzeltmesi. | Düşük | S | Dosya başına ayrı commit | B / I |
| **F15** | — | **Aktif değişiklik yok — belgelenmiş karar:** shadcn HSL seti `ui/*` için, ham `--ink/--bone` editoryal katman için korunur; `--text-*` katmanı ikisiyle uyumlu eklenir. Toptan birleştirme yapılmayacak. | Karar | — | — | — |

**Gruplama notu.** A = `src/index.css` additive bloklar (F1 token + F13 utility) — tek commit, üst üste
ekleme, çakışma yok. B = `PanelShell.tsx` (F8 scroll/focus + F14 skip-link) — aynı `ShellInner`
fonksiyonu, tek commit. C = tekil dosyalar (F9, F12) — izole, sırayla. D/G/K = yeni component + sayfa
başına ayrı migrasyon commit'leri (F6, F11, F7). E = sayfa-sayfa tipografi+kontrast migrasyonu
(F1+F2+F3+F4 aynı satırlarda birleşir). F = `FadeIn.tsx`+`AnimatedHeading.tsx`, tek commit. I =
`Courses.tsx` ölü CTA, tekil.

---

## 2) Kod önerileri

### a) Additive token katmanı

Mevcut `:root` ve `@theme inline` bloklarındaki hiçbir satır silinmez/değiştirilmez — aşağıdaki satırlar
onlara **eklenir**. Hiçbir call-site bu token'ları henüz kullanmadığı için bu commit tek başına **görsel
olarak sıfır etkilidir**.

> ⚠️ **Doğrulanması gereken varsayım:** Tailwind v4'te `@theme inline` bloğuna eklenen `--text-X` +
> `--text-X--line-height` + `--text-X--letter-spacing` üçlüsünün otomatik olarak tek bir `text-X`
> utility'si ürettiği (font-size + line-height + letter-spacing birlikte, ayrı `leading-X` gerekmez).
> `pnpm build` sonrası üretilen CSS'te `.text-label{font-size:...;line-height:...;letter-spacing:...}`
> çıktığını görsel olmayan bir QA adımıyla (derlenen CSS'i grep'lemek) doğrulayın.

```css
/* ============================================================
   EK KATMAN — Dalga 1: Semantik metin renkleri + tipografi ölçeği
   Mevcut :root ve @theme inline bloklarına EKLENİR, hiçbir mevcut
   satır silinmez. Geri almak için bu bloğu komple silmek yeterli.
   ============================================================ */

:root {
  /* --- Semantik metin renkleri (bone zemin, ölçülmüş kontrast) --- */
  --ink-strong:  #0A0A0A; /* 17.57:1 — başlık, birincil değer */
  --ink-body:    #3A3937; /* 10.24:1 — gövde metni */
  --ink-muted:   #575654; /*  6.51:1 — ikincil bilgi / sub-label */
  --ink-subtle:  #6B6A68; /*  4.80:1 — küçük mono etiket (≥11px zorunlu) */
  --ink-faint:   #767573; /*  4.09:1 ✗ AA altı — SADECE 14px+ veya non-text'te kullan */
  --ink-nontext: #8D8B89; /*  3.01:1 — SADECE kenarlık/ikon-dekor, ASLA metin */

  --success-ink: #0B6B3A; /*  5.86:1 — inner-green'in metin/ikon karşılığı (bone üstünde) */
  --error-ink:   #9C3F26; /*  5.91:1 — error'ın metin karşılığı (bone üstünde) */

  /* --- 4px tabanlı dikey ritim --- */
  --space-stack-xs: 4px;
  --space-stack-sm: 8px;
  --space-stack-md: 16px;
  --space-stack-lg: 24px;
  --space-stack-xl: 40px;
  --space-section:  64px;
}

@theme inline {
  /* --- Tipografi ölçeği: 1.25 modüler, 11px taban (mono mikro etiket) --- */
  --text-label: 0.6875rem;              /* 11px — text-[9px]/[10px]'in yerini alır */
  --text-label--line-height: 1.4;
  --text-label--letter-spacing: 0.08em;

  --text-caption: 0.75rem;              /* 12px */
  --text-caption--line-height: 1.45;
  --text-caption--letter-spacing: 0.02em;

  --text-body: 0.875rem;                /* 14px */
  --text-body--line-height: 1.6;
  --text-body--letter-spacing: 0em;

  --text-body-lg: 1rem;                 /* 16px */
  --text-body-lg--line-height: 1.6;
  --text-body-lg--letter-spacing: 0em;

  --text-title-sm: 1.25rem;             /* 20px */
  --text-title-sm--line-height: 1.3;
  --text-title-sm--letter-spacing: -0.01em;

  --text-title: 1.5625rem;              /* ~25px */
  --text-title--line-height: 1.25;
  --text-title--letter-spacing: -0.015em;

  --text-title-lg: 1.953rem;            /* ~31px */
  --text-title-lg--line-height: 1.15;
  --text-title-lg--letter-spacing: -0.015em;

  --text-display: clamp(2.25rem, 1.6rem + 3vw, 3.815rem);    /* ~36–61px */
  --text-display--line-height: 1.05;
  --text-display--letter-spacing: -0.02em;

  --text-display-lg: clamp(2.75rem, 1.8rem + 5vw, 5.96rem);  /* ~44–95px */
  --text-display-lg--line-height: 1.02;
  --text-display-lg--letter-spacing: -0.02em;
}

/* ============================================================
   Dalga 0 — runtime kill-switch (deploy'suz geri alma).
   html[data-ux="legacy"] set edilirse migrate edilmiş call-site'lar
   dahi maksimum-kontrast ink'e döner. Bu PİKSEL-BİREBİR eski hale
   dönüş DEĞİL — "her koşulda okunur" garantili güvenli bir geri
   çekilme noktasıdır. Birebir görsel revert için dosya bazlı git
   commit revert kullanılır.
   Konsoldan aç/kapat:
     document.documentElement.setAttribute('data-ux','legacy')
     document.documentElement.removeAttribute('data-ux')
   ============================================================ */
html[data-ux="legacy"] {
  --ink-body:    #0A0A0A;
  --ink-muted:   #0A0A0A;
  --ink-subtle:  #0A0A0A;
  --ink-faint:   #0A0A0A;
  --success-ink: #18FF85;
  --error-ink:   #B4553B;
}
```

### b) Migrasyon eşleme tablosu

F1+F2+F3+F4 aynı satırda kapanır. Sayfa migrasyonunda find/replace referansı olarak kullanılır.

| Token | Hex | Kontrast | Kullanım |
|---|---|---|---|
| `--ink-strong` | `#0A0A0A` | 17.57:1 | Başlık, birincil rakam/değer |
| `--ink-body` | `#3A3937` | 10.24:1 | Gövde metni, açıklama |
| `--ink-muted` | `#575654` | 6.51:1 | İkincil bilgi, sub-label, meta |
| `--ink-subtle` | `#6B6A68` | 4.80:1 | Mono mikro etiket (≥11px) |
| `--ink-faint` | `#767573` | 4.09:1 ✗ | Yalnız 14px+ veya non-text |
| `--success-ink` | `#0B6B3A` | 5.86:1 | inner-green'in metin/ikon karşılığı |
| `--error-ink` | `#9C3F26` | 5.91:1 | error'ın metin karşılığı |

| Eski | Yeni | Kontrast önce → sonra |
|---|---|---|
| `text-[9px] uppercase tracking-widest text-[var(--ink)]/20` | `text-label uppercase text-[var(--ink-subtle)]` | ~2.1:1 → **4.80:1** |
| `text-[9px] text-[var(--ink)]/30` | `text-label text-[var(--ink-subtle)]` | ~2.9:1 → **4.80:1** |
| `text-[10px] text-[var(--ink)]/46` | `text-label text-[var(--ink-muted)]` | 3.40:1 → **6.51:1** |
| `text-[10px] text-[var(--ink)]/50` | `text-label text-[var(--ink-muted)]` | 3.88:1 → **6.51:1** |
| `text-xs text-[var(--ink)]/51` | `text-caption text-[var(--ink-muted)]` | 4.02:1 → **6.51:1** |
| `text-[11px] font-mono` | `text-caption font-mono` | boyut korunur, satır yüksekliği/letter-spacing standardize |
| `text-[var(--inner-green)]` (metin/ikon, bone zemin) | `text-[var(--success-ink)]` | 1.19:1 ✗ → **5.86:1** |
| `text-[var(--error)]` (küçük metin, bone zemin) | `text-[var(--error-ink)]` | 4.33:1 → **5.91:1** |

Not: `bg-[var(--inner-green)]` (nokta, beacon, dolgu), `border-[var(--ink)]/NN` (kenarlık) ve ikon-dekor
kullanımları bu migrasyonun **dışındadır** — WCAG 1.4.11 sadece anlamlı UI sınırları için 3:1 ister, salt
dekoratif ayraçlar kapsam dışı. Regex hedefi yalnızca `text-[var(--…)]/…` önekiyle sınırlı tutulmalı.

### c) i18n / Türkçe güvenliği

```html
<!-- önce -->
<html lang="en">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />

<!-- sonra -->
<html lang="tr">
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<!-- maximum-scale kaldırıldı: WCAG 1.4.4 — pinch-zoom serbest -->
```

> ⚠️ **Doğrulanması gereken varsayım:** `lang="tr"` sonrası CSS `text-transform:uppercase`'ün tarayıcıda
> Türkçe İ/ı kuralını (i→İ, I harici) doğru uyguladığı zaten doğrulandı. Ek olarak: sayfa genelinde
> `lang="tr"` geçişinin ekran okuyucu telaffuzunu (VoiceOver/NVDA) olumsuz etkilemediği — İngilizce marka
> kelimeleri (`inner·hub`, `Builder`, `Scale`) için ayrı `lang="en"` adası konuşma kalitesini düzeltir.

```tsx
{/* Türkçe İ/ı büyütme kuralı marka adına uygulanmasın:
    "inner" → "İNNER" değil, "INNER" olmalı. */}
<span lang="en">inner</span>·hub
```

Bu tek örnek — `Lockup.tsx`, `BrandMark` (PanelShell.tsx) ve ana sayfadaki İngilizce hero cümlesi ("A
private circle of founders…") aynı desenle işaretlenmeli. Dalga 1'de tam bir
`grep -rn "uppercase" src | grep -i "inner\|hub"` taraması ile kapsam netleştirilmeli — burada iddia
edilen sayı tam değil, bu bir denetim maddesi olarak Dalga 1'e eklenmeli.

```ts
// src/lib/tr.ts — YENİ DOSYA
// Türkçe'de düz toUpperCase()/toLowerCase() YASAK: "İstanbul".toLowerCase()
// === "i̇stanbul" (yanlış, kombine karakter) üretir. Locale-aware kullan.

export function toUpperTR(s: string): string {
  return s.toLocaleUpperCase("tr-TR");
}

export function toLowerTR(s: string): string {
  return s.toLocaleLowerCase("tr-TR");
}

export function compareTR(a: string, b: string): number {
  return a.localeCompare(b, "tr");
}

// Mevcut "%0" biçimi Türkçe için DOĞRU — korunur, DEĞİŞTİRİLMEZ.
// Bu yardımcı yalnızca elle string birleştirme yapılan (`%${x}`) yerlerde
// tutarlılık için opsiyoneldir, zorunlu migrasyon değildir.
export function formatPercentTR(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 1 }).format(value / 100);
}
```

```css
/* src/index.css — EKLE
   Türkçe metin İngilizceden ~%10-20 uzun olabilir; sabit width yerine
   min-h + kelime kırma güvenliği. Buton/etiket metinlerinde kullan. */
.tr-safe-wrap {
  overflow-wrap: anywhere;
  hyphens: auto;
  text-wrap: pretty;
}
```

### d) CLS'siz loading / skeleton

```tsx
// src/components/panel/Skeletons.tsx — YENİ DOSYA
import { motion, useReducedMotion } from "framer-motion";

// Shimmer sadece transform/opacity — layout tetiklemez, GPU'da çalışır.
function Shimmer({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={`${className} bg-[var(--ink)]/[0.05]`} />;
  }
  return (
    <motion.div className={`${className} bg-[var(--ink)]/[0.05] relative overflow-hidden`} aria-hidden="true">
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-[var(--ink)]/[0.06]"
        initial={{ x: "-100%" }}
        animate={{ x: "220%" }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

// Ölçülmüş gerçek yükseklik: istatistik kartı 105px
export function StatCardSkeleton() {
  return <Shimmer className="h-[105px] border border-[var(--ink)]/[0.08]" />;
}

// Ölçülmüş gerçek yükseklik: kurs listesi satırı 207px
export function CourseCardSkeleton() {
  return <Shimmer className="h-[207px] border border-[var(--ink)]/[0.08]" />;
}

export function LoadingBlock({ label = "Yükleniyor", children }: { label?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{`${label}…`}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="border border-[var(--error-ink)]/30 bg-[var(--error-ink)]/5 p-4">
      <p className="text-sm text-[var(--error-ink)]">{message}</p>
      <button onClick={onRetry} className="mt-2 font-mono text-[11px] uppercase tracking-widest text-[var(--error-ink)] underline">
        Tekrar dene
      </button>
    </div>
  );
}
```

```tsx
// src/pages/panel/Courses.tsx — pilot entegrasyon

// önce (L393-401 civarı)
{loading && (
  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink)]/56">
    Yükleniyor…
  </p>
)}

// sonra
{loading && (
  <LoadingBlock label="Kurslar yükleniyor">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
  </LoadingBlock>
)}
{error && <ErrorState message={error} onRetry={() => window.location.reload()} />}
```

### e) Geçiş animasyonları

```tsx
// src/components/panel/PanelPageTransition.tsx — DEĞİŞTİR 2 satır

// önce
<AnimatePresence mode="wait" initial={false}>
  <motion.div key={location} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    exit={{ opacity: 0 }} transition={{ duration: 0.28, ease }}>

// sonra — exit yok, mode sync: yeni sayfa eskisini beklemeden girer
<AnimatePresence mode="sync" initial={false}>
  <motion.div key={location} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    transition={{ duration: 0.16, ease }}>
```

```tsx
// src/components/FadeIn.tsx — DEĞİŞTİR 1 satır

// önce
transition={{ duration: 0.55, ease, delay }}

// sonra — 62 call-site'a TEK noktadan tavan; mevcut delay prop'ları
// bileşenlerde değişmez, sadece burada kırpılır (additive-safe)
transition={{ duration: 0.55, ease, delay: Math.min(delay, 0.3) }}
```

```tsx
// src/components/AnimatedHeading.tsx — split stratejisi
// önce: harf bazlı split("") — 31 karakter ≈ 1.13s toplam stagger
// sonra: kelime bazlı — daha kısa toplam süre, ekran okuyucu için
// tam metin aria-label'da, kelime span'leri aria-hidden

const WORD_DELAY = 0.045;
const MAX_STAGGER = 0.35; // toplam gecikme tavanı

return (
  <h1 className={className} style={style} aria-label={text.replace("\n", " ")}>
    {lines.map((line, lineIndex) => (
      <span key={lineIndex} className="block" aria-hidden="true">
        {line.split(" ").map((word, wordIndex, arr) => {
          const globalIndex = lineIndex * arr.length + wordIndex;
          const delay = INITIAL_DELAY + Math.min(globalIndex * WORD_DELAY, MAX_STAGGER);
          return (
            <motion.span key={wordIndex} className="inline-block"
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: CHAR_DURATION, ease: EASE, delay }}>
              {word}{wordIndex < arr.length - 1 ? " " : ""}
            </motion.span>
          );
        })}
      </span>
    ))}
  </h1>
);
```

Not: mevcut `split("")` Türkçe karakterler (ı, ş, ğ, ü, ö, ç, İ) için surrogate-pair riski taşımıyor —
bunların hepsi tek UTF-16 birimi. Kelime bazlı geçişin asıl gerekçesi algılanan hız (F10) ve gelecekte
emoji/exotic karakter eklenirse güvenlik payı; Türkçe karakter bozulması bugün mevcut değil.

### f) Hero video optimizasyonu

> ⚠️ **Doğrulanması gereken varsayım:** poster üretim akışı henüz yok — her video kaynağının ilk karesinin
> WebP olarak dışa aktarılması (ör. `ffmpeg -i src.mp4 -vframes 1 poster.webp`) CI/asset pipeline'ına
> eklenmeli. Bu plan sadece component API'sini tanımlar; poster üretimi ayrı bir altyapı görevidir.

```tsx
// src/components/HeroVideo.tsx — YENİ DOSYA
import { useEffect, useRef } from "react";

interface HeroVideoProps {
  src: string;
  poster: string; // zorunlu — LCP elementi artık VIDEO değil bu poster olur
  className?: string;
}

export function HeroVideo({ src, poster, className }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduce || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? el.play().catch(() => {}) : el.pause(); },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  if (reduce) {
    // Statik poster — hareket yok, LCP = img
    return <img src={poster} alt="" aria-hidden="true" className={className} />;
  }

  return (
    <video ref={ref} muted loop playsInline poster={poster} preload="none" className={className} src={src} />
  );
}
```

```tsx
// src/pages/panel/Courses.tsx — CoursesHero()

// önce
<video autoPlay muted loop playsInline
  className="absolute inset-0 h-full w-full object-cover"
  src="https://…4a271a6c…mp4" />
<div aria-hidden="true"
  className="bottom-blur-mask pointer-events-none absolute inset-0 z-[1] bg-black/20 backdrop-blur-xl" />

// sonra — sabit yükseklik KORUNUYOR (min(70vh,620px)/minHeight:440, CLS'i o engelliyor)
<HeroVideo
  src="https://…4a271a6c…mp4"
  poster="/posters/courses-hero.webp"
  className="absolute inset-0 h-full w-full object-cover"
/>
{/* backdrop-blur-xl kaldırıldı → deterministik gradient scrim.
    Hedef: üstteki beyaz metin ≥4.5:1 — gradient en koyu noktada
    rgba(0,0,0,.72), metnin durduğu alt bölgede yoğunlaşır. */}
<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]"
  style={{ background: "linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.35) 55%, rgba(0,0,0,.72) 100%)" }} />
```

Bu değişiklik 10 çağrı noktasının (Courses, Home, Invitation, Events, Members, Match, Perks, Capital,
PlatformFeatures, EditorialCard) her birinde ayrı commit olarak uygulanmalı — `backdrop-blur-xl`'in her
sayfada üstündeki metnin farklı olması nedeniyle scrim yoğunluğu sayfa başına ayrı ayrı kontrast
ölçümüyle ayarlanmalı (tek bir sabit değer hepsine güvenle uygulanamaz).

### g) Kabuk düzeltmeleri — scroll reset, focus, aria-current

> ⚠️ **Doğrulanması gereken varsayım:** `wouter`'ın `useLocation()`'ı native `window` `popstate` olayıyla
> senkron tetiklediği ve dolayısıyla "geri/ileri mi yoksa yeni navigasyon mu" ayrımının `popstate`
> listener'ı ile güvenilir yapılabildiği — wouter kaynak kodu üzerinden veya küçük bir prototiple teyit
> edilmeli.

```tsx
// src/components/panel/PanelShell.tsx — ShellInner()
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";

// Route → scroll pozisyonu haritası (modül seviyesinde, unmount'ta kaybolmaz)
const scrollMap = new Map<string, number>();
let isPopNavigation = false;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => { isPopNavigation = true; });
}

function ShellInner({ user, children, onLogout }: PanelShellProps) {
  const [location] = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const prevLocation = useRef(location);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    // Ayrılan sayfanın scroll'unu kaydet
    scrollMap.set(prevLocation.current, main.scrollTop);

    if (isPopNavigation && scrollMap.has(location)) {
      main.scrollTop = scrollMap.get(location)!; // geri/ileri: eski pozisyona dön
    } else {
      main.scrollTop = 0;       // yeni navigasyon: en üste sıfırla
      main.focus({ preventScroll: true }); // focus'u BODY'de bırakma
    }
    isPopNavigation = false;
    prevLocation.current = location;
  }, [location]);

  return (
    <div className="flex h-svh overflow-hidden bg-[var(--bone)] text-[var(--ink)]">
      <a href="#panel-main" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-[var(--ink)] focus:text-[var(--bone)] focus:px-4 focus:py-2">
        İçeriğe atla
      </a>
      {/* … DesktopSidebar / MobileDrawer değişmedi … */}
      <main
        id="panel-main"
        ref={mainRef}
        tabIndex={-1}
        className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8 outline-none"
      >
        <PanelPageTransition>{children}</PanelPageTransition>
      </main>
    </div>
  );
}
```

```tsx
// src/components/panel/PanelNav.tsx — NavLink() — DEĞİŞTİR 1 satır ekleme
<Link
  href={item.href}
  aria-current={isActive ? "page" : undefined}
  className={cn(/* … değişmedi … */)}
>
```

### h) Görsel değişiklik olmadan dokunma alanı büyütme

```css
/* src/index.css — EKLE
   Görünen boyutu değiştirmeden ≥40px dokunma hedefi.
   ::after görünmez, layout etkisi yok, sadece hit-test alanını büyütür. */
.hit-40 {
  position: relative;
}
.hit-40::after {
  content: "";
  position: absolute;
  inset: 50% auto auto 50%;
  width: max(100%, 40px);
  height: max(100%, 40px);
  transform: translate(-50%, -50%);
}
```

Uygulama noktaları: PanelShell.tsx bildirim butonu (16×16px), sidebar toggle (24×24px), Settings.tsx
"Çıkış yap" (83×15px), Courses.tsx "Müfredatı Gör" (109×15px) — her birine sadece `className`'e `hit-40`
eklenir, mevcut sınıflar dokunulmaz.

### i) Ölü CTA düzeltmesi

```tsx
// src/pages/panel/Courses.tsx — CoursesHero() ~L277-285

// önce — enrolled.length === 0 iken #courses-enrolled hiç render edilmiyor,
// buton hiçbir şey yapmıyor
<button onClick={() => scrollToId("courses-enrolled")}>
  Devam Et
</button>

// sonra — CoursesHero'ya enrolled sayısı prop olarak geçirilir (üst bileşende zaten hesaplı)
<button onClick={() => scrollToId(hasEnrolled ? "courses-enrolled" : "courses-available")}>
  {hasEnrolled ? "Devam Et" : "Kursları Keşfet"}
</button>
{/* CoursesHero çağrısı: <CoursesHero hasEnrolled={enrolled.length > 0} /> */}
```

### j) Kod bölme

Kapsam kararı: yalnızca `/panel/*` route'ları (19 sayfa) lazy yapılır. `Home`, `Invitation`, `Requests`
eager kalır — bunlar prerender/SEO'ya tabi ve zaten ilk yükte gerekli; panel sayfaları auth arkasında
olduğu için SEO endişesi yok.

```tsx
// src/App.tsx

// önce
import Dashboard from "@/pages/panel/Dashboard";
import Perks from "@/pages/panel/Perks";
// … 24 tane daha eager import

// sonra
import { lazy, Suspense } from "react";
import { PanelPageSkeleton } from "@/components/panel/Skeletons";

const Dashboard = lazy(() => import("@/pages/panel/Dashboard"));
const Perks     = lazy(() => import("@/pages/panel/Perks"));
// … kalan 24 route aynı desenle

// PanelRoutes içinde, <Switch> tek Suspense ile sarmalanır
// (route başına değil — geçişte art arda 19 fallback flaşı olmasın)
<Suspense fallback={<PanelPageSkeleton />}>
  <Switch>
    <Route path="/panel" component={() => <Dashboard userName={user.name.split(" ")[0]} />} />
    {/* … */}
  </Switch>
</Suspense>
```

Olası regresyon noktaları: (1) route değişiminde `Suspense` fallback'i F9'daki `PanelPageTransition` ile
çakışıp çift-flaş yaratabilir — ikisi birlikte QA edilmeli; (2) `PanelNav`'daki prefetch olmadığı için ilk
tıklamada kısa bir ağ gecikmesi hissedilir hale gelebilir — `rollup-plugin-visualizer` ile chunk
boyutları görüldükten sonra, sık kullanılan 3-4 route için `<Link onMouseEnter=…>` ile hover-prefetch
değerlendirilebilir (bu planın kapsamı dışında, ayrı öneri).

### k) Veri katmanı — TanStack Query

`QueryClientProvider` zaten `App.tsx`'te kurulu — altyapı hazır, sadece adoption eksik.

```ts
// src/hooks/useApiQuery.ts — YENİ DOSYA — 10 çağrı noktası için tek desen
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiUrl } from "@/lib/api";

export function useApiQuery<T>(key: string[], path: string) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(apiUrl(path), { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Veri alınamadı");
      return json;
    },
    staleTime: 60_000,               // 1dk — panel verisi sık değişmiyor
    placeholderData: keepPreviousData, // sayfa değişiminde flicker yok
  });
}
```

```tsx
// src/pages/panel/Courses.tsx — useEffect+fetch → useApiQuery

// önce: L346-368, elle useEffect + fetch + cancelled flag

// sonra
const { data, isLoading, error } = useApiQuery<{ courses: RawCourse[] }>(["courses"], "/api/courses");
const courses = (data?.courses ?? []).map(mapApiCourse);
```

---

## 3) Güvenli uygulama sırası

Her dalga bir öncekinin prod'da sorunsuz durduğu doğrulandıktan sonra başlar.

### Dalga 0 — doğrudan prod'a gidebilir
Deploy'suz / tek satırlık güvenlik ağı.
- `data-ux` kill-switch tanımı (henüz hiçbir yerde kullanılmıyor — ölü kod, riski yok)

### Dalga 1 — doğrudan prod'a gidebilir
Additive, görsel etkisiz.
- F1 token (2a) · F13 utility (2h) · F5 index.html+tr.ts · F9 (PanelPageTransition) · F12 (App.tsx lazy)

### Dalga 2 — staging'de doğrulanmalı
Görünür ama izole — sayfa başına ayrı commit.
- F1+F2+F3+F4 sayfa migrasyonu (19× ayrı) · F6 Skeletons · F8+F14 PanelShell/PanelNav · F10
  FadeIn/AnimatedHeading · F13 uygulama · F14 Courses ölü CTA

### Dalga 3 — feature-flag arkasında
Mimari — davranış değişimi, en yüksek risk.
- F7 TanStack Query (10× ayrı) · F11 HeroVideo (10× ayrı, poster pipeline önce hazır olmalı)

### QA kontrol noktaları (her dalgada zorunlu)

- **Türkçe karakter regresyonu** — "DİĞER KURSLAR", "KAYIT GEREKLİ", "İSTANBUL" ara; "ığdır"/"Iğdır"
  büyük/küçük harf dönüşümünü kontrol et. Araç: gözle + `grep -ri "İ\|ı" dist/assets/*.js` ile derlenmiş
  çıktıda bozulma taraması. Geçme kriteri: sıfır dotless-İ/dotted-I karışıklığı.
- **Kontrast** — axe DevTools, 360px / 768px / 1440px. Geçme kriteri: `color-contrast` ihlali = 0.
- **Klavye-only tur** — Tab ile tüm panel navigasyonu, route değişiminde odağın `BODY`'de kalmadığını
  doğrula. Geçme kriteri: her interaktif elemana Tab ile ulaşılır, focus-visible görünür.
- **Ekran okuyucu** — VoiceOver (Mac) veya NVDA (Windows) ile PanelNav + skip-link + `aria-current`
  anonsu. Geçme kriteri: aktif sayfa "current page" olarak anonslanır.
- **prefers-reduced-motion: reduce** — DevTools emülasyonu. Geçme kriteri: shimmer, hero split, video
  otomatik oynatma devre dışı; içerik anında görünür.
- **CPU 4× throttle + Slow 4G** — Lighthouse mobil profil. Geçme kriteri: TBT ≤200ms, LCP elementi VIDEO
  değil.
- **Route geçişi** — `main.scrollTop` kontrolü: yeni sayfaya git →
  `document.getElementById('panel-main').scrollTop === 0`; geri tuşuna bas → önceki pozisyon geri gelir.

---

## 4) Ölçüm

| Metrik | Şu anki (ölçülmüş) | Hedef | Nasıl ölçülür | Kim / ne zaman |
|---|---|---|---|---|
| Kontrast — axe ihlali | bilinmiyor (572 opaklık kullanımı, çoğu AA altı) | 0 ihlal · küçük metin ≥4.5:1 · ikincil ≥5.8:1 · non-text ≥3:1 | axe DevTools, her panel sayfası | QA · her Dalga 2 commit'inde |
| Lighthouse Performance (mobil, prod build) | ölçülmedi (dev: LCP 440ms, CLS 0) | ≥85 | Lighthouse CI, prod build, throttled | Dalga 1 sonu, sonra her dalga |
| Lighthouse Accessibility | ölçülmedi | ≥95 | Lighthouse CI | Dalga 2 sonu |
| Lighthouse Best Practices | ölçülmedi | ≥95 | Lighthouse CI | Dalga 1 sonu |
| LCP (p75, RUM) | dev: 440ms, eleman=VIDEO | ≤2.5s, eleman=poster/H1 | RUM (web-vitals) + prod throttle | Dalga 3 (F11) sonrası, sürekli |
| CLS (p75, RUM) | dev: 0 | ≤0.05 (prod'da korunmalı) | RUM | Her dalga sonrası regresyon kontrolü |
| INP | ölçülmedi | ≤200ms | RUM | Dalga 3 sonrası |
| TBT | dev: 1 longtask×67ms | ≤200ms (throttled prod) | Lighthouse, CPU 4× | Dalga 1 (F12) sonrası |
| Hero CTA etkileşilebilir olma süresi | ~1.2–1.6s (FadeIn delay 0.8-1.2 + AnimatedHeading ~1.13s) | ≤400ms | DevTools Performance, buton disabled→enabled zaman damgası | Dalga 2 (F10) sonrası |
| Route geçişi algılanan gecikme | ~560ms | ≤200ms | Performance panel, route tıklama→yeni içerik paint | Dalga 1 (F9) sonrası |
| İlk yük JS (route-split sonrası) | ölçülmedi (26 eager import, tek bundle) | ≤250KB gzip | rollup-plugin-visualizer, önce/sonra | Dalga 1 (F12) öncesi/sonrası |
| Görev tamamlama — "kursa kayıt ol" | baseline yok | süre −%20, hata/geri dönüş −%30 | Analytics event zaman damgası | Dalga 2/3 sonrası, 2 haftalık pencere |
| `route_change_scroll_not_top` olayı | her navigasyonda oluşuyor (F8) | 0 | Custom event: `main.scrollTop>0` && yeni route mount | Dalga 2 (F8) sonrası |
| Skeleton→içerik geçişinde ölçülen shift | ölçülmedi (skeleton yok) | 0 (layout shift skoru) | PerformanceObserver (layout-shift), skeleton unmount anı | Dalga 2 (F6) sonrası |

---

## Kapsam ve kurallar

- Toptan refactor veya tasarım sistemi değişimi yok — her şey additive başlıyor.
- `--radius:0rem`, mono uppercase etiketler, Fraunces display, bone/ink paleti **değişmiyor**.
- shadcn HSL seti ile ham `--ink`/`--bone` paralel yaşamaya devam ediyor (F15 — bilinçli karar).
- Call-site migrasyonu sayfa sayfa, ayrı commit'lerle — hiçbir dosyada iki bulgu aynı commit'te
  çakışmıyor (bkz. Grup sütunu).
- `%0` yüzde biçimi Türkçe için doğru — dokunulmuyor.
- Erişilebilirlikte geri adım yok: focus-visible, aria-current, role="status"/"alert", reduced-motion,
  ≥40px hedef, pinch-zoom serbest — hepsi bu planla birlikte *iyileşiyor*, hiçbiri bozulmuyor.
- 3 madde açıkça ⚠️ olarak işaretlendi (Tailwind v4 çift-token davranışı, wouter popstate senkronu,
  poster üretim akışı) — uygulanmadan önce küçük bir prototiple doğrulanmalı.

*Rapor: 1.0 · Panel UX/a11y/perf kademeli iyileştirme planı · 2026-07-25*
