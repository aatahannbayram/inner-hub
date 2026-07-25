# Inner-Hub Panel Audit — Filled Instance

> Playbook: [`brand-panel-audit-playbook.md`](./brand-panel-audit-playbook.md)  
> Tarih: 2026-07-22 · Marka: inner·hub / inner.digital

Bu dosya playbook’un **doldurulmuş** örneğidir. Başka markalar için playbook’u kopyalayın; bu instance referans kalsın.

---

## Executive summary

Marka iskeleti (ink/bone/green, radius 0, Fraunces) sağlam (**8/10**). Kayma: sticky olmayan sidebar + transition y-offset + Chat scrollIntoView. Auth canlı; Courses/Events/Chat/Vault mock ağırlıklı.

## Kayma (uygulama sonrası)

| ID | Önce | Sonra |
|----|------|-------|
| C1 | Sidebar document scroll | `h-svh` shell + aside `h-full` + main `overflow-y-auto` |
| C2 | y± transition | Opacity-only |
| C3 | scrollIntoView window | messagesRef.scrollTo |
| C6 | gutter yok | `scrollbar-gutter: stable` |

## Brand chrome

- Collapse / avatar / badge → kare  
- Drawer radius → `rounded-none`  

## Görseller

- Higgsfield `soul_cinematic` ×1 (~0.12 kredi) → `/public/editorial/circle-dusk.png`  
- `EditorialCard` + Dashboard hero + spotlight  

## Backlog kalan

P0 sprint uygulandı (2026-07-22): Applications body-lock, invite gate, Events/Courses read API, reduced-motion, Signal session user.  
P1 kalan: Chat/Vault API, nav IA, Signal→aksiyon, 2. editorial set.

---

*Instance version: 1.1 — sprint applied*
