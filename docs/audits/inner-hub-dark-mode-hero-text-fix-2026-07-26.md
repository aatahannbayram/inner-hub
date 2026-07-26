# Dark Mode — Hero Metin Görünürlüğü Düzeltmesi

*Claude agent — 2026-07-26, HEAD `6f22c24`.*

## Özet

Panel dark tema özelliği devreye girdikten sonra, birkaç sayfada hero başlık/paragraf metni koyu temada neredeyse görünmez hale geliyordu. Kök sebep, arka plan (scrim) ile metnin farklı token stratejileri kullanmasıydı — biri sabit kalıyor, diğeri temayla birlikte dönüyordu.

## Bulgu

**Etkilenen sayfalar:** Kurslar (`/panel/courses`), Ayrıcalıklar (`/panel/perks`), Katılımcılar (`/panel/members`), inner·signal (`/panel/signal`).

**Neden oluştu:** Panelin dark tema token sistemi şu ilkeye dayanıyor:
- `--ink-fixed` / `--bone-fixed` → **tema bağımsız**, video/foto scrim'leri gibi her zaman koyu kalması gereken yüzeyler için.
- `--ink` / `--bone` → **temaya göre döner**, normal panel chrome (kart, arka plan, metin) için.

Cursor'ın i18n geçişi sırasında hero scrim'leri doğru şekilde `--ink-fixed`'e taşınmıştı, ama üzerindeki başlık/paragraf metni yanlışlıkla `text-white` yerine temaya-duyarlı `text-[var(--bone)]` olarak değiştirilmişti. Sonuç: light modda hiçbir fark görünmüyordu (`--bone` zaten krem/beyaza yakın), ama dark modda `--bone` neredeyse siyaha dönünce, sabit-koyu scrim üzerinde metin kayboluyordu.

Aynı kök sebep Signal'deki "Bu haftanın içgörüsü" kartında da vardı — kart arka planı hep koyu (`bg-black/55`, `dark:bg-black/50`), ama bazı iç metin/kenarlık renkleri hâlâ `--bone` (temaya duyarlı) kullanıyordu. Cursor bu kartın bir kısmını zaten `--bone-fixed`'e taşımıştı; kalan örnekler (başlık, dekoratif tırnak işareti, "yeniden oluştur" butonu, lightbox kapatma butonu) tamamlandı.

## Düzeltme

| Dosya | Değişiklik |
|---|---|
| `pages/panel/Courses.tsx` | Hero eyebrow/başlık/paragraf: `text-[var(--bone)]` → `text-white` |
| `pages/panel/Perks.tsx` | Aynı desen |
| `pages/panel/Members.tsx` | Aynı desen |
| `pages/panel/Signal.tsx` | İçgörü kartındaki kalan `text-[var(--bone)]`/`border-[var(--bone)]` örnekleri → `-fixed` varyantları |

Etkilenmeyenler (zaten `text-white` kullanıyordu, dokunulmadı): Etkinlikler, inner·match, inner·capital, Dashboard.

## Doğrulama

- `pnpm run typecheck` → temiz.
- İzole prod build (`vite preview`) üzerinde dark mode zorla açılarak dört sayfa da tek tek kontrol edildi — başlık, paragraf, kart metinleri tam okunur.
- Canlı `inner.digital`'da `/panel/members` üzerinden tema toggle'ı gerçek zamanlı tıklanarak doğrulandı.
- Konsolda hata yok.

## Yan bulgu — yerel build ortamı

Bu turda `vite build` yerel varsayılan Node 18.18.0 ile tamamen çalışmaz hale geldi (`crypto.hash is not a function` — Vite'ın yeni bir CSS/asset hash yolu Node 20.12+ gerektiriyor, muhtemelen index.css'e eklenen bir `color-mix()`/glass token değişikliği tetikledi). Node 20.19.0 ayrı bir corepack hatası veriyor bu ortamda; **Node 20.18.3** ( `source ~/.nvm/nvm.sh && nvm use 20.18.3` ) şu an çalışan tek sürüm. Sonraki build'lerde bunu kullanmaya devam edilmeli.

## İlgili dokümanlar

- [inner-hub-status-2026-07-25.md](./inner-hub-status-2026-07-25.md) — genel durum özeti, dark theme mimarisi
