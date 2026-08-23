# Testing

Three tools, each covering a different layer. Right now the repo only has two real test files
(`src/utils/utils.test.ts`, `e2e/foundation.spec.ts`) — the tooling is fully wired up ahead of the
features that will need it, per the "Adding a feature" order in [AGENTS.md](../AGENTS.md).

Storybook was removed (2025-08): with a 2-person team who both already know the codebase, a
separate component-preview tool wasn't worth its setup/maintenance cost — running `pnpm dev` and
looking at the real page covers the same need.

## Layers

| Layer              | Tool                                                     | Lives in              | Command             |
| ------------------ | -------------------------------------------------------- | --------------------- | ------------------- |
| Unit (pure logic)  | [Vitest](https://vitest.dev/)                            | `src/**/*.test.ts(x)` | `pnpm run test`     |
| Component behavior | Vitest + [Testing Library](https://testing-library.com/) | `src/**/*.test.tsx`   | `pnpm run test`     |
| End-to-end         | [Playwright](https://playwright.dev/)                    | `e2e/**/*.spec.ts`    | `pnpm run test:e2e` |

Test files are colocated next to the code they cover (e.g. `date.ts` + a test would live at
`src/utils/date.test.ts`), not in a parallel `__tests__/` tree.

## What to test where — scoped for a 2-person team

Two people touching the same code means the main value of a test is **catching a regression when
the other person changes something you depend on** — not exhaustive coverage. Spend effort where
that risk is real; skip it where it isn't.

- **Unit — write this for shared logic.** Pure functions with no DOM that both of you rely on:
  permission checks (`src/utils/permissions.ts`), API response parsing
  (`src/utils/api-response.ts`), Zod schemas, formatters. Cheap to write, and this is exactly the
  code where a silent break by the other person's change is expensive (security, data
  correctness). Skip it for one-off helpers only one of you touches.
- **Component behavior — only for shared/critical components.** Testing Library
  (`getByRole`, `userEvent`) on a component's observable behavior — not implementation details
  like internal state. Write these for components with real logic that both of you build on top
  of (auth forms, a shared dialog with validation) — not for every component, and not for
  presentational ones (badges, logos, static layout).
- **E2E (Playwright) — core flows only, not every corner.** Cross-page flows that only make sense
  assembled: sign-in, a protected route redirecting, the main CRUD flow of a feature. This is the
  layer most likely to catch "my change broke your feature," so keep the handful of flows that
  actually integrate both people's work — don't add a spec per minor UI state, since it's the
  slowest layer and multiplies maintenance cost fastest. Per the verification matrix in
  `AGENTS.md`, run these specifically for routes, auth, permissions, or user-interaction changes.
  `playwright.config.ts` runs against both `desktop-chromium` and `mobile-chromium` projects and
  boots the dev server itself (`webServer`), so `pnpm run test:e2e` works standalone.

## Mocking

[msw](https://mswjs.io/) is installed for mocking HTTP calls in unit/component tests, but no
handlers exist yet — `src/test/mocks/` and `src/test/fixtures/` are placeholder folders
(`.gitkeep`) for request handlers and sample data once a feature has real API calls to mock.
`src/test/setup.ts` registers `@testing-library/jest-dom` matchers globally for all Vitest tests.

## Config reference

- `vite.config.ts` → `test` block: `jsdom` environment, `v8` coverage provider, excludes `e2e/**`
  (Playwright has its own runner).
- `playwright.config.ts`: `testDir: ./e2e`, retries only in CI, HTML reporter.

## Commands

```bash
pnpm run test           # Vitest, single run
pnpm run test:watch     # Vitest, watch mode
pnpm run test:coverage  # Vitest with coverage report
pnpm run test:e2e       # Playwright
```
