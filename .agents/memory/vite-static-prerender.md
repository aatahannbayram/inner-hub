---
name: Vite SPA prerendering for crawlers
description: How to make a statically-served Vite React SPA return full body copy to curl/no-JS clients, without migrating to a Node SSR framework.
---

When a Vite React SPA is served in production as static files (no Node server at request time), true request-time SSR isn't possible. The fix is build-time prerendering (SSG) into the static `index.html`:

1. Add a second Vite SSR build targeting a small `entry-server.tsx` that exports a `render()` function calling `renderToString` on just the page content (wrapped in the same providers — query client, tooltip provider, etc.).
2. Build it with `vite build --ssr src/entry-server.tsx --outDir dist/server` after the normal client build.
3. Run a small Node script that imports the built SSR bundle, calls `render()`, and string-replaces the empty `<div id="root"></div>` in the already-built `dist/public/index.html` with the rendered markup. Wire this as extra steps in the package's `build` script — no artifact.toml changes needed if it already just calls `pnpm run build`.
4. Client entry keeps using `createRoot(...).render()` (not `hydrateRoot`) — this avoids hydration-mismatch errors entirely; the client just re-renders over the prerendered shell on mount. No visual behavior changes since it happens before user-visible paint in normal use.

**Why:** Migrating a static Vite SPA to a full Node SSR framework (e.g. Next.js) is a much larger change than the ask ("crawlers should see body copy"). Reusing Vite's own SSR build mode for a one-page prerender pass is the minimal fix consistent with the existing static-serving architecture.

**Gotchas found in practice:**
- Any component using `wouter`'s `<Link>` (or other router-context hooks) will throw `location is not defined` under Node SSR unless the render tree is wrapped in `<Router ssrPath="/">` from wouter — even if you're only rendering one page's content directly (not going through the full app `<Switch>/<Route>` tree).
- Components that touch browser-only APIs (`IntersectionObserver`, `window.matchMedia`, `sessionStorage`, `setInterval`) are SSR-safe as long as those calls are inside `useEffect`, not the render body — effects don't run during `renderToString`.
- To verify: build for production, then serve `dist/public` with a minimal one-off static file server (not the dev workflow — it may already own the port) and `curl` it; diff against the built file directly as a sanity check.
