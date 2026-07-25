# Inner-Hub — Durum Özeti (Nerede Kaldık)

*Claude agent — 2026-07-25 gece, HEAD `2152d09`.*

Bu dosya "nerede kaldık" sorusuna hızlı cevap için. Detaylı API haritası / panel yüzey durumu için [inner-hub-live-panel-handoff-2026-07-25.md](./inner-hub-live-panel-handoff-2026-07-25.md), Cursor↔Claude track ayrımı için [inner-hub-parallel-tracks-2026-07-25.md](./inner-hub-parallel-tracks-2026-07-25.md).

## 1. Deploy durumu

**Canlı, güncel.** `main` → `origin/main` pushlandı → Hostinger auto-deploy (`https://inner.digital`).

Son 2 push (bu gece):
1. `fb19256` — Cursor'ın geniş panel sadeleştirme dalgası + yeni homepage opening sequence (`HomeOpening.tsx`, `WhatsNextCinematic.tsx`) + vendored GSAP + panel onboarding turu (`PanelOnboarding.tsx`) + org-logo zenginleştirme (`orgLogo.ts`) — hepsi tek commit'te toplanıp typecheck+build doğrulanarak pushlandı.
2. `2152d09` — Performans: `vite.config.ts`'e `manualChunks` eklendi, ana bundle 698KB (225KB gzip) → 230KB'a düştü, vendor kod (`react-vendor`, `motion-vendor`, `ui-vendor`, `charts-vendor`) ayrı cache'lenebilir chunk'lara bölündü.

Push öncesi her seferinde `pnpm run typecheck` + `pnpm --filter @workspace/inner-hub run build` temiz geçti.

## 2. Şu an aktif — Cursor'ın elinde (dokunulmadı)

Cursor sürekli çalışıyor, dosyalar sık değişiyor. Bu anki (`git status`) açık WIP:
- `components/FloatingNavbar.tsx`
- `components/HomeOpening.tsx`
- `components/Lockup.tsx`
- `components/SignatureMark.tsx`
- `components/panel/PanelLogin.tsx`
- `components/panel/PanelNav.tsx`
- `components/panel/PanelShell.tsx`
- `pages/Home.tsx`
- `pages/Invitation.tsx`

Yakın zamanda Cursor'ın kuyruğunda görülen işler: `/panel/capital`'ı iyileştirme, "tüm sayfalardaki bileşenler için analiz yapıp adım adım uygula" (geniş sadeleştirme dalgası), logo güncellemesi. Bu dalga panelin neredeyse tamamına dokunuyor (Analytics, Applications, Capital, Chat, Courses, Dashboard, Events, InnerApi, InnerId, Match, Members, Perks, Profile, Pulse, Settings, Signal, Vault hepsi bu gece en az bir kez dirty oldu).

**Kural:** yukarıdaki dosyalara ve Cursor'ın aktif olduğu panel sayfalarına dokunmuyorum; sadece soğuk/bağımsız alanlarda çalışıyorum.

## 3. Bu gece Claude tarafından tamamlanan işler

