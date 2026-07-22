# inner·hub

Private, invitation-only community platform for founders, builders, and investors. Istanbul-based, AI-focused.

---

## Overview

inner·hub is a closed-circle community platform built for operators — people who build companies, lead teams, and move capital. It is not a public network. Access is by invitation only.

The platform is organized around a growing suite of tools:

| Module | Description |
|---|---|
| **inner·signal** | AI-powered deal and opportunity feed |
| **inner·match** | Co-founder, mentor, and investor matching |
| **inner·capital** | Private deal flow and investment pipeline |
| **inner·vault** | Shared knowledge base and document library |
| **inner·pulse** | Ecosystem signal dashboard |
| **inner·id** | Portable verified membership identity |
| **inner·api** | Platform API for integrations and partners |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| Routing | Wouter v3 |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives |
| State / Data | TanStack Query |
| Forms | React Hook Form + Zod |
| Database Schema | Drizzle ORM (PostgreSQL) |
| Package Manager | pnpm (workspaces) |

---

## Brand System

```
--ink:          #0A0A0A   (primary text, backgrounds)
--bone:         #F4F1EC   (surface, light backgrounds)
--inner-green:  #18FF85   (logo, live indicators, selection)
--error:        #B4553B   (destructive states)
--radius:       0rem      (zero border-radius everywhere)
```

**Typography**
- Display: Fraunces Thin 100 — `fontVariationSettings: "'opsz' 144, 'WONK' 1, 'SOFT' 0"`
- Body: Inter Tight
- Metadata / Code: JetBrains Mono

---

## Project Structure

```
Inner-Hub/
├── artifacts/
│   ├── inner-hub/          # React frontend (main app)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── panel/  # PanelShell, PanelNav, PanelLogin
│   │       │   └── ui/     # Radix-based design system
│   │       └── pages/
│   │           ├── Home.tsx
│   │           ├── Requests.tsx
│   │           └── panel/  # All authenticated panel pages
│   └── api-server/         # Express backend
│       └── src/routes/     # REST API routes (ai, payments, etc.)
├── lib/
│   └── db/src/schema/      # Drizzle ORM schema definitions
└── scripts/                # Build and prerender scripts
```

---

## Panel Pages

| Route | Page | Access |
|---|---|---|
| `/panel` | Dashboard | Member |
| `/panel/chat` | Topluluk Chat | Member |
| `/panel/courses` | Kurslarım | Member |
| `/panel/events` | Etkinlikler | Member |
| `/panel/members` | Katılımcılar | Member |
| `/panel/perks` | Ayrıcalıklar | Member |
| `/panel/signal` | inner·signal | Member |
| `/panel/match` | inner·match | Member |
| `/panel/capital` | inner·capital | Member |
| `/panel/vault` | inner·vault | Member |
| `/panel/pulse` | inner·pulse | Member |
| `/panel/id` | inner·id | Member |
| `/panel/api` | inner·api | Member |
| `/panel/profile` | Profilim | Member |
| `/panel/membership` | Üyelik | Member |
| `/panel/faq` | SSS | Member |
| `/panel/settings` | Ayarlar | Member |
| `/panel/analytics` | Analytics | Admin only |
| `/panel/applications` | Başvurular | Admin only |

---

## Getting Started

**Prerequisites:** Node.js 20+, pnpm 9+

```bash
# Install dependencies
pnpm install

# Start frontend dev server
cd artifacts/inner-hub
pnpm dev

# Start API server
cd artifacts/api-server
pnpm dev
```

The frontend runs at `http://localhost:5173`.

**Dev credentials**
```
Email:    admin@inner.digital
Password: inner2026
```

Auth state is persisted in `sessionStorage` under the key `inner_session`.

---

## Authentication

The platform uses a session-based auth guard. On load, `PanelApp` reads `sessionStorage["inner_session"]` and expects:

```json
{
  "email": "...",
  "name": "...",
  "role": "member" | "admin"
}
```

Admin role unlocks Analytics and Applications routes. All other panel routes require any authenticated session.

---

## Revenue Model

inner·hub operates across six revenue layers:

1. **Direct Membership** — Founding member pricing, annual subscriptions, corporate seats
2. **Events** — Gathering tickets, sponsorships, paid workshops
3. **Perks Ecosystem** — Partner listing fees, affiliate commissions, featured placement
4. **inner·studio** — Product development retainers and revenue share
5. **inner·capital** — SPV coordination, demo day slots, carry
6. **Marketplace** — Talent board, mentor hours, project matching

---

## Design Principles

- Zero border-radius across all surfaces
- inner-green is used exclusively for: logo square, live indicators, text selection, progress bars — never for buttons
- FadeIn animation only on page headers, never on content grids
- Slide-over panels for detail views (Capital deals, Applications, Member profiles)
- All display headings use Fraunces with `fontWeight: 100`

---

## License

Private. All rights reserved. Not open for public contribution.
