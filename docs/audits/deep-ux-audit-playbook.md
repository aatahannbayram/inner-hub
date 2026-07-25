# Deep UX Audit Playbook

Yeniden kullanılabilir ürün UX derin analiz şablonu.  
Inner-Hub panel UX incelemesinden türetilmiştir — başka marka / SaaS / community ürünlerine uyarlanabilir.

Eşlik eden playbook: [`brand-panel-audit-playbook.md`](./brand-panel-audit-playbook.md)  
(Önce layout/marka, sonra bu dosya ile deneyim derinliği.)

---

## 0. Amaç

Görsel cilânın ötesine geçip:

1. **Üye / kullanıcı yolculuğunu** adım adım skorlamak  
2. **Nielsen 10 sezgiselini** 1–10 puanlamak  
3. **Sürtünme haritası** çıkarmak (kritik → düşük)  
4. **Ölçülebilir activation** metrikleri önermek  
5. P0–P2 UX backlog üretmek  

**Çıktı formatı:** ana tez · journey tablosu · heuristic skorları · sürtünme · kazanımlar · backlog · ölçüm

---

## 1. Ön koşullar

| Girdi | Neden |
|-------|--------|
| Gerçek veya prototip akış (landing → core loop) | Yolculuk |
| Auth / onboarding kuralları | Vaat vs gerçek |
| Hangi ekranlar mock / canlı | Güven riski |
| Nav bilgi mimarisi | Cognitive load |
| AI / otomasyon dokunuşları | Değer algısı |
| Mobil davranış | Drawer, sticky CTA |
| Brand & Panel Audit sonucu (varsa) | Estetik skorunu buraya taşıma |

---

## 2. Ana tez (1 paragraf)

Şablonu doldur:

> Deneyimin en zayıf halkası **[görsel / navigasyon / veri gerçeği / onboarding / monetizasyon]** değil / .  
> Asıl risk: kullanıcı **[N. gün / N. aksiyon]** içinde **[somut kırılma]** fark ederse marka / ürün zedelenir.

---

## 3. Üye yolculuğu

Her adım için durum: **Güçlü / İyi / İyileşti / Kısmi / Zayıf**

| Adım | Hedef | Durum | Not (kanıt) |
|------|-------|-------|-------------|
| 1. Landing / ilk izlenim | Güven, vaat | | |
| 2. Login / Register | Kimlik | | |
| 3. Home / Dashboard | Orientasyon | | |
| 4. Core value feature | “Neden buradayım?” | | |
| 5. Günlük araçlar (chat, feed, vault…) | Retention | | |
| 6. Monetizasyon / upgrade | Gelir | | |
| 7. (opsiyonel) Invite / share | Growth | | |

**Kural:** UI dolu ama veri mock ise durum en fazla **Kısmi**; “Güçlü” deme.

---

## 4. Nielsen 10 sezgisel (1–10)

| ID | Sezgisel | Skor | Bulgu (dosya / ekran) |
|----|----------|------|------------------------|
| H1 | Sistem durumu görünürlüğü | /10 | |
| H2 | Gerçek dünya ile eşleşme | /10 | |
| H3 | Kullanıcı kontrolü & özgürlük | /10 | |
| H4 | Tutarlılık & standartlar | /10 | |
| H5 | Hata önleme | /10 | |
| H6 | Tanıma / geri çağırma | /10 | |
| H7 | Esneklik & verimlilik | /10 | |
| H8 | Estetik & minimalist tasarım | /10 | |
| H9 | Hataları tanıma & kurtarma | /10 | |
| H10 | Yardım & dokümantasyon | /10 | |

**Ortalama:** `(Σ skor) / 10`

### Skor rehberi

| Aralık | Anlam |
|--------|--------|
| 9–10 | Üretim kalitesi, tutarlı geri bildirim |
| 7–8 | İyi; bilinen küçük boşluklar |
| 5–6 | Kullanılabilir ama güven/veri/akış eksik |
| ≤4 | Kritik — ürün vaadi ile UI çelişiyor |

---

## 5. Sürtünme haritası

| Seviye | Madde | Etki alanı |
|--------|-------|------------|
| Kritik | | Güven / retention / marka vaadi |
| Kritik | | |
| Yüksek | | Aktivasyon / ilk 7 gün |
| Yüksek | | |
| Orta | | Mobil / dönüşüm |
| Orta | | |
| Düşük | | a11y / cilâ |

### Tipik kritik kalıplar (kontrol listesi)

