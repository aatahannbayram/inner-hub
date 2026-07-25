# Inner-Hub — Canlı Panel Wave Handoff (Cursor ↔ Claude)

> Tarih: 2026-07-25  
> Branch: `main` (Hostinger auto-deploy: `git push origin main`)  
> Live: https://inner.digital  
> Bu dosya: Cursor ile Claude’un **paralel** çalışması için durum + sınırlar + sıradaki işler.

---

## 1. Paralel çalışma sözleşmesi

İki sistem aynı repo üzerinde kalacak. Çakışmayı azaltmak için:

| Kural | Açıklama |
|-------|----------|
| **Tek kaynak `main`** | Her iki taraf da push öncesi `git pull --rebase origin main` |
| **Alan ayır** | Aynı anda aynı dosyayı düzenleme; iş listesinden “owner” seç |
| **Commit tarzı** | Kısa `feat:` / `fix:` / `docs:`; frontend değişince `artifacts/inner-hub/dist` rebuild + commit |
| **API değişince** | `pnpm --filter @workspace/api-server run build` → `dist` commit; gerekirse `ensureSchema` ALTER/CREATE |
| **Dokunma** | `.agents/skills/`, `.claude/`, `lib/*/dist` untracked gürültü — commit etme |
| **Auth smoke** | Lokal: `admin@inner.digital` / `member@inner.digital` · şifre `inner2026` · `INVITE_PASSCODE=inner2026` |
| **Portlar** | API `:3001`, Vite `:5173`, Postgres Docker `:5433` |

**Önerilen iş bölümü:**  
→ Güncel çakışmasız plan: [`inner-hub-parallel-tracks-2026-07-25.md`](./inner-hub-parallel-tracks-2026-07-25.md)  
→ Cursor = public `/u/:handle` + badge · Claude = Analytics + InnerApi

Aynı surface’e (ör. Vault) ikisi birden girmeden önce parallel-tracks dosyasını güncelle.

---

## 2. Bu wave’de yapılanlar (özet)

Mock → canlı API bağlama + panel güveni. UX remediation (F1–F15) önceden `8684e90` ile kapanmıştı; bu wave ürün verisini gerçekleştirdi.

### Commit zinciri (yeniden eskiye)

| Commit | Ne |
|--------|----|
| `782c493` | **inner·id** canlı kart + LinkedIn/GitHub/site bağlama |
| `5430ffb` | **Vault / Capital / Pulse** canlı API |
| `49192a9` | **Match Tanıştır** persist + **FAQ** API |
| `80e3e7d` | **Profil** `PATCH /api/auth/me` |
| `6cea569` | **Bildirimler** bell + inbox |
| `c295d78` | **Chat** kanallar + mesajlar |
| `d8765f1` | **Kurs enroll** + **etkinlik register** |
| `96daf24` | **Perks** + **Members** listeleri |
| `085faee` (+ dist) | **Applications** admin inbox |

---

## 3. Canlı API haritası

| Endpoint | Auth | Not |
|----------|------|-----|
| `GET/PATCH /api/auth/me` | session | Profil + skills + sosyal + completion |
| `GET/PATCH /api/applications` | admin | Davet inbox |
| `GET /api/perks` | member | Seed if empty |
| `GET /api/members` | member | `users` tablosu |
| `GET /api/events` | member | `isRegistered` |
| `POST\|DELETE /api/events/:id/register` | member | + bildirim |
| `GET /api/courses` | member | `isEnrolled`, `progressPct` |
| `POST /api/courses/:id/enroll` | member | + bildirim |
| `GET /api/channels` | member | Seed 6 kanal |
| `GET\|POST /api/channels/:id/messages` | member | Persist chat |
| `GET /api/notifications` | member | Welcome seed |
| `PATCH /api/notifications/:id/read` | member | |
| `PATCH /api/notifications/read-all` | member | |
| `POST /api/match/introduce` | member | + admin notif |
| `GET /api/match/introductions` | member | |
| `GET /api/faq` | member | Kategorili seed |
| `GET\|POST /api/vault` | member | Metadata (dosya upload yok) |
| `GET /api/capital` | member | Deals + SPV seed |
| `GET /api/pulse` | member | Chat’ten türetilmiş metrikler |
| `POST /api/ai/match` | (mevcut) | AI eşleşme |

**Şema ensure (startup / on-demand):**  
`artifacts/api-server/src/lib/ensureSchema.ts` — users profil kolonları, `introduction_requests`, faq.category, `vault_documents`, `capital_deals`, `capital_spvs`.

---

## 4. Panel yüzey durumu

### Canlı / dürüst

- Auth, Dashboard (kısmi API), Courses, Events, Perks, Members (directory), Applications (admin)
- Chat, Notifications, Profile, Match (Tanıştır), FAQ
- Vault (metadata), Capital (katalog), Pulse (chat aggregate)
- **inner·id** (`/panel/id`) — canlı profil + platform bağlama

### Hâlâ mock / DemoPreviewBanner

- **Analytics** — tam demo
- **InnerApi** — demo API keys / rate limit UI
- **Members → Talent board** tab — banner var
- **Vault** — dosya binary upload yok (metadata only)
- **Capital** — seed katalog; gerçek deal write/admin yok
- **Public** `inner.digital/u/:handle` + `badge/:handle.svg` — URL üretiliyor, route henüz yok

