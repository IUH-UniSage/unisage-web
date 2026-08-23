What to verify before any commit or PR, and how to know a check actually ran.

- `pnpm lint && pnpm format:check && pnpm typecheck` clean; `pnpm build` succeeds.
- No `console.log`, dead code, `@ts-ignore`, or `any`.
- Data fetching goes through TanStack Query with a declared query key/policy, not raw `fetch` in
  an effect.
- New env var added to `.env.example`; no `.env*` committed.
- UI changes: mobile (375px) + desktop screenshots captured, compared against any provided design,
  and scroll-in animation present on each section — see `ui-rules.md` in this directory.

## Verification matrix

- React logic or components: `pnpm run test`, `pnpm run lint`, `pnpm run build`.
- Routes, auth, permissions, or user interaction: also `pnpm run test:e2e`.
- Skills or PR templates: `quick_validate.py` for each skill, plus `git diff --check`.

See [docs/testing.md](../../docs/testing.md) for which layer (unit, component, e2e) a given
change should be tested at, scoped for a 2-person team.

Never claim a check ran when it did not.

## Keep verification proportional

Don't run the full matrix or capture a screenshot for every micro-adjustment. A 1-2px CSS nudge
or copy tweak doesn't need its own before/after screenshot cycle — a quick `eval`/computed-style
check (or just reasoning about the change) is enough; save screenshots for changes a user would
actually notice. Don't re-read a file immediately after editing it "to confirm" — Edit/Write
already error on failure. When unsure whether a check is worth running, it's fine to skip it
rather than default to running everything.