- [ ] Mock veri “gerçek ürün” gibi sunuluyor  
- [ ] Marka vaadi (invite-only, privacy, vs.) ürün akışında yok  
- [ ] Core loop tamamlanamıyor (CTA ölü / API yok)  
- [ ] Onboarding sonrası boş dashboard  
- [ ] Ödeme / AI pahalı işlem onay veya net hata mesajı yok  

---

## 6. Bilgi mimarisi & cognitive load

| Soru | Yanıt |
|------|-------|
| Birincil nav kaç öğe? | |
| Gruplama var mı? (Product / Community / Account) | |
| Yeni kullanıcı 30 sn’de “ne yapacağım?” buluyor mu? | Evet / Hayır / Kısmen |
| Global arama / komut paleti var mı? | |
| Empty state aksiyon öneriyor mu? | |

**Eşik:** 12+ düz nav öğesi → P1 “nav bilgi mimarisi” backlog’a yaz.

---

## 7. Mobil & erişilebilirlik

| Kontrol | Durum | Not |
|---------|-------|-----|
| Drawer / sheet body scroll lock | | |
| Sticky primary CTA (form / checkout) | | |
| `prefers-reduced-motion` | | |
| Focus trap (modal/drawer) | | |
| Touch hedef ≥ 44px | | |
| Contrast (metin / muted) | | |

---

## 8. AI / otomasyon dokunuşları (varsa)

| Kontrol | Durum |
|---------|-------|
| Üretim öncesi onay / maliyet şeffaflığı | |
| Başarısız / timeout empty state | |
| Sonuç → sonraki aksiyon (pipeline) | |
| Aynı içerik için cache / tekrar üretim engeli | |
| Kullanıcıya “AI üretti” etiketi (güven) | |

---

## 9. Ölçüm önerisi

Şablonu doldur:

| Metrik | Tanım | Hedef |
|--------|-------|-------|
| Activation | `[kayıt] → [N gün] içinde ≥1 [gerçek aksiyon]` | |
| Time-to-value | İlk anlamlı ekrana süre | |
| Core loop completion | `[aksiyon A] → [aksiyon B]` oranı | |
| Trust break | Mock/error görüp bounce | mümkün olduğunca 0 |

**Uyarı:** Veri mock iken activation metrikleri yanıltıcıdır — önce API.

---

## 10. UX backlog şablonu

| Öncelik | Madde | Effort (S/M/L) | Bağlı heuristic / sürtünme |
|---------|-------|----------------|----------------------------|
| P0 | | | |
| P0 | | | |
| P1 | | | |
| P1 | | | |
| P2 | | | |

### Tipik P0 / P1 / P2

**P0:** mock → gerçek veri (en az 1–2 domain), vaat–akış uyumu (invite gate), kritik scroll/drawer lock  
**P1:** nav gruplama, core feature → aksiyon pipeline, reduced-motion, 2. görsel set  
**P2:** global arama, empty-state illüstrasyon, onboarding checklist  

---

## 11. Rapor iskeleti (kopyala-yapıştır)

```markdown
# [Marka] Deep UX Audit — [YYYY-MM-DD]

## Ana tez
…

## Skorlar
- Heuristic ort.: /10
- Marka/estetik: /10 (panel audit’ten)
- Veri gerçeği: /10

## Yolculuk
| Adım | Durum | Not |
| … |

## Heuristics
| ID | Skor | Bulgu |
| … |

## Sürtünme
| Seviye | Madde | Etki |
| … |

## Backlog
| P | Madde | Effort |
| … |

## Ölçüm
Activation: …
```

---

## 12. Kullanım

1. Bu dosyayı kopyala → `docs/audits/<marka>-deep-ux-playbook-fill.md` veya instance  
2. Bölüm 2–10’u doldur (boş satır bırakma — “N/A” yaz)  
3. Brand & Panel Audit ile çelişen madde varsa **panel audit’i güncelle**  
4. P0’ı uygulamadan önce paydaşla “vaat vs mock” maddesini kilitle  

---

## 13. Inner-Hub referans (2026-07-22)

| Metrik | Değer |
|--------|--------|
| Heuristic ort. | ~6.2 / 10 |
| Marka / estetik | 8 / 10 |
| Veri gerçeği | ~4 / 10 |
| Ana tez | Zayıf halka mock veri; layout/görsel düzeldi |
| P0 | Events/Courses API, invite-only register, drawer body-lock |

Dolu instance: [`inner-hub-deep-ux-2026-07-22.md`](./inner-hub-deep-ux-2026-07-22.md)

---

*Playbook version: 1.0 · Kaynak: Inner-Hub deep UX audit*
