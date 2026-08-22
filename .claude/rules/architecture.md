Folder layering and where each kind of code lives.

Layered: **Routes (thin) → Pages → Features (components/hooks/api) → lib**. Detail in
[docs/architecture.md](../../docs/architecture.md).

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

## Adding a feature

`schemas` → `api` → `queries/keys.ts` → `queries/options.ts` + `use-queries`/`use-mutations` →
`hooks` → `components` → `pages` → `routes`. Export the public surface through
`src/features/<feature>/index.ts`.
