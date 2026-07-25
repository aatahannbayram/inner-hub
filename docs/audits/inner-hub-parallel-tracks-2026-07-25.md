# Paralel Sprint Planı — Cursor (biz) × Claude

> Tarih: 2026-07-25 · HEAD referansı: `7d17bb4`+  
> Amaç: İki agent aynı `main` üzerinde çalışsın, **dosya/alan çakışması olmasın**.  
> Bağlam: `docs/audits/inner-hub-live-panel-handoff-2026-07-25.md`

---

## 0. Sert kurallar (ikisi için)

1. Push öncesi: `git pull --rebase origin main`
2. Aynı dosyaya **bilinçli olarak** birlikte girilmez (aşağıdaki sahiplik tablosu)
3. Frontend değişince: `pnpm --filter @workspace/inner-hub run build` → `artifacts/inner-hub/dist` commit
4. API değişince: `pnpm --filter @workspace/api-server run build` → `artifacts/api-server/dist` commit
5. Commit etme: `.agents/`, `.claude/`, `lib/*/dist`, `skills-lock.json`
6. Marka: ink/bone/green, radius 0, Fraunces; purple/glow yok
7. Türkçe UI metinleri; `lang="en"` yalnızca marka/İngilizce özel isimler
8. Bitince push `origin main` (Hostinger auto-deploy)

### Ortak birleşme noktası (dikkat)

| Dosya | Nasıl paylaşılır |
|-------|------------------|
| `artifacts/api-server/src/routes/index.ts` | Her taraf **yalnızca kendi router satırını** ekler. Push öncesi rebase. Tüm dosyayı yeniden yazma. |
| `artifacts/inner-hub/dist/**` | Her commit kendi build’ini getirir; rebase’te dist çakışırsa **yeniden build** et, elle merge etme. |

---

## 1. Görev bölüşümü (çakışmayan)

| | **Track A — Cursor (biz)** | **Track B — Claude** |
|--|---------------------------|----------------------|
| **Tema** | Public kimlik yüzü | Panel’de kalan demo güven kırıkları |
| **Hedef** | `inner.digital/u/:handle` + badge SVG gerçek olsun | Analytics + InnerApi mock’u kaldırılsın / dürüst live olsun |
| **Süre tahmini** | M | M |
| **Birbirine etki** | InnerId’deki URL’ler çalışır hale gelir | Panel “demo” algısı düşer; public identity’ye dokunmaz |

### Track A — Cursor sahipliği (Claude DOKUNMAZ)

**Yapılacak**
1. Public profil sayfası: `GET` kullanıcı `handle` ile (visibility ≠ private; members-only için login opsiyonel veya sadece public)
2. Route: `/u/:handle` (wouter, panel dışı, SEO-friendly)
3. Badge: `GET /badge/:handle.svg` (basit SVG, verified + isim/handle)
4. Visibility `private` → 404; `members` → auth yoksa “üyeler için” soft gate veya 401 sayfası
5. InnerId’deki “Görüntüle” linki zaten `https://inner.digital/u/{handle}` — route gelince çalışır

**İzinli dosyalar**
- `artifacts/api-server/src/routes/publicId.ts` (**yeni**)
- `artifacts/api-server/src/routes/index.ts` → sadece `publicId` mount
- `artifacts/inner-hub/src/pages/PublicProfile.tsx` (**yeni**) veya `pages/u/Handle.tsx`
- `artifacts/inner-hub/src/App.tsx` → sadece `/u/:handle` route ekle (panel route’larına dokunma)
- Gerekirse `artifacts/inner-hub/src/pages/panel/InnerId.tsx` → minör link/404 notu (tercihen dokunma)

**Yasak (Claude’un alanı)**
- `Analytics.tsx`, `InnerApi.tsx`, `Members.tsx`
- `Vault.tsx`, `vault.ts`, `Capital.tsx`, `capital.ts`, `Pulse.tsx`
- `Chat.tsx`, `Profile.tsx`, `PanelShell.tsx`

**Done when**
- [ ] `https://inner.digital/u/{geçerli-handle}` gerçek profil gösterir
- [ ] `https://inner.digital/badge/{handle}.svg` SVG döner
- [ ] private handle 404
- [ ] dist + api dist commit + push

---

### Track B — Claude sahipliği (Cursor DOKUNMAZ)

**Yapılacak — iki alt paket, sırayla aynı track içinde**

#### B1 — Analytics canlı (önce)
1. `DemoPreviewBanner` kaldır
2. `GET /api/analytics` (auth): gerçek sayaçlar — örnek:
   - üye sayısı (`users`)
   - bu hafta mesaj (`messages` + `created_at`)
   - etkinlik kayıtları (`event_registrations`)
   - kurs enroll (`enrollments`)
   - başvuru pending (admin ise `invitation_requests` / applications)
