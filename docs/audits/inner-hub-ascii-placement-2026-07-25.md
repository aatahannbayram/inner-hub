# Inner-Hub · Yeniden Analiz + 21st.dev ASCII Yerleşim Rehberi

> Tarih: 2026-07-25 (öğleden sonra)  
> Kaynaklar: https://inner.digital · https://21st.dev/community/ascii · `artifacts/inner-hub`  
> Önceki rapor: [`inner-hub-design-ux-2026-07-25.md`](./inner-hub-design-ux-2026-07-25.md)

---

## A · Site durumu (kısa yeniden skor)

Önceki tez **hâlâ geçerli**: görsel dil güçlü; panelde mock güven riski ana kırılma.

| Katman | Önceki | Şimdi | Not |
|--------|--------|-------|-----|
| Marketing güzellik | 8.5 | **8.7** | `ProceduralPortrait` (Phosphor) §02’de canlı; footer Lockup güçlü |
| Marketing UX | 7.5 | **7.5** | Brand-first hero hâlâ kısmi; H1 generic |
| Panel güzellik | 7.5 | **8.0** | Vault D60-hero, Pulse Phosphor, Dashboard contour kart — ASCII DNA girmiş |
| Panel UX | 5.0 | **~5.0** | Mock yüzeyler büyük ölçüde aynı risk |
| Veri gerçeği | 4.5 | **4.5** | Değişmedi (bu turda ölçülmedi) |

**Yeni bulgu:** Projede 21st ASCII pipeline’ının **kısmi portu** zaten var:

| Preset (21st köken) | Mod | Kullanıldığı yer |
|---------------------|-----|------------------|
| Phosphor / characters + green tint | `characters` | `Home.tsx` §02, `Pulse.tsx` |
| D60-hero / topographic contour | `contour` | `Vault.tsx`, Dashboard vault kartı |
| Motor | `ProceduralPortrait.tsx` | characters + contour only |

Yani ASCII “yeni fikir” değil — **markanın zaten kullandığı sinyal dili**. Soru: nereye daha akıllıca yayılır, nereye hiç konmaz.

---

## B · 21st.dev/community/ascii — ne var?

Community sayfası **ASCII art recipe** kataloğu: foto/video → grid karakter / mosaic / dither / contour tarifi. İsimlerden okunan kümeler:

### Markaya **uyan** (ink/bone/green, sakin, terminal/editorial)
| Recipe kümesi | Karakter | Neden uyuyor |
|---------------|----------|--------------|
| **Minimal / minimal** | Az karakter, yüksek kontrast | Bone yüzey + mono dil |
| **shader-dither** | Dither nokta | Print / broadsheet hissi |
| **Heximage** | Hex/grid | API / id / teknik yüzey |
| **thread light / thread paint** | İnce hat | Contour’a yakın; Vault ailesi |
| **dark mode** (sade) | Ink zemin | Panel dark kartlar, Signal |
| **light mode** (sade) | Açık zemin | Landing bone bölümleri — dikkatli |
| **ASCII log leet** | Log/terminal | Chat boş state, API sayfası, preloader |
| **D60-hero** | Contour harita | **Zaten Vault’ta** |
| **MASK** (sade kullanım) | Maske / gizlilik | Invite-only, InnerId “kimlik” metaforu — abartmadan |
| **Forest / MOSAIC leaf** (desatüre) | Organik mosaic | Gathering / İstanbul atmosfer — sadece desatüre + ink |

### Markaya **uymayan** (kaçın)
| Recipe kümesi | Neden |
|---------------|--------|
| Neon Nebula, Neon mosaic, Vibrant Pulse Glow, Golden Radiance Shimmer, Electric Gaze, Vignette Bloom, Flicker Cityscape | Purple/glow/neon — brand yasak listesi |
| Terminal Pikachu, football, Brazil_Characters, Bread and Butter… | Meme / pop — private circle tonunu kırar |
| Creation of Adam / Act of creation (tam figür dramatik) | Dini/üreme ikonografisi; club markası için riskli |
| Aşırı renkli mosaic (liquid Mosaic, All about the Benjamins) | Casino/crypto estetiği |

**Kural:** 21st’ten recipe alırken **sadece render pipeline + sakin preset**; thumbnail’deki neon rengi kopyalama. Tint daima `--inner-green` veya ink; bloom/glow pfx kapalı veya çok düşük.

---

## C · inner.digital’de ASCII nerede kullanılmalı?

### ✅ Yüksek uyum (önerilen)