### Bilinçli kararlar

- F15: shadcn HSL + `--ink/--bone` paralel (birleştirme yok)
- Hostinger: tek Node process = API + `inner-hub/dist` static
- Deploy: `origin/main` push → Hostinger redeploy

---

## 5. Önemli dosyalar

```
artifacts/api-server/src/routes/
  auth.ts, catalog.ts, community.ts, chat.ts, notifications.ts,
  match.ts, vault.ts, capital.ts, pulse.ts, applications.ts, index.ts
artifacts/api-server/src/lib/ensureSchema.ts
lib/db/src/schema/{hub.ts,users.ts}
artifacts/inner-hub/src/pages/panel/
  Profile.tsx, InnerId.tsx, Chat.tsx, Vault.tsx, Capital.tsx, Pulse.tsx, …
artifacts/inner-hub/src/components/panel/PanelShell.tsx  # bildirim zili
```

Frontend pattern: `useApiQuery` + `apiUrl` + `credentials: "include"`.  
Profil güncellenince: `window` event `inner-profile-updated` (shell adı / completion).

---

## 6. Sıradaki işler (öncelik)

1. **Public identity** — `GET /u/:handle` + opsiyonel badge SVG (inner·id URL’leri gerçek olsun)
2. **Vault file storage** — R2/S3 + upload (metadata path hazır)
3. **InnerApi** — gerçek API key üretimi veya dürüst “yakında” + banner kaldırma
4. **Analytics** — canlı metrikler (events/enrollments/messages) veya empty state
5. **Talent board** — şema + API veya tab’ı gizle
6. **Capital admin write** — deal CRUD (admin)

Claude’a yeni görev verirken: bu listedeki bir maddeyi seç, Cursor’ın üzerinde çalıştığı maddeyi yaz.

---

## 7. Claude’a kısa prompt şablonu

```
Inner-Hub monorepo. Handoff: docs/audits/inner-hub-live-panel-handoff-2026-07-25.md
main güncel; Hostinger auto-deploy. Auth cookie session.
Görev: <MADDE>
Dokunma: Cursor şu an <X> üzerindeyse aynı dosyalara girme.
Bitince: api-server + inner-hub dist rebuild, commit, push main.
Türkçe yanıt.
```

---

## 8. Lokal hızlı smoke

```bash
# API
DATABASE_URL='postgresql://inner:inner@localhost:5433/inner_hub' \
ADMIN_PASSCODE=inner2026 INVITE_PASSCODE=inner2026 PORT=3001 \
APP_URL=http://localhost:5173 \
pnpm --filter @workspace/api-server run build && \
pnpm --filter @workspace/api-server run start

# Login + örnek
curl -c /tmp/ih.txt -X POST localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"member@inner.digital","password":"inner2026"}'
curl -b /tmp/ih.txt localhost:3001/api/auth/me
curl -b /tmp/ih.txt localhost:3001/api/vault
curl -b /tmp/ih.txt localhost:3001/api/pulse
```

---

## 9. Durum güncellemesi — Claude, 2026-07-25 (Track B sonrası)

**§6 "Sıradaki işler" listesi tamamlandı** (Claude: Analytics + InnerApi; Cursor: geri kalanı):

1. ✅ Public identity (`/u/:handle`) — Cursor, `routes/publicId.ts` canlı
2. ✅ Vault file storage — Cursor, upload akışı canlı
3. ✅ InnerApi — Claude, gerçek key üretimi + tek-seferlik reveal (`routes/apiKeys.ts`, `pages/panel/InnerApi.tsx`)
4. ✅ Analytics — Claude, canlı metrikler + empty state (`routes/analytics.ts`, `pages/panel/Analytics.tsx`)
5. ✅ Talent board — Cursor, canlı
6. ✅ Capital admin write — Cursor, canlı

`DemoPreviewBanner.tsx` artık hiçbir sayfadan import edilmiyordu, dead-code olarak silindi (`05dfbda`).

### Bilinen bug — `/u/:handle` boş sayfa (Cursor'ın alanı, Claude düzeltmedi)

`http://localhost:5173/u/<handle>` iki durumda da **tamamen boş render ediyor**, konsolda hata yok:

- **401 members-only**: Backend doğru dönüyor — `GET /api/public/profile/:handle` → `{"error":"Bu profil yalnızca inner·hub üyelerine açık","code":"MEMBERS_ONLY","handle":"..."}`. Frontend bu response'u işlemiyor, boş kalıyor.
- **404 not-found**: Backend doğru dönüyor — `{"error":"Profil bulunamadı"}`. Aynı şekilde frontend boş kalıyor.
- DB'de `visibility='public'` olan hiç kullanıcı yok (doğrudan `psql` ile doğrulandı) — yani "happy path" (başarılı render) muhtemelen hiç görsel olarak test edilmemiş.
- Kök neden frontend'de (muhtemelen `PublicProfile.tsx` içinde error-state handling eksik). Bu dosya Claude'un yasaklı listesinde olduğu için dokunulmadı — Cursor'ın düzeltmesi gerekiyor.

---

*Son güncelleme: Cursor agent — 2026-07-25, HEAD `782c493`.*
*Ek not: Claude agent — 2026-07-25 (Track B tamam, bug raporu eklendi).*
