# Inner-Hub Deep UX Audit — Filled Instance

> Playbook: [`deep-ux-audit-playbook.md`](./deep-ux-audit-playbook.md)  
> Eşlik: [`brand-panel-audit-playbook.md`](./brand-panel-audit-playbook.md) · [`inner-hub-panel-audit-2026-07-22.md`](./inner-hub-panel-audit-2026-07-22.md)  
> Tarih: 2026-07-22 · Marka: inner·hub / inner.digital

---

## Ana tez

Deneyimin en zayıf halkası görsel değil — **vaat edilen ürünün mock kalması**.  
Layout kayması giderildi; editorial kartlar güven sinyali verdi. Asıl risk: kullanıcı 2. günde “sahte dashboard” fark ederse marka zedelenir.

---

## Skorlar

| Metrik | Değer |
|--------|--------|
| Heuristic ort. | **6.2 / 10** |
| Marka / estetik | **8 / 10** |
| Veri gerçeği | **4 / 10** |
| Sürtünme (kritik+yüksek) | 4 madde |

---

## 1 · Üye yolculuğu

| Adım | Hedef | Durum | Not |
|------|-------|-------|-----|
| 1. Landing | Davet / güven | Güçlü | Editorial hero, Lenis, form honeypot |
| 2. Login / Register | Kimlik | İyi | Gerçek auth; Google opsiyonel; invite-only gate eksik |
| 3. Dashboard | Orientasyon | İyileşti | Hero görsel + EditorialCard; istatistikler mock |
| 4. Signal | Değer / AI | Kısmi | Claude + Higgsfield; userId sabit; heatmap mock |
| 5. Chat / Events / Vault | Günlük kullanım | Zayıf | UI dolu, veri mock |
| 6. Membership / Pay | Monetizasyon | Kısmi | Stripe route var; env yoksa kırılır |

---

## 2 · Nielsen sezgiselleri

| ID | Sezgisel | Skor | Bulgu |
|----|----------|------|-------|
| H1 | Sistem durumu görünürlüğü | 6 | Online beacon; bildirimler mock |
| H2 | Gerçek dünya ile eşleşme | 4 | Çoğu panel sahte veri |
| H3 | Kullanıcı kontrolü | 7 | Collapse, logout, HF onay |
| H4 | Tutarlılık & standartlar | 8 | Token dili güçlü |
| H5 | Hata önleme | 6 | Validation var; invite gate yok |
| H6 | Tanıma / geri çağırma | 7 | Lockup, mono, Fraunces |
| H7 | Esneklik & verimlilik | 5 | Nav derin; global arama yok |
| H8 | Estetik & minimalist | 8 | Editorial; kart sayısı kontrollü |
| H9 | Hata tanıma | 5 | Toast var; 503/429 tutarsız olabilir |
| H10 | Yardım & dokümantasyon | 6 | FAQ mock; empty state zayıf |

---

## 3 · Sürtünme haritası

| Seviye | Madde | Etki |
|--------|-------|------|
| Kritik | Mock veri duvarı (Events/Courses/Chat) | Güven & retention |
| Kritik | Invite-only vaadi vs açık register | Marka vaadi |
| Yüksek | Nav 15+ öğe — yeni üye kaybolur | İlk 7 gün aktivasyon |
| Yüksek | Signal → aksiyon yolu zayıf | Değer algısı |
| Orta | Mobil drawer + sticky CTA yok | Mobil dönüşüm |
| Orta | Aynı editorial görselin 3 kartta tekrarı | Görsel çeşitlilik (kredi için bilinçli) |
| Düşük | reduced-motion panel transition’da yok | a11y |

---

## 4 · Bugün yapılan UX kazanımları

**Layout / kayma:** h-svh tek scroll · opacity-only transition · Chat container scroll · scrollbar-gutter · Members drawer body-lock  

**Görsel / kart:** EditorialCard · Dashboard hero + 3 spotlight · 1× Higgsfield görsel · kare chrome  

---

## 5 · UX backlog

### P0
- ~~Events / Courses read API~~ ✓  
- ~~Invite-only register gate~~ ✓  
- ~~Applications drawer body-lock~~ ✓  

### P1
- Nav bilgi mimarisi (grupla)  
- Signal → aksiyon pipeline  
- 2. editorial görsel seti  
- ~~prefers-reduced-motion~~ ✓  
- ~~Signal session userId~~ ✓  

### P2
- Global arama  
- Empty-state illüstrasyon  
- Onboarding checklist  
- Chat / Vault write path  

---

## 6 · Ölçüm

**Activation (öneri):** kayıt → 7 gün içinde ≥1 gerçek içerik etkileşimi (event RSVP, vault view veya chat mesajı).  

Events/Courses read path canlı; Chat/Vault hâlâ mock — metrik için kalan boşluklar.

---

*Instance version: 1.1 — sprint applied*