| Yer | Ne | Recipe / yaklaşım | Neden |
|-----|----|-------------------|-------|
| **Landing §02 Founding seats** | Zaten Phosphor portrait | Mevcut; isteğe bağlı `shader-dither` varyant A/B | “Signal · Founding member” ile uyumlu |
| **Landing preloader** | Tek frame ASCII “inner” / daire | Minimal / ASCII log | İlk 400ms marka; video’dan önce |
| **PanelLogin ambient** | Video yerine veya üstünde soft ASCII overlay | dark mode + low opacity characters | Club giriş ritüeli |
| **inner·vault hero** | Zaten D60-hero | Contour + thread light densitesi | Arşiv / derinlik metaforu |
| **inner·pulse** | Zaten Phosphor | Karakter flicker = “canlı sinyal” | Ürün adına birebir |
| **inner·signal** | Insight altında küçük ASCII strip veya heatmap yerine ASCII activity | Minimal / dither | Heatmap mock’u görsel olarak “signal”e bağlar |
| **inner·id** | QR yerine veya yanında ASCII kimlik kartı | Heximage / MASK-sade | Portable identity; Lucide QR’dan daha markalı |
| **inner·api** | Dokümantasyon hero / empty | ASCII log leet | Developer yüzeyi |
| **Empty states** (Chat, Vault boş) | Mono ASCII çerçeve + “henüz yok” | Minimal | Empty kit’i güzelleştirir; mock’u “ürün” sanmaz |
| **Demo / Önizleme badge yanı** | Küçük ASCII watermark | Minimal 1 satır | Mock trust labeling’e görsel destek |

### ⚠️ Orta uyum (tek dokunuş, abartma)

| Yer | Ne | Uyarı |
|-----|----|--------|
| **Match** skor kartı arka planı | Çok düşük opacity contour | Dating-app hissi yaratmasın |
| **Perks** featured ink kart | Dither texture | Logo/wordmark’ın yerini almasın |
| **Gathering (§06)** | Tek mosaic frame (desatüre) | Neon cityscape yok |
| **Dashboard spotlight** | Bir kartta portrait (zaten vault) | Her karta ASCII koyma → yorgunluk |

### ❌ Kullanma

| Yer | Neden |
|-----|--------|
| **Landing first-viewport hero (full-bleed video’nun üstüne yoğun ASCII)** | Brand-first + hero budget bozulur; video zaten dominant |
| **Tüm panel sayfalarında tekrarlayan ASCII hero** | Önceki audit: “mini landing galerisi” yorgunluğu artar |
| **Form alanları / CTA içi** | Okunabilirlik + a11y |
| **Mobil nav / sidebar** | Performans + gürültü |
| **Neon recipe’ler** | Marka ihlali |

---

## D · Teknik entegrasyon notu

Mevcut motor: `ProceduralPortrait.tsx`  
- Desteklenen: `characters` | `contour`  
- 21st’teki dither / hex / mosaic için: ya yeni `renderMode` ekle ya da o recipe’nin **sadece karakter seti + cellSize + tint + pfx** parametrelerini mevcut moda map’le.

**Performans:** canvas RAF + flicker; reduced-motion’da `animIntensity: 0` / static frame.  
**A11y:** decorative `aria-hidden`; metin içeriği ASCII’ye gömülmesin.

**Önerilen sonraki 3 uygulama (düşük risk):**
1. Preloader → Minimal ASCII “i■” / daire  
2. Signal → dither strip (heatmap yerine veya üstünde)  
3. InnerId → Heximage tarzı kimlik kartı (QR placeholder yerine)

---

## E · ASCII + 10/10 ilişkisi

ASCII tek başına skoru 10 yapmaz. Ama:
- **Güzellik +2 potansiyel** (özgün, zaten brand DNA)  
- **UX** için sadece empty/demo etiket + Id/Signal’de anlamlı kullanım  
- Neon community recipe’leri kör kopya = **güzellik −3**

---

## Sonuç

21st ASCII kataloğu inner·hub için **doğru hammadde deposu** — özellikle Minimal, dither, Heximage, thread/contour, sade dark/light, ASCII log. Neon / meme / glow kümesi elensin.

Sitede ASCII **zaten** Home §02, Vault, Pulse’ta yaşıyor. En yüksek ROI: **preloader, Signal, InnerId, empty states** — hero video’yu ve her panel sayfasını ASCII ile doldurmadan.

*Rapor: 1.0 · ASCII yerleşim · 2026-07-25*
