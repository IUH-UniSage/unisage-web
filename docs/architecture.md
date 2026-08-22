# Architecture

## Folder structure

```
src/
  app/            App-level composition: providers, route fallback
  assets/         Static assets imported by components
  components/
    ui/           shadcn primitives (generated, low-level, no business logic)
    shared/       Cross-feature composed components
  constants/      Route paths, query policies
  features/       Feature modules (components/hooks/api per feature)
  hooks/          Generic reusable hooks
  layouts/        Route-level layout shells
  lib/            Framework integration: axios client, query client, cn()
  pages/          Thin route entry components that compose features
  routes/         Route definitions per area (auth/user/ingester/admin)
  styles/         Tailwind entry stylesheet and design tokens
  test/           Vitest setup, fixtures, and mocks
  utils/          Pure utility functions (date, uuid, file-size, storage)
```

## Conventions

- Route pages stay thin: they compose feature components, not implement
  business logic directly.
- Business logic and API calls live under `src/features/<feature>`, exposed
  through that feature's `index.ts` barrel.
- `src/components/ui` holds only shadcn-generated primitives; app-specific
  composed components live under `src/components/shared`.
- Data fetching goes through TanStack Query with query keys and cache
  policies defined in `src/constants/query-policies.ts`.
- Path aliases resolve `@/*` to `src/*` (configured in `vite.config.ts` and
  `tsconfig.app.json`).

## Areas

The app serves four route areas, each with its own layout:

- **User** (`/`, `/chat`, ...) - authenticated end-user experience
- **Auth** (`/login`, `/register`) - sign-in/sign-up
- **Ingester** (`/ingester`) - document ingestion workflows
- **System Admin** (`/admin`) - platform administration

Auth/permission guards, API integration, and feature business logic are
intentionally out of scope for this initialization branch and land in
follow-up feature branches.
