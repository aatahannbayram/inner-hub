# Execution Plan — Brand Panel + Deep UX Playbooks

> Kaynak: `brand-panel-audit-playbook.md` + `deep-ux-audit-playbook.md`  
> Instance: Inner-Hub · 2026-07-22  
> Durum: Uygulama sprinti

---

## Düşünce (önce)

İki playbook farklı katmanlara bakıyor ama **aynı P0’da kesişiyor**:

| Playbook | Asıl mesaj | Zaten yapıldı | Kalan P0 |
|----------|------------|---------------|----------|
| Brand & Panel | Kayma + chrome + coverage | Shell, transition, Chat scroll, gutter, chrome, editorial | Invite gate, Applications body-lock |
| Deep UX | Mock veri = güven kırığı | Members lock, görsel kartlar | Events/Courses API, invite gate, Applications lock |

**Strateji:** Önce “vaat ↔ ürün” (invite) + “veri gerçeği” (Events/Courses read) + kalan drawer lock.  
P1’den sadece düşük maliyetli a11y (`reduced-motion`) ve Signal’de session user bu sprinte alınır.  
Nav yeniden mimari / Vault schema / 2. HF görsel → sonraki sprint (kredi + kapsam).

**Yapılmayacaklar (bu sprint):** purple/glow, Lenis→panel, floating sidebar, full Chat write API, Vault storage.

---

## A · Brand & Panel — Tasklist

### A1 — Applications drawer body-lock
**Prompt:**  
`Applications.tsx` içindeki detay/drawer overlay’i Members ile aynı desene çek: açılınca `document.body.style.overflow = 'hidden'`, unmount’ta geri al; overlay/panel z-index header üstünde (`z-40`/`z-50`). Marka: ink/bone, radius 0. Başka UI değiştirme.

**Done when:** Drawer açıkken arka plan kaymıyor; Escape/backdrop kapatıyor.

### A2 — Invite-only register gate
**Prompt:**  
Private circle vaadine uygun kayıt: `POST /api/auth/register` yalnızca geçerli davet ile açılsın. Env `INVITE_PASSCODE` (veya onaylı invitation email match). Body’de `inviteCode` zorunlu; yanlışsa 403. Frontend `PanelLogin` register modunda invite alanı + net hata. `.env.example` / `hostinger.env` güncelle. Google register da aynı gate’e tabi (yeni kullanıcı yaratırken).

**Done when:** Kod olmadan register 403; doğru kodla 201; login etkilenmez.

### A3 — reduced-motion (P1 hızlı)
**Prompt:**  
`PanelPageTransition` ve kritik `FadeIn`/`EditorialCard` motion’larında `prefers-reduced-motion: reduce` ise animasyonu kapat (opacity anında / transition 0). Lenis zaten saygılı.

**Done when:** OS reduced-motion açıkken panel zıplamıyor / fade yok.

---

## B · Deep UX — Tasklist

### B1 — Events read API + UI bağla
**Prompt:**  
`GET /api/events` → `eventsTable` listesi (upcoming önce). Seed yoksa boş dizi + UI empty state. `Events.tsx` ve Dashboard mock events’i fetch’e taşı; hata/loading durumları mono tipografi ile. Auth cookie opsiyonel (üye paneli için session zorunlu ise `requireSession` kullan). Markayı bozma.

**Done when:** Panel Events sayfası API’den geliyor; DB boşsa dürüst empty state.

### B2 — Courses read API + UI bağla
**Prompt:**  
`GET /api/courses` → `coursesTable`. Dashboard + Courses sayfası mock’u API’ye bağla. Progress yoksa `progressPct: 0`. Empty/loading/error.

**Done when:** Courses listesi API’den; Dashboard kurs sayısı tutarlı.

### B3 — Signal session user (P1 hızlı)
**Prompt:**  
`Signal.tsx` içinde `userId: "admin"` kaldır; `/api/auth/me` veya session’daki kullanıcı id/email gönder. API key yoksa mevcut demo fallback kalsın.

**Done when:** Hardcoded admin userId yok.

### B4 — (A2 ile ortak) Invite gate
Aynı A2.

---

## Uygulama sırası

```
1. A1 Applications body-lock
2. A2/B4 Invite gate (API + PanelLogin + env)
3. B1 Events API + Events.tsx + Dashboard slice
4. B2 Courses API + Courses.tsx + Dashboard slice
5. A3 reduced-motion
6. B3 Signal session user
7. Instance MD’leri güncelle (yapıldı işaretle)
```

---

## Başarı kriterleri

- [x] Register invite olmadan kapalı  
- [x] Events + Courses en az read path canlı  
- [x] Applications drawer scroll lock  
- [x] reduced-motion saygılı  
- [x] Signal hardcoded admin yok  
- [x] Marka token / radius ihlali yok  

---

## Uygulama notu (2026-07-22)

Sprint uygulandı:
- A1 `Applications.tsx` body-lock + z-40/50  
- A2/B4 `INVITE_PASSCODE` + register/Google gate + `PanelLogin` davet alanı  
- B1/B2 `GET /api/events` + `GET /api/courses` (`catalog.ts`), UI + Dashboard fetch  
- A3 `useReducedMotion` FadeIn / PanelPageTransition / EditorialCard  
- B3 Signal `/api/auth/me` userId  

*Plan version: 1.1 — applied*
