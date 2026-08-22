# UniSage Web

Frontend for UniSage, an academic knowledge and student-support platform. React 19 + Vite, English UI/codebase.

## Commands

```bash
pnpm dev                                   # Dev server
pnpm build                                 # tsc -b && vite build
pnpm preview                               # Preview production build
pnpm test           |  pnpm test:watch     # Vitest
pnpm test:e2e                              # Playwright
pnpm lint && pnpm format && pnpm typecheck # Run before push/commit
pnpm storybook                             # Component workshop, port 6006
```

Requirement: **pnpm** (pinned via `packageManager` in `package.json`) — no npm/yarn.
Pre-commit (Husky) runs `lint-staged`: `eslint --fix` + `prettier` on staged files.

## Architecture

Layered: **Routes (thin) → Pages → Features (components/hooks/api) → lib**. Detail in
[docs/architecture.md](docs/architecture.md).

- `src/routes/` — route definitions per area (`auth`, `user`, `ingester`, `system-admin`).
- `src/pages/` — thin route entry components; compose feature components, no business logic.
- `src/features/<feature>/` — components/hooks/api/queries/schemas per feature, exposed through
  that feature's `index.ts` barrel.
- `src/components/ui/` — shadcn primitives only (generated, no business logic).
  `src/components/shared/` — cross-feature composed components.
- `src/lib/` — framework integration: `axios-client.ts`, `query-client.ts`, `utils.ts` (`cn()`).
- `src/constants/paths.ts` — route path constants (`ROUTES`). `src/constants/query-policies.ts` —
  named TanStack Query gc/stale-time presets (`detail`, `list`, `infinite`, `realtime`, `static`).
- `src/layouts/` — route-level layout shells. `src/hooks/`, `src/utils/` — generic reusable code.

Path alias `@/*` → `./src/*` (configured in `vite.config.ts` and `tsconfig.app.json`).

## Conventions

- **Data fetching**: TanStack Query only, keyed via each feature's `queries/keys.ts`, cached per
  `QUERY_POLICIES` in `src/constants/query-policies.ts` — don't invent ad-hoc `staleTime`s.
- **Style**: Tailwind utility classes + `cn()` (`src/lib/utils.ts`) only. No inline `style=`, no
  CSS-in-JS. Theme via `next-themes` + Tailwind tokens (`src/styles/index.css`).
- **TypeScript**: no `any`, no `@ts-ignore`. Forms via `react-hook-form` + `zod` schemas under
  `src/features/<feature>/schemas/`.
- **Components**: function components, no `React.FC`. Keep route `pages/*` thin — real logic
  belongs in `src/features/<feature>`.
- **UI kit**: only add primitives via shadcn conventions (see
  `.claude/skills/shadcn-ui/`) — don't hand-roll a component that already exists there.

### Adding a feature

`schemas` → `api` → `queries/keys.ts` → `queries/options.ts` + `use-queries`/`use-mutations` →
`hooks` → `components` → `pages` → `routes`. Export the public surface through
`src/features/<feature>/index.ts`.

## UI rules (compulsory)

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

## Frontend skills

Consult before diverging from established patterns under `src/`:

- `.claude/skills/react-best-practices/` — performance, rendering, and data-fetching rules.
- `.claude/skills/composition-patterns/` — component API and state-sharing patterns.
- `.claude/skills/react-components/` and `.claude/skills/shadcn-ui/` — component conventions and
  the shadcn primitive catalog.
- `.claude/skills/tanstack-query/` — query key structure, caching, and mutation rules.
- `.claude/skills/playwright/` and `.claude/skills/storybook-setup/` — e2e and story conventions.
- `.claude/skills/frontend-design-review/` — checklist for reviewing UI changes.

See [docs/skills.md](docs/skills.md) for how the skill mechanism works and the full list.

## Architecture Decision Records (ADR)

Write an ADR under `docs/adr/` (copy `docs/adr/0000-template.md`, number it sequentially) when a
change:

- Picks between two or more real alternatives for a cross-cutting concern (state management
  approach, caching strategy, folder/layering convention, a new dependency that replaces a
  hand-rolled pattern or vice versa).
- Is likely to be questioned or "fixed back" later by someone who doesn't know why it was done
  this way.
- Would be expensive to reverse once other code depends on it.

Don't write one for routine feature work, bug fixes, or just following an existing convention —
that's what `docs/architecture.md` and this file are for. If a later decision replaces an earlier
ADR, mark the old one `Status: superseded by NNNN` rather than deleting it.

## Git workflow

Apply `.claude/skills/git-commit-instructions/SKILL.md` before any branch, commit, or PR
operation (branch naming, commit format, `main` stays common-only). Apply
`.claude/skills/git-guardian/SKILL.md` before staging anything, and `.claude/skills/pr/SKILL.md`
when opening a PR (uses `.github/pull_request_template.md`). Never commit or push without explicit
instruction.

## Environment

- `VITE_*` = exposed to the client (e.g. `VITE_API_BASE_URL`). Never put secrets behind this
  prefix.
- File: `.env.local` (dev, gitignored). New variable → also update `.env.example`.

## Checklist before commit/PR

- `pnpm lint && pnpm format:check && pnpm typecheck` clean; `pnpm build` succeeds.
- No `console.log`, dead code, `@ts-ignore`, or `any`.
- Data fetching goes through TanStack Query with a declared query key/policy, not raw `fetch` in
  an effect.
- New env var added to `.env.example`; no `.env*` committed.
- UI changes: mobile (375px) + desktop screenshots captured, compared against any provided design,
  and scroll-in animation present on each section — see "UI rules (compulsory)" above.

## Verification matrix

- React logic or components: `pnpm run test`, `pnpm run lint`, `pnpm run build`.
- Routes, auth, permissions, or user interaction: also `pnpm run test:e2e`.
- Skills or PR templates: `quick_validate.py` for each skill, plus `git diff --check`.

See [docs/testing.md](docs/testing.md) for which layer (unit, component, Storybook, e2e) a given
change should be tested at.

Never claim a check ran when it did not.
