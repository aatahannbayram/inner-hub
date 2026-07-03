---
name: Verifying below-the-fold SPA sections via screenshot
description: How to visually verify long single-page-app content that exceeds the screenshot tool's viewport/height limits
---

The `screenshot` tool (`app_preview`) always captures from the top of the page for a given path; there is no scroll-to-position parameter, and viewport height is capped (~3000px). For long single-page apps (marketing sites, landing pages with many sections), most of the page is unreachable by a plain screenshot.

**Why:** Native browser "scroll to `#hash` on load" only works if the target element already exists in the DOM at the moment the browser processes the URL fragment. In a React SPA, content mounts after the initial paint, so the browser's automatic anchor-scroll fires too early and silently does nothing — the page just stays at the top.

**How to apply:** Add a small `useEffect` on the page root that reads `window.location.hash` on mount, looks up the element by id, and calls `el.scrollIntoView({ block: "start" })` (wrap in `requestAnimationFrame` if needed for layout to settle). Then screenshot with `path="/#<section-id>"` to verify any section, including the footer, without needing true scroll support in the tool. This is also a legitimate UX improvement for deep-linking, not just a testing hack — keep it in production code.
