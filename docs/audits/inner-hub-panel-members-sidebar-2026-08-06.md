# /panel/members onarımı + sidebar IA onarımı — durum

*Claude agent — 2026-08-06.*

Bu oturumda iki ayrı brief işlendi. `/panel/members` briefi başka bir agent
oturumu (muhtemelen Cursor) tarafından eşzamanlı olarak commit'lendi;
aşağıdaki D-01..D-16 bölümü **kod okuyarak doğrulama** — bu oturumda yazılmadı.
Sidebar (S-01..S-08) briefi ise bu oturumda uçtan uca yazıldı ve commit'lendi.

## 1. `/panel/members` — D-01..D-16 doğrulama (başka session'ca yazıldı)

Commit zinciri: `293f1d8`, `d9220ba`, `706e987`, `c95cfa4`, `268f2f4`, `6c6f2af`, `e2088d5`.

| # | Durum | Kanıt |
|---|---|---|
| D-01 (nokta maskesi) | **PASS** | `displayText.ts` — kök neden buradaydı: `[--―]` regex karakter sınıfı çıplak bir aralık tanımlıyordu (U+002D→U+2015), bu aralık rakam/harflerin çoğunu kapsıyor. Artık açık bir tire karakter listesi kullanılıyor. |
| D-02 (TR-duyarsız arama) | **PASS** | `lib/text.ts` → `norm()`, diyakritik katlama + `toLocaleLowerCase('en-US')` + NFD strip. `Members.tsx`'te name/title/company/bio/persona/tags üzerinde kullanılıyor. |
| D-03 (boş sonuç durumu) | **PASS** | Boş durum bileşeni + "Filtreleri sıfırla" + "Birini davet et", `type="search"`, `autoComplete="off"`, × temizle butonu, 140ms debounce (`useDebouncedValue`). |
| D-04 (tekrar eden etiket) | **PASS** | `dedupeTags()` — title/company/persona hariç tutuyor, case-insensitive dedupe, max 3 + `+N`. |
| D-05 (şirket → etiket sızması) | **PASS** | Şirket kimlik satırında (`roleCompanyLine`), `UZMANLIK`/tags bölümünde değil. Etiketler `max-w` + `truncate`. |
| D-06 (test/sistem hesapları) | **PASS** | `users.isSystem` kolonu + `isTestOrSystemAccount`/`isDirectoryMember`, hem `/api/members` (`community.ts`) hem `/api/talent` (`talent.ts`) sorgusunda uygulanıyor. |
| D-07 (kartlar link değil) | **PASS** | `MemberCard` artık gerçek `<Link href="/panel/members?uye={id}">`, `focus-visible` halkası var, `onMessage` butonu `preventDefault/stopPropagation` ile ayrı davranıyor. |
| D-08 (drawer URL'de değil) | **PASS** | `useSearch()`/`useLocation()` (wouter) ile `?uye=` senkron; `closeMember` mümkünse `history.back()`, değilse `replace` ile parametreyi temizliyor; body scroll kilidi + focus trap + dönüş var. |
| D-09 (avatar tutarsızlığı) | **PASS** | Kart ve drawer aynı `PersonAvatar` bileşenini kullanıyor. |
| D-10 (boş drawer) | **PASS** | Künye bloğu (doğrulama durumu, tamamlanma %, LinkedIn), üyenin talent ilanları, ortak etiket/"shared interest" bloğu eklendi. |
| D-11 (sidebar taşması) | **PASS** | Bu D-11, ayrı ve çok daha kapsamlı bir brief olarak bu oturumda **S-01..S-08** altında işlendi (bkz. bölüm 2). |
| D-12 (hero + istatistik kartları) | **PASS** | Hero video kaldırıldı; kompakt başlık + sticky filtre çubuğu + tıklanabilir persona çipleri (`Tümü N · Kurucu N · ...`) ile değiştirildi. "canlı durum yakında" ibaresi yok. |
| D-13 (mobilde kart yüksekliği) | **PASS** | Kart yeniden tasarlandı (52px avatar, `line-clamp-2` bio, max 3 etiket), Kart/Liste görünüm anahtarı (`LayoutGrid`/`List`) eklendi. |
| D-14 (sıralama) | **PASS** | `sort: featured/verified/az`, `compareTR` (tr-locale), eksik profiller `incompleteMembers` altında katlanabilir bölümde. |
| D-15 (metin/etiket düzeltmeleri) | **PASS** | Türkçe başlıklar, `toUpperTR` kullanımı, etiketlerde CSS `uppercase` yerine veri olduğu gibi basılıyor (`MEDİCAL PARK` hatası kök nedenden çözülmüş). |
| D-16 (erişilebilirlik) | **PASS** | `focus-visible` her interaktif öğede, `aria-label` ikon butonlarda, `aria-pressed`/`role="tab"` filtre ve sekmelerde, drawer `role="dialog" aria-modal aria-labelledby`, `aria-live="polite"` sonuç sayısında. |

**Doğrulama yöntemi:** kod okuma + `npx tsc --noEmit` (Members.tsx ve ilgili dosyalarda hata yok — tek hata `Events.tsx`'te ve tamamen alakasız bir Luma entegrasyonu değişikliğinden, bu oturuma ait değil). Canlı tarayıcı ile R1-R15 regresyon tablosu **çalıştırılmadı** (bu oturumda tarayıcı erişimi kullanılmadı) — istenirse ayrı bir adımda yapılabilir.

**Dokunulmadı:** `artifacts/inner-hub/src/pages/panel/MemberProfile.tsx` hâlâ `App.tsx`'te route'lanmamış, sabit sahte üye verisiyle dolu ölü bir dosya. Brief'te bahsi yok, sildim de değiştirmedim de — istenirse ayrı bir karar olarak ele alınmalı.

## 2. Sidebar (S-01..S-08) — bu oturumda yazıldı

Commit zinciri: `d8d9fd9`, `c54ba09`, `3595ce0`, `4fee40e`, `7699408`, `f83d432`, `81a76fe`.

| # | Durum | Değişen dosya |
|---|---|---|
| S-01 (nav içeriğinin %40'ı erişilemiyor) | PASS | `PanelNav.tsx`, `PanelShell.tsx` |
| S-02 (Platform satırları soluk) | PASS (görsel doğrulama bekliyor) | `PanelNav.tsx` |
| S-03 (ADMİN Türkçe uppercase) | PASS | `PanelShell.tsx` |
| S-04 (%0 tamamlanma çubuğu) | PASS | `PanelShell.tsx`, `messages.ts` |
| S-05 (daralt butonu taşıyor) | PASS | `PanelShell.tsx` |
| S-06 (bölüm başlığı isimlendirme) | Kullanıcı kararı: "Ana" değişmeyecek | — |
| S-07 (aktif durum ikinci sinyal) | PASS | `PanelNav.tsx` |
| S-08 (mobil drawer focus trap) | PASS | `PanelShell.tsx`, `messages.ts` |

Faz 4 ("çıtayı yükselt": komut paletine nav entegrasyonu, bildirim sayaçları,
kompakt footer, klavye kısayolları, daraltılmış modda flyout menü) ve Faz 5
(otomatik regresyon — Playwright yok, repoda mevcut değil ve yeni bağımlılık
eklenmedi) **işlenmedi**, istenirse ayrı adım olarak ele alınabilir.

## 3. Eşzamanlı oturum notu

Bu oturum boyunca aynı repoda başka bir agent oturumu **eşzamanlı** çalıştı;
`/panel/members` briefini tamamladı, sonrasında Luma takvim entegrasyonuna
geçti (`Events.tsx`, `ExternalEventModal.tsx`, `luma.ts`, `hub.ts` şema —
bu oturuma ait değil, dokunulmadı). i18n dosyasında (`messages.ts`) çakışma
riski `git add -p` ile hunk bazlı seçici stage yapılarak önlendi — diğer
oturumun commit'lenmemiş satırları hiçbir commit'e karışmadı.
