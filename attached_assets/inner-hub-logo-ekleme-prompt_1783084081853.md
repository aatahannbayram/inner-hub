# Addendum: inner.hub — wire in the brand marks

## Files (already added to `public/`)
I have uploaded these files into the project's `public/` folder — use them exactly as named:
- `inner-logo.png` — master wordmark, 400×400, Ink background
- `inner-og.png` — social preview, 1200×630
- `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` (180×180) — the green-square marks

If any file is missing, stop and tell me which one instead of substituting or generating a replacement.

## Placement rules (follow exactly — these are locked brand rules)
1. **Header stays typographic.** Do NOT put `inner-logo.png` in the header: the file has a solid Ink background and never sits on Bone. The existing Fraunces-italic `inner■hub` lockup remains the header mark.
2. **Footer (Ink):** place `inner-logo.png` at ~140px width above the mono footer line, where it sits natively on black. `alt="inner"`. Keep the monumental typographic `inner■` wordmark at the very bottom unchanged.
3. **Favicon:** wire the full set in `<head>` — `favicon-32.png` (32×32), `favicon-16.png` (16×16), `apple-touch-icon.png` (180×180). The favicon is the green square alone, never the wordmark (brand rule: below 48px, square only).
4. **Social preview:** set `og:image` and `twitter:image` (card `summary_large_image`) to the absolute URL of `inner-og.png` with `og:image:width` 1200 and `og:image:height` 630. Remove any previous og:image reference to the 400×400 file.
5. No other placements. The wordmark does not appear inside sections 01–05, on buttons, or as a watermark. Nothing about this changes copy, layout, motion, or the community-only scope.

## Definition of done
- Footer renders the PNG on Ink at ~140px; header is still typographic; favicon shows the green square in the browser tab; sharing the URL previews the 1200×630 image.
- No layout shift introduced (explicit width/height on the footer image); `alt` texts set; no console errors; no other files or copy touched.

Apply, then show me a live preview.
