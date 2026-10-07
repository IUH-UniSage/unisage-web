# 2. Use driver.js for staff workspace product tours

Status: accepted

## Decision

Product tours in the staff workspaces (`/admin`, `/ingester`) are built on
[driver.js](https://driverjs.com/) (MIT, framework-agnostic), wrapped by
`src/features/product-tour`, with steps pointing at `data-tour` anchors from
`src/constants/tour-anchors.ts`.

## Context

Staff need a guided walkthrough of each management page the first time they
open it, replayable from the header. A tour needs a spotlight overlay, a
positioned popover that follows its target across scroll/resize, keyboard
control and step navigation - none of which the shadcn primitive set covers.

## Alternatives considered

- **react-joyride** — React-specific and the most popular option, but its
  React 19 support has lagged behind releases, and it ships its own styling
  system that fights Tailwind tokens.
- **Hand-rolled on Radix Popover** — no new dependency, but we would own the
  overlay cut-out, scroll-into-view, repositioning and focus handling; a lot
  of fiddly code for a non-core feature.
- **driver.js (chosen)** — small, no framework coupling (so React upgrades
  don't block it), plain CSS classes we can theme from `index.css` tokens,
  and it accepts DOM elements directly, which lets us drop steps whose
  anchor isn't rendered (permission-gated buttons, hidden-at-breakpoint UI)
  before the tour starts.

## Consequences

- Tour content lives in `src/features/product-tour/tours/staff-tours.ts`,
  keyed by `FEATURE_REGISTRY` key. A new sidebar page gets a tour by adding
  an entry there and `data-tour` anchors on its elements.
- Shown-tour state is per-browser `localStorage`
  (`unisage_product_tour_seen`); moving it to the backend later would only
  touch `utils/tour-storage.ts`.
- e2e specs mark every tour as seen by default (`e2e/support/auth.ts`) so the
  overlay doesn't block other tests; that key list must grow with
  `PAGE_TOURS`.
- Reversing this means replacing `use-product-tour.ts` and the
  `.unisage-tour` styles; tour content and anchors are library-agnostic.
