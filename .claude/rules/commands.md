Package manager, common commands, and the pre-commit hook.

```bash
pnpm dev                                   # Dev server
pnpm build                                 # tsc -b && vite build
pnpm preview                               # Preview production build
pnpm test           |  pnpm test:watch     # Vitest
pnpm test:e2e                              # Playwright
pnpm lint && pnpm format && pnpm typecheck # Run before push/commit
```

Requirement: **pnpm** (pinned via `packageManager` in `package.json`) — no npm/yarn.
Pre-commit (Husky) runs `lint-staged`: `eslint --fix` + `prettier` on staged files.