- **Track B (Analytics + InnerApi)** — canlı veri, mock kaldırıldı, uçtan uca doğrulandı.
- **i18n bug'ları** — CSS `uppercase` + `html[lang="tr"]` kombinasyonu İngilizce teknik string'leri bozuyordu (`inner.digital` → `İNNER.DİGİTAL`, `View` → `Vİew`). Düzeltilen yerler: FAQ destek e-postası, panel login "Bize ulaş" butonu, Match hero CTA'ları ("View Matches"/"Set Preferences"). Aynı desen `Capital.tsx`'te de var ("View Pipeline"/"View SPVs") ama o dosya Cursor'ın aktif alanı olduğu için dokunulmadı — bekliyor.
- **PanelNav aktif-durum bug'ı bulundu, dokümante edildi (düzeltilmedi):** `location.startsWith(item.href)` yüzünden `/panel/membership` sayfasında hem "Katılımcılar" hem "Üyelik" aynı anda aktif görünüyor (`/panel/members` string olarak `/panel/membership`'in prefix'i). Tek satır fix önerisi dokümanda (`inner-hub-live-panel-handoff-2026-07-25.md` §6).
- **`/u/:handle` "boş sayfa" raporu düzeltildi:** ilk raporum yanlış alarmdı (screenshot'ı çok erken almışım, Vite cold-compile + FadeIn animasyon gecikmesi). Kod sorunsuz, retraction dokümana işlendi.
- **Performans:** bundle splitting (yukarıda §1).
- **Dead code temizliği:** kullanılmayan `DemoPreviewBanner.tsx` silindi.

## 4. Bekleyen / karar bekleyen konular

### 4.1 Panel arka planı + dark theme (kullanıcı sorusu, henüz karar verilmedi)

Kullanıcı sordu: *"Paneli footer'ın backgroundu gibi siyah mı yapsak, dark theme yapalım mı?"*

Claude'un önerisi: **şimdi değil.** İki sebep:
1. Mevcut açık "bone" arka plan + ince `--ink` border sistemi bu oturumda özenle kurulmuş tutarlı bir tasarım dili; siyaha çevirmek onu baştan bozar.
2. Cursor şu an panelin neredeyse tamamında büyük bir sadeleştirme geçişi yapıyor (§2) — bu hareketli hedefin üzerine dark theme projesi bindirmek hem çakışma riski hem de onların işi bitince yeniden yapma riski taşıyor.

Kullanıcı "evet sen başla" dedi ama hemen ardından deploy+performans işini öne aldı (bu doküman o kesintinin ürünü). **Dark theme henüz başlamadı.** Cursor'ın dalgası oturunca:
- Küçük versiyon: panel arka planını footer'ın siyahına çevirmek (tüm `--ink`/`--bone` kullanımını tersine çevirmek gerekir, mekanik ama geniş kapsamlı).
- Büyük versiyon: gerçek dark/light toggle — her semantic token'ın (`--ink-strong/body/muted/subtle/faint/nontext`, `--success-ink`, `--error-ink`) karanlık karşılığını tanımlamak, tema tercihini localStorage'da tutmak, ~20 panel sayfasında kontrastı doğrulamak. Ayrı, planlı bir proje olarak ele alınmalı.

### 4.2 Home.tsx / gsap eager-loading (performans, bulundu ama düzeltilmedi)

`Home.tsx` App.tsx'te eager import (SEO/prerender için gerekli), bu yüzden gsap + `HomeOpening`/`WhatsNextCinematic` her rotada (panel/login dahil) indiriliyor — kullanıcı hiç anasayfayı görmese bile. Gerçek fix: bu iki bileşeni `React.lazy` ile sarmak (SSR/prerender'ı bozmadan, çünkü SEO içeriği text bazlı, animasyon değil). `Home.tsx` Cursor'ın en sık dokunduğu dosya olduğu için bu değişiklik yapılmadı — dalga oturunca ele alınmalı.

### 4.3 `Capital.tsx` i18n bug'ı

"View Pipeline" / "View SPVs" aynı `uppercase` + `lang="tr"` sorunundan etkileniyor. Cursor `/panel/capital`'ı zaten iyileştirecek — o sırada ya da sonrasında `lang="en"` sarmalaması eklenmeli.

## 5. Sonraki adım için öneri

1. Cursor'ın mevcut dalgasının oturmasını bekle (dosyalar art arda birkaç `git status` çağrısında değişmemeye başladığında).
2. Sonra sırayla: (a) `Capital.tsx` i18n fix, (b) `Home.tsx` gsap lazy-load, (c) dark theme kararını kullanıcıyla netleştirip kapsamı seç (siyah panel mi, tam toggle mi).
3. Her adımda: typecheck + build doğrula, sadece kendi dosyalarını stage et, `git pull --rebase --autostash origin main`, push, Türkçe özet.
