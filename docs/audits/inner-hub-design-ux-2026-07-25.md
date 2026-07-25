# Inner-Hub · Tasarım Güzelliği + UX Derin Analiz

> Kapsam: **Web (marketing)** + **Panel** · inner.digital  
> Tarih: 2026-07-25  
> Kaynak: canlı site + `artifacts/inner-hub` kodu  
> Playbook: `deep-ux-audit-playbook.md` · `brand-panel-audit-playbook.md`

---

## Ana tez

**Görsel dil güçlü; ürün deneyimi henüz o gücü taşımıyor.**  
Landing editorial ve marka paleti (ink / bone / green + Fraunces) private-circle hissini iyi kuruyor. Panel chrome aynı dili konuşuyor. Asıl risk: kullanıcı paneli “güzel bir demo” olarak algıladığı anda (Chat, Vault, Capital, Members, Perks mock) davet-only / güven vaadi kırılır.

| Katman | Skor |
|--------|------|
| Marketing güzellik | **8.5 / 10** |
| Marketing UX (davet hunisi) | **7.5 / 10** |
| Panel güzellik / tutarlılık | **7.5 / 10** |
| Panel UX (gerçek kullanım) | **5.0 / 10** |
| Veri gerçeği | **4.5 / 10** |
| Nielsen ort. (panel ağırlıklı) | **6.3 / 10** |

---

## 1 · Envanter özeti

### Web
| Rota | Durum |
|------|--------|
| `/` Home | Statik editorial + video; CTA → davet |
| `/invitation` | API form |
| `/requests` | Admin passcode + API |

### Panel (özet)
| Canlı / hibrit | Ağır mock |
|----------------|-----------|
| Auth, Signal (+ AI image), Events, Courses list, Membership Stripe path, Perks UX shell | Chat, Vault, Capital, Members, Pulse, Id, Api, Applications, Analytics, Notifications, Profile persist |

---

## 2 · Tasarım sistemi (kanıt)

```
--ink: #0A0A0A
--bone: #F4F1EC
--inner-green: #18FF85
--radius: 0rem
Fonts: Fraunces (display) · Inter Tight · JetBrains Mono
Motion: Framer + Lenis (landing) · FadeIn / page opacity
```

**Güçlü:** kare chrome, mono eyebrow, green square lockup, grain, full-bleed video.  
**Zayıf nokta:** cream + serif AI-estetik kümesine yakınlık; green kare kurtarıyor ama light yüzeyler monotonlaşabiliyor.

---

## 3 · Marketing — güzellik

### Güçlü
- Full-bleed hero video + scrim + grain atmosfer
- Bölüm ritmi (`01 · The idea` …) net editorial
- Platform kartları (signal / match / capital) markalı
- Invitation copy: “Access is by invitation. Always.”

### Zayıf
- **Brand-first test kısmi başarısız:** H1 *“What comes next starts here.”* — Lockup çoğunlukla nav’da. Nav kalkınca generic manifesto + video.
- Footer sosyal `href="#"`
- Landing *“No tickets. No tiers”* ↔ panel Membership ücretli planlar — marka çelişkisi

### First viewport (web)
| Nav varken | Nav yokken |
|------------|------------|
| Lockup + green net | H1 generic; tanınabilirlik düşük |

---

## 4 · Marketing — UX

| Adım | Durum | Not |
|------|--------|-----|
| İlk izlenim | Güçlü | Atmosfer, scroll ritmi |
| Davet iste | İyi | Form API; success tone doğru |
| Panel’e geçiş | Kısmi | Ayrı yüzey; invite register kodu Hostinger’da bilinmeli |

**Sürtünme:** Landing İngilizce club dili; panel TR + yer yer EN hero — dil kişiliği bölünmüş.

---

## 5 · Panel — güzellik

### Güçlü
- PanelLogin: Lockup + “Continue inside the circle” — brand testini **geçer**
- Sidebar BrandMark, ink active state, radius 0
- Signal ink hero, Perks drawer / öne çıkan — son sprintler dil tutarlılığı artırmış
- Reduced-motion saygısı (FadeIn / transition)

### Zayıf
- Dashboard `rounded-full` pill’ler token’a aykırı
- 16 flat nav öğesi — editorial hierarchy yok
- Perks initials logo; InnerId Lucide QR placeholder
- Birçok sayfada “mini landing” video hero → panel ürün değil galeri hissi
- Aynı CloudFront video tekrarı yorgunluk yaratıyor

---

## 6 · Panel — UX

### Nielsen (1–10)

| ID | Sezgisel | Skor | Bulgu |
|----|----------|------|-------|
| H1 | Sistem durumu | 6 | Online beacon; bildirimler mock |
| H2 | Gerçek dünya | 4 | Chat/Vault/Capital/Members sahte |
| H3 | Kontrol & özgürlük | 7 | Collapse, Escape, logout |
| H4 | Tutarlılık | 7.5 | Token güçlü; pill/radius ihlali |
| H5 | Hata önleme | 7 | Invite gate var (prod); HF confirm |
| H6 | Tanıma | 7.5 | Lockup, mono, Fraunces |
| H7 | Verimlilik | 5 | Nav derin; arama yok |
| H8 | Estetik / minimal | 8 | Editorial; kart kontrolü iyi |
| H9 | Hata kurtarma | 5 | Boş/error state tutarsız |
| H10 | Yardım | 6 | FAQ var; empty kit az kullanılıyor |

### Yolculuk

| Adım | Durum |
|------|--------|
| Login | İyi (prod seed sonrası) |
| Dashboard | Kısmi — orientasyon var, CTA’lar yanıltıcı olabilir |
| Signal / Match | Kısmi–iyi — AI değer; Match `userId`/`Tanıştır` zayıf |
| Chat / Vault | Zayıf — demo |
| Membership | Kısmi — Stripe env bağımlı |

### Kritik sürtünmeler
1. **Mock trust break** — “gönder / kaydet / tanıştır” gerçek gibi  
2. **Nav overload** — primary path belirsiz  
3. **Profil persist yok** — tamamlanma %0 yanılsaması  
4. **Dashboard → Applications** — üye/admin rol karmaşası  

---

## 7 · Öncelik backlog (güzellik + UX)

### P0
1. Landing hero’da Lockup / “inner” display-level marka  
2. Mock yüzeylerde “Önizleme” etiketi veya etkileşimi kapat  
3. Nav’ı 4–5 gruba ayır (Günlük / Ağ / Platform / Hesap)

### P1
4. Dashboard pill’leri radius-0 diline çek  
5. Perks gerçek logo / wordmark  
6. Register: invite yoksa “Davet iste → /invitation”  
7. Match: session user + dürüst Tanıştır sonucu  
8. Panel sayfalarında video hero bütçesini sınırla  

### P2
9. Dil: panel TR veya EN — tek kişilik  
10. InnerId gerçek QR veya dürüst empty  
11. Auth loading skeleton (boş flash yok)  
12. Membership ↔ “no tiers” copy hizası  

---

## 8 · Ölçüm önerisi

**Activation:** kayıt / ilk giriş → 7 gün içinde ≥1 **gerçek** aksiyon (event RSVP, vault view, chat mesajı veya match request).  
Mock etkileşimler metrik olarak sayılmamalı.

---

## Sonuç

inner·hub **görsel olarak private circle markası kurmuş**; marketing bu işi panelden daha iyi yapıyor. Panel **chrome güzel**, ama **içerik güveni** olmadan güzellik tersine döner. Sonraki sprint’in odağı yeni animasyon değil: **dürüst veri + sade IA + first-viewport marka**.

*Rapor sürümü: 1.0 · 2026-07-25*