3. UI: mevcut Analytics layout’unu koru; mock chart verisini API’den gelen sayılarla doldur veya dürüst empty (“henüz veri yok”)
4. Sahte büyüme eğrileri uydurma; yoksa empty state

#### B2 — InnerApi dürüstleştir (B1 bitince)
1. `DemoPreviewBanner` kaldır
2. Ya: `api_keys` tablosu + `GET/POST /api/api-keys` (key hash sakla, plaintext bir kez göster)  
   Ya: UI’da “API anahtarı yakında — şimdilik partner erişimi manuel” + sahte key/rate UI’sini kaldır
3. Tercih: **gerçek key üretimi** (basit `ih_live_…` + sha256 hash) — R2/Vault’a girme

**İzinli dosyalar**
- `artifacts/inner-hub/src/pages/panel/Analytics.tsx`
- `artifacts/inner-hub/src/pages/panel/InnerApi.tsx`
- `artifacts/api-server/src/routes/analytics.ts` (**yeni**)
- `artifacts/api-server/src/routes/apiKeys.ts` (**yeni**, B2)
- `artifacts/api-server/src/lib/ensureSchema.ts` → sadece `api_keys` CREATE TABLE IF NOT EXISTS
- `lib/db/src/schema/hub.ts` → sadece `api_keys` table tanımı
- `artifacts/api-server/src/routes/index.ts` → sadece analytics + apiKeys mount satırları
- `artifacts/inner-hub/dist/**` (kendi build’in)
- `artifacts/api-server/dist/**` (kendi build’in)

**Yasak (Cursor’un alanı)**
- `App.tsx`
- `PublicProfile` / `/u/` sayfaları
- `publicId.ts`
- `InnerId.tsx`, `Profile.tsx`, `Vault*`, `Capital*`, `Pulse*`, `Chat*`, `Members.tsx`
- PanelNav (route zaten var)

**Done when**
- [ ] `/panel/analytics` mock banner yok; sayılar API’den
- [ ] `/panel/api` ya gerçek key ya dürüst “yakında” (sahte key yok)
- [ ] dist + api dist commit + push

---

## 2. Bilinçli olarak ERTELENEN (ikisi de şimdi dokunmasın)

Bu sprint’te **çakışma riski yüksek / ortak bağımlılık**:

| Konu | Neden sonra |
|------|-------------|
| Vault R2 dosya upload | env + Vault.tsx + vault.ts — tek owner sprint ister |
| Members Talent board | büyük Members.tsx; directory zaten live |
| Capital admin write | capital seed’i bozmamak için |
| Settings bildirim tercihleri | PanelShell/notif ile kenetlenir |

Sonraki sprint’te tek owner seçilerek açılır.

---

## 3. Claude’a yapıştırılacak DETAYLI PROMPT

Aşağıdaki bloğu Claude’a **aynen** ver:

---

