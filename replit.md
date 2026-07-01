# inner.hub

A restrained, editorial, invitation-only private community website for inner.hub — a private community for founders, investors, and researchers based in İstanbul.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/inner-hub run dev` — run the frontend (port 23124)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Required env: `ADMIN_PASSCODE` — passcode for the /requests admin view

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/invitationRequests.ts` — DB schema for invitation requests
- `artifacts/inner-hub/src/pages/Home.tsx` — main landing page
- `artifacts/inner-hub/src/pages/Requests.tsx` — admin view (passcode gated)
- `artifacts/inner-hub/src/components/SignatureMark.tsx` — inner■hub logo lockup
- `artifacts/inner-hub/src/components/FadeIn.tsx` — scroll-triggered animation wrapper
- `artifacts/api-server/src/routes/invitations.ts` — POST /api/request + GET /api/requests

## Architecture decisions

- The Express API server handles all backend logic (invitation storage, admin view). The frontend is a pure React SPA that calls `/api/*` endpoints.
- The `/api` path is routed to the Express api-server by the shared proxy; the inner-hub frontend lives at `/`.
- Honeypot spam protection: a hidden `company` field is submitted with the form; if filled, the server silently accepts but does not persist.
- Simple in-memory rate limiting (3 req / 15 min per IP) on the invitation endpoint.
- Admin passcode lives in `ADMIN_PASSCODE` env secret, never hardcoded. The `/requests` admin page gates behind a sessionStorage-cached passcode.

## Product

- Public editorial landing page: hero, principles, gathering announcement
- Invitation request form with server-side validation and spam protection
- Protected admin view at `/requests` listing all submissions

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm run typecheck:libs` after changing `lib/*` schema or exports before checking artifact typechecks.
- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` then `pnpm run typecheck:libs`.
- Google Fonts `@import url(...)` must be the very first line of `index.css` — before `@import "tailwindcss"`.
- The shared proxy routes `/api` to the Express server, so Next.js-style API route handlers at `/api/*` in the frontend would be shadowed.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
