---
name: Preloader/wipe transform residue
description: CSS transform-based exit wipes (e.g. translateY(-100%)) can leave a sliver of the wipe element visible after the transition ends
---

A full-screen overlay animated off-screen with `transform: translateY(-100%)` can leave a thin residual bar (sub-pixel rounding / compositing edge) visible at the boundary after the transition completes, even though the element is technically "off-screen".

**Why:** Browsers don't always clear the last fractional pixel row/column of a transformed element cleanly, especially when the transition end triggers a re-render or the element still participates in layout (e.g. `display` not switched).

**How to apply:** When building preloaders, curtain reveals, or wipe transitions with `transform: translate(...)`, overshoot the exit distance (e.g. `-110%` instead of `-100%`) and pair it with a delayed `visibility: hidden` (transitioned after the transform completes) so the element is fully removed from paint once off-screen. Verify visually with a screenshot after the transition settles, not just via code review.
