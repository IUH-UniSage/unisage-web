---
paths:
  - "src/pages/**/*.tsx"
  - "src/layouts/**/*.tsx"
  - "src/components/shared/**/*.tsx"
  - "src/features/**/components/**/*.tsx"
---

# UI rules (compulsory)

These apply to any change that touches rendered UI (a page, layout, or `components/shared`
composition — not `components/ui` primitives in isolation):

- **Screenshot verification**: after the change, run `pnpm run dev` and capture a screenshot of
  the affected page(s) (Playwright — see `.claude/skills/playwright/`) before calling the change
  done. If a design reference was provided for the task (Figma, mockup, screenshot), compare the
  capture against it explicitly and call out any mismatch rather than assuming parity. Without a
  provided reference, capture is still required as evidence the UI actually renders as intended —
  don't claim a UI change works without having looked at it.
- **Mobile-friendly**: every page/section must work at a mobile viewport (375px) as well as
  desktop (1280px) — capture both. Use Tailwind responsive utilities (`sm:`/`md:`/`lg:`), not
  fixed pixel widths that break under ~640px. No horizontal scroll, no overlapping/clipped content
  at 375px.
- **Scroll-in animation**: each top-level section of a page must animate in on scroll (not just on
  mount) — use Framer Motion's `whileInView` with `viewport={{ once: true, amount: 0.2 }}` on the
  section wrapper. Respect `prefers-reduced-motion` via Framer Motion's `useReducedMotion()`
  (skip/shorten the animation, don't force motion on users who disabled it). Don't cause layout
  shift while the section is off-screen and un-animated.
