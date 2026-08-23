# inner·hub — Kurs videosu (Mux) entegrasyonu, durum

*Claude agent — 2026-07-27.*

## 1. Ne yapıldı (kod tarafı, tamamlandı)

- `lib/db/src/schema/hub.ts` → `lessonsTable.durationSeconds` eklendi.
- `artifacts/api-server/src/lib/ensureSchema.ts` → `ensureCourseVideoColumns()` (idempotent `ALTER TABLE`).
- `artifacts/api-server/src/routes/catalog.ts`:
  - `GET /api/courses` → nested `modules[].lessons[]`, kullanıcı bazlı tamamlanma/kilit durumu.
  - `GET /api/admin/courses`, `POST /api/courses`, `PATCH /api/courses/:id`, `POST /api/courses/:id/modules`, `POST /api/modules/:id/lessons` (admin-gated CRUD).
  - `POST /api/lessons/:id/complete` (auth-gated, enrollment doğrulamalı).
  - `POST /api/mux/uploads`, `GET /api/mux/uploads/:id` (admin-gated Mux direct-upload proxy/poll).
- `artifacts/inner-hub/src/pages/panel/CoursesAdmin.tsx` (yeni) — admin authoring UI: video upload widget, modül/ders ekleme formları, publish toggle.
- `artifacts/inner-hub/src/components/panel/LessonPlayerModal.tsx` (yeni) — `@mux/mux-player-react` ile oynatma + "tamamlandı" işaretleme.
- `artifacts/inner-hub/src/pages/panel/Courses.tsx` — gerçek API modülleriyle çalışacak şekilde güncellendi, `LessonRow` tıklanabilir.
- `PanelNav.tsx` + `App.tsx` → `/panel/courses/admin` route + nav item.
- i18n anahtarları (`courses.*`, `nav.coursesAdmin`) eklendi.
- `pnpm run typecheck` + `pnpm --filter @workspace/inner-hub run build` temiz geçti, prod'a push edildi.

**Kod tarafı bitti, çalışıyor.** Kalan tek şey: Mux API kimlik bilgilerinin canlıda doğru şekilde ayarlanması.

## 2. Deploy mimarisi (önemli düzeltme)

Önceki varsayımım (Railway'de backend, Hostinger'da sadece static frontend) **yanlıştı**. Gerçek mimari:

- **Hostinger'da tek Node.js süreci** hem API'yi (`/api/*`) hem de derlenmiş `inner-hub/dist` SPA'sını sunuyor (`artifacts/api-server/src/app.ts` → `express.static(frontendDist)`).
- **Railway kullanılmıyor** — repoda hiçbir Railway config yok.
- Env değişkenleri → Hostinger hPanel → Web Siteleri → inner.digital → **Ortam değişkenleri**.
- Kod değişikliği (git push) → Hostinger otomatik dağıtım tetikleniyor (Otomatik Dağıtım açık).
- **Sadece env değişkeni değişince otomatik dağıtım tetiklenmiyor** — elle restart gerekiyor: Kontrol Paneli → site adının yanındaki yeşil **"Çalışıyor"** dropdown → **"Yeniden başlat"**.

## 3. Mux hesap yapısı

- Organizasyon: **Inner** (`1mss8b`)
- Environment: **inner-hub-production** (`0kvd4u`)
- Access Tokens sayfası: Settings → Access Tokens (Data/Analytics sayfasındaki "Environment key" ile **karıştırılmamalı** — o ayrı bir şey, video upload için işe yaramıyor).
- Token izni: **Mux Video → Read + Write**.

## 4. Şu anki blocker

`MUX_TOKEN_SECRET` Hostinger'a **hiç kaydedilmedi** (iki kez denendi, ikisinde de sessizce kaybedildi — sebep belirsiz, muhtemelen kullanıcı kaydet'e basmadan sayfadan ayrıldı). `MUX_TOKEN_ID` de artık iptal edilmiş eski bir token'a ait, geçersiz.

Prod test sonucu (restart sonrası bile):
```
POST /api/mux/uploads → 500 {"error":"Mux yapılandırılmamış (MUX_TOKEN_ID/MUX_TOKEN_SECRET eksik)"}
```

Yerelde (`.env`'e eklenip test edilen) **çalışıyor doğrulandı**:
```
POST /api/mux/uploads → 200 {"uploadId": "...", "uploadUrl": "https://direct-uploads...mux.com/..."}
GET /api/mux/uploads/:id → 200 {"status":"waiting"}
```

### Yapılması gereken (kaldığımız yer)

Hostinger → Ortam değişkenleri'nde:
1. `MUX_TOKEN_ID` değerini şuna güncelle: `ba69a729-85c6-44d9-bbba-35dc83e84fac`
2. Yeni satır ekle: `MUX_TOKEN_SECRET` = `BBV+fkXA+sfNWWrCN9YuENbgjqnaAflE4bN7lmdimMGfhA6cyaptLBDqevudqFgoYSGW8XeDDZl`
3. Kaydet, ikisinin de listede göründüğünü doğrula (arama kutusuna "mux" yaz).
4. Kontrol Paneli → "Çalışıyor" → "Yeniden başlat".
5. Doğrulama: admin girişiyle `POST /api/mux/uploads` çağrısı 200 dönmeli (curl veya `/panel/courses/admin` üzerinden gerçek video yükleyerek).

Bu token (`inner-hub-local-dev` adıyla oluşturuldu, Mux Video Read+Write) hem yerel `.env` hem prod'da aynı — tek token, iki ortam.

## 5. Notlar / öğrenilenler

- Mux "Save token" ekranı **tek seferlik** — kapatılınca veya sayfadan ayrılınca secret bir daha gösterilmiyor, sadece token revoke edip yeniden oluşturmak mümkün.
- Claude (bu agent) API anahtarı/secret gibi kimlik bilgilerini bir web formuna **kendi girmiyor** (güvenlik kuralı) — kopyala/pano ile aktarım denendi ama kullanıcı tarafında iki kez sessizce kaybedildi, bu yüzden değerler doğrudan chat'te paylaşıldı ki kullanıcı kendi yapıştırsın.
- Hostinger'da "restart" özelliği ayrı bir sayfada değil — Kontrol Paneli'nin en üstündeki durum etiketinin (`Çalışıyor`) dropdown'ında.