```
# Rol
Sen Inner-Hub monorepo’da çalışan bir coding agentsın (Claude Code).
Kardeş agent: Cursor — aynı anda `main` üzerinde paralel çalışıyor.
Senin track’in: **Track B — Analytics + InnerApi**. Cursor Track A’da public `/u/:handle` + badge yapıyor; onun dosyalarına DOKUNMA.

# Okuma (zorunlu, sırayla)
1. docs/audits/inner-hub-live-panel-handoff-2026-07-25.md
2. docs/audits/inner-hub-parallel-tracks-2026-07-25.md  ← bu plan

# Repo gerçekleri
- pnpm monorepo; API: artifacts/api-server ; UI: artifacts/inner-hub
- Deploy: push origin/main → Hostinger Express (API + static dist)
- Auth: cookie session `inner_sid`; requireAuth
- Lokal DB: postgresql://inner:inner@localhost:5433/inner_hub
- Test user: member@inner.digital / inner2026 ; admin@inner.digital / inner2026
- UI: ink/bone/green, radius 0, Fraunces; DemoPreviewBanner’ı kaldırdığın yerde mock veriyi de kaldır
- Ensure pattern: artifacts/api-server/src/lib/ensureSchema.ts (CREATE/ALTER IF NOT EXISTS)
- Frontend data: useApiQuery + apiUrl + credentials:"include"

# Senin görevlerin (sırayla)

## B1 — Analytics live
- Dosya: artifacts/inner-hub/src/pages/panel/Analytics.tsx
- Yeni API: GET /api/analytics (requireAuth) → gerçek aggregate’ler:
  - membersCount
  - messagesThisWeek
  - eventRegistrationsTotal (veya thisWeek)
  - courseEnrollmentsTotal
  - applicationsPending (sadece admin; member’da 0 veya omit)
- DemoPreviewBanner kaldır
- Mock grafik/sayı uydurma; veri yoksa dürüst empty state (mono tipografi)
- Mevcut sayfa iskeletini bozma; markayı koru

## B2 — InnerApi dürüstleştir (B1 commit’ten sonra)
- Dosya: artifacts/inner-hub/src/pages/panel/InnerApi.tsx
- Tercih A (önerilen): api_keys tablosu
  - columns: id, user_id, name, key_prefix, key_hash, created_at, last_used_at
  - POST /api/api-keys → { name } → bir kez plaintext key döndür (ih_live_…)
  - GET /api/api-keys → liste (plaintext yok, prefix + tarih)
  - DELETE /api/api-keys/:id → kendi key’ini sil
  - ensureSchema + drizzle schema hub.ts
- Tercih B: sahte key UI’yi sil; “Partner API erişimi yakında — destek@inner.digital” empty
- DemoPreviewBanner kaldır
- Rate limit / fake charts varsa ya API’den ya kaldır

# Dosya sahipliği — SERT
İZİNLİ:
- Analytics.tsx, InnerApi.tsx
- routes/analytics.ts, routes/apiKeys.ts (yeni)
- ensureSchema.ts (yalnızca api_keys)
- lib/db/src/schema/hub.ts (yalnızca api_keys table)
- routes/index.ts (yalnızca iki satır mount; dosyayı rewrite etme)
- ilgili dist çıktıları

YASAK (Cursor’ın alanı — dokunursan conflict):
- App.tsx
- herhangi bir PublicProfile /u/ sayfası
- routes/publicId.ts
- InnerId.tsx, Profile.tsx, Vault*, Capital*, Pulse*, Chat*, Members.tsx, PanelShell.tsx, PanelNav.tsx

# Git protokolü
1. git pull --rebase origin main
2. İşini yap
3. API: pnpm --filter @workspace/api-server run build
4. UI: pnpm --filter @workspace/inner-hub run build
5. Commit mesajları:
   - feat: wire Analytics panel to live aggregate API
   - feat: replace InnerApi mock with real API keys (veya honest empty)
6. git pull --rebase origin main  (dist conflict → yeniden build)
7. git push origin HEAD
8. Türkçe kısa özet: ne yaptın, hangi endpoint’ler, smoke nasıl

# Smoke
curl login member → GET /api/analytics
admin ile applicationsPending > 0 olabilir
B2: POST /api/api-keys {"name":"dev"} → plaintext bir kez; GET liste prefix gösterir

# Yapma
- Vault R2, Talent board, Capital write, public /u/:handle (Cursor)
- Purple/glow, card spam, gereksiz refactor
- .env’e secret commit

Başla B1 ile. B1 push olmadan B2’ye geçme.
```

---

## 4. Cursor (biz) için kısa self-brief

Biz Track A’dayız:

1. `publicId.ts`: `GET /api/public/profile/:handle`, `GET /badge/:handle.svg` (Express’te SVG `Content-Type: image/svg+xml`; Hostinger static’ten önce API route olmalı — `/badge` API altında da olabilir: `GET /api/badge/:handle.svg` ve InnerId linkini ona çevirmek daha güvenli)
2. Not: Static SPA catch-all `/badge`’i yutabilir → **badge’i `/api/badge/:handle.svg` yap**, InnerId embed URL’lerini buna güncelle (küçük InnerId dokunuşu Track A’da OK)
3. Public page `/u/:handle` → API’den profil çek (public endpoint, auth opsiyonel)
4. Claude’un Analytics/InnerApi’sine dokunma

**Öneri — badge path (çakışmasız):**  
Cursor embed’i `https://inner.digital/api/badge/{handle}.svg` yaparsa static SPA ile savaşılmaz. InnerId.tsx Track A’da güncellenir.

---

## 5. Senkron checklist

| An | Cursor | Claude |
|----|--------|--------|
| Start | Track A branchless on main | Prompt’u yapıştır, B1 |
| Mid | publicId + /u page | analytics API + UI |
| Merge risk | index.ts + dist | index.ts + dist → rebase |
| End | push A | push B1, sonra B2 |
| Verify | /u/xxx + badge SVG | /panel/analytics + /panel/api |

Biri takılırsa diğerinin dosyalarına “yardım” için girme; handoff notu bırak.

---

*Bu dosya paralel sprint’in tek kaynak planıdır. Değişirse her iki agent’a da haber ver.*
