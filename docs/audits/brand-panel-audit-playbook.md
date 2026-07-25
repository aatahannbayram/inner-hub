# Brand & Panel Audit Playbook

Yeniden kullanılabilir kurumsal ürün / private-community panel analiz şablonu.  
Inner-Hub (inner.digital) audit’inden türetilmiştir — başka markalara uyarlanabilir.

---

## 0. Amaç

Markanın görsel ve ürün dilini **bozmadan**:

1. Layout / scroll (“kayma”) sorunlarını tespit etmek  
2. Brand token tutarlılığını skorlamak  
3. Schema ↔ API ↔ UI örtüşmesini çıkarmak  
4. P0–P2 backlog + 2 haftalık plan üretmek  

**Çıktı formatı:** executive summary · kayma tablosu · brand skoru · coverage matrisi · backlog · 2 haftalık plan · “yapılmayacaklar”

---

## 1. Ön koşullar

| Girdi | Neden |
|-------|--------|
| Design tokens (renk, radius, tipografi) | Marka iskeleti |
| Panel shell (sidebar, header, main) | Kayma kaynağı |
| Auth modeli | Mock vs gerçek |
| DB schema + API routes | Coverage |
| Landing vs panel vs login | Dil tutarlılığı |
| Motion kütüphanesi kullanımı | Jump / a11y |

---

## 2. Kayma / scroll checklist

Her madde için: **Doğrulandı / False alarm / N/A** + `dosya:satır`

| ID | Kontrol | Tipik kök neden |
|----|---------|-----------------|
| C1 | Sidebar sticky/fixed mi? Document scroll ile kayıyor mu? | `min-h-screen` flex, aside sticky değil |
| C2 | Route transition `y` / `mode="wait"` layout jump yapıyor mu? | Framer transform + scrollbar gutter |
| C3 | Nested `scrollIntoView` window’u kaydırıyor mu? | Chat / feed |
| C4 | `100vh` + body scroll çift scrollbar mı? | Nested overflow |
| C5 | Overlay/drawer açıkken body scroll kilitli mi? | z-index + overflow |
| C6 | `scrollbar-gutter: stable` var mı? | Yatay ~15px shift |
| C7 | Parent `transform` sticky’yi kırıyor mu? | motion wrapper |

### Önerilen shell (marka-nötr)

```
h-svh overflow-hidden flex
├─ aside: h-full sticky/self-stretch + overflow-y-auto
└─ column: flex-1 min-h-0 flex-col
   ├─ header: shrink-0 (sticky gerekmez; zaten viewport kilitli)
   └─ main: flex-1 overflow-y-auto
```

Transition: **opacity-only** (y offset kaldır).

---

## 3. Brand audit skoru (0–10)

### Token kontrolü

- [ ] Primary / surface / accent tanımlı ve panelde kullanılıyor  
- [ ] Radius politikası (0 / soft / full) tutarlı  
- [ ] Display + body + mono font trio  
- [ ] Landing ↔ login ↔ panel dil hizası  

### İhlal kataloğu (örnek)

| İhlal | Neden zararlı |
|-------|----------------|
| Purple / indigo gradient | Generic AI-slop |
| Glow / glassmorphism | Kurumsal editorial dil bozar |
| `rounded-full` pill CTA kümeleri | Chrome tutarsızlığı |
| Multi-layer soft shadow kart panoları | Flat border dilini bozar |
| System font (Inter/Roboto default) | Marka imzasını siler |
| Floating card sidebar | “Dashboard SaaS” şablonu |

**Skor rehberi**

| Aralık | Anlam |
|--------|--------|
| 9–10 | Token + chrome + tipografi sıkı |
| 7–8 | İskelet sağlam, chrome sızıntıları var |
| 5–6 | Karışık dil, shadcn default baskın |
| &lt;5 | Marka kimliği kayıp |

---

## 4. Schema ↔ API ↔ UI matrisi

Her domain için üç sütun:

| Domain | Schema | API | UI |
|--------|--------|-----|-----|
| Auth | Var/Yok | Var/Yok | Canlı/Mock/Kısmi |
| … | | | |

**Canlılık skoru (0–100):** UI’nin gerçek veriye bağlı olma tahmini.

---

## 5. Backlog şablonu

| ID | Madde | Öncelik (P0/P1/P2) | Effort (S/M/L) | Alan |
|----|--------|---------------------|----------------|------|
| L* | Layout/kayma | | | Kayma |
| B* | Brand chrome | | | Marka |
| A* | Auth/güven | | | Auth |
| D* | Veri API | | | Veri |
| X* | a11y | | | a11y |
| H* | AI/entegrasyon | | | AI |

### Yapılmayacaklar (markayı koru)

Proje bazında doldur — örnek Inner-Hub:

- Purple / glow / glass  
- Lenis’i panele taşımak  
- Floating card sidebar  
- Stats-strip hero dashboard  
- Inter/system default font  

---

## 6. 2 haftalık plan şablonu

**Hafta 1 — Kayma + güven**  
- Gün 1–2: L* (shell, transition, nested scroll, drawer lock)  
- Gün 3–4: B* + X*  
- Gün 5: A* + bildirim/iskelet  

**Hafta 2 — Veri gerçeği**  
- Gün 1–3: En az 2 domain mock → API  
- Gün 4: Chat/feed read path  
- Gün 5: AI/session + bir eksik ürün kickoff  

**Başarı kriterleri (örnek)**  
- Sidebar kaymıyor  
- Route değişiminde yatay jump yok  
- Nested scroll window zıplatmıyor  
- ≥2 domain API’den geliyor  
- Login marka-tutarlı  

---

## 7. Görsel / kart ilkeleri (AI üretirken)

Kredi-tasarruflu, kurumsal editorial:

1. **Tek görsel · düşük çözünürlük (720p)** — retry yok  
2. **Sabit stil kilidi:** marka paleti, yüzsüz, tipografisiz, logo yok  
3. **Kart = etkileşim veya içerik konteyneri** — dekoratif kart yok  
4. **Zero/controlled radius** — marka politikasına uy  
5. **Önbellek** — aynı prompt/insight tekrar üretilmez  
6. **Onay** — üretim öncesi kullanıcı onayı  

### Prompt iskeleti

```
Editorial photograph for [BRAND] private circle.
Palette: [SURFACE], [INK], one accent [ACCENT].
Restrained, cinematic, no faces, no logos, no typography, no UI.
Concept: [ONE SENTENCE].
```

---

## 8. Inner-Hub referans bulguları (2026-07-22)

| Metrik | Değer |
|--------|--------|
| Marka skoru | 8.0 / 10 |
| Kayma C1–C6 | Doğrulandı |
| Auth | Canlı (cookie session) |
| Courses/Events/Chat/Vault | Mock ağırlıklı |
| İlk P0 | L1–L4 sticky shell + opacity transition |

Detaylı interaktif rapor: Cursor canvas `panel-kurumsal-audit.canvas.tsx`

---

## 9. Kullanım

1. Bu dosyayı kopyala → `docs/audits/<marka>-panel-audit.md`  
2. Bölüm 2–6’yı doldur  
3. Bölüm 7’ye marka prompt kilidini yaz  
4. P0’ı uygulamadan önce “yapılmayacaklar”ı paydaşla kilitle  

*Playbook version: 1.0 · Kaynak: Inner-Hub panel audit*
