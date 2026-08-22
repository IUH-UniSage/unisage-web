# Testing

Four tools, each covering a different layer. Right now the repo only has two real test files
(`src/utils/utils.test.ts`, `e2e/foundation.spec.ts`) — the tooling is fully wired up ahead of the
features that will need it, per the "Adding a feature" order in [AGENTS.md](../AGENTS.md).

## Layers

| Layer              | Tool                                                     | Lives in               | Command              |
| ------------------ | -------------------------------------------------------- | ---------------------- | -------------------- |
| Unit (pure logic)  | [Vitest](https://vitest.dev/)                            | `src/**/*.test.ts(x)`  | `pnpm run test`      |
| Component behavior | Vitest + [Testing Library](https://testing-library.com/) | `src/**/*.test.tsx`    | `pnpm run test`      |
| Component workshop | [Storybook](https://storybook.js.org/)                   | `src/**/*.stories.tsx` | `pnpm run storybook` |
| End-to-end         | [Playwright](https://playwright.dev/)                    | `e2e/**/*.spec.ts`     | `pnpm run test:e2e`  |

Test files are colocated next to the code they cover (e.g. `date.ts` + a test would live at
`src/utils/date.test.ts`), not in a parallel `__tests__/` tree.

## What to test where

- **Unit**: pure functions with no DOM — `src/lib/`, `src/utils/`, schema validation, formatters.
  Fast, no rendering. This is most of what exists today (`utils.test.ts` covers `formatFileSize`,
  `formatDate`, `generateId`).
- **Component behavior**: a component's observable output and interactions, via Testing Library
  queries (`getByRole`, `userEvent`) — not implementation details like internal state or class
  names. Add these alongside a component once it has real logic (conditional rendering, form
  validation, event handling) worth asserting on.
- **Storybook stories**: a story per meaningful visual/interaction state of a shared or
  `components/ui` component (default, loading, error, empty, ...). `@storybook/addon-vitest` runs
  stories as tests in CI; `@storybook/addon-a11y` flags accessibility issues per story. See
  `.claude/skills/storybook-setup/`.
- **E2E (Playwright)**: cross-page user flows that only make sense assembled — sign-in, a
  protected route redirecting, a multi-step form submit. Per the verification matrix in
  `AGENTS.md`, run these specifically for routes, auth, permissions, or user interaction changes
  — not for every change, since they're the slowest layer. `playwright.config.ts` runs against
  both `desktop-chromium` and `mobile-chromium` projects and boots the dev server itself
  (`webServer`), so `pnpm run test:e2e` works standalone.

## Mocking

[msw](https://mswjs.io/) is installed for mocking HTTP calls in unit/component tests, but no
handlers exist yet — `src/test/mocks/` and `src/test/fixtures/` are placeholder folders
(`.gitkeep`) for request handlers and sample data once a feature has real API calls to mock.
`src/test/setup.ts` registers `@testing-library/jest-dom` matchers globally for all Vitest tests.

## Config reference

- `vite.config.ts` → `test` block: `jsdom` environment, `v8` coverage provider, excludes `e2e/**`
  (Playwright has its own runner).
- `playwright.config.ts`: `testDir: ./e2e`, retries only in CI, HTML reporter.
- `.storybook/main.ts`: story glob `src/**/*.stories.@(ts|tsx)`, `addon-a11y` + `addon-vitest`.

## Commands

```bash
pnpm run test           # Vitest, single run
pnpm run test:watch     # Vitest, watch mode
pnpm run test:coverage  # Vitest with coverage report
pnpm run test:e2e       # Playwright
pnpm run storybook      # Component workshop, port 6006
```
