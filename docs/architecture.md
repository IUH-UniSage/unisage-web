# UniSage frontend architecture

## Architecture rule

UniSage uses a feature-based architecture with thin route pages:

- `pages` are route entry points and should only compose or re-export a feature
  screen.
- `features` own business UI, API functions, query keys, mutations, schemas,
  types, and feature-local hooks.
- `components/ui` contains generated shadcn primitives.
- `components/shared` contains UniSage components reused by multiple features.
- `hooks` is reserved for truly global hooks.
- `lib` contains framework-level clients and cross-domain utilities.

Google Stitch remains the visual source of truth. The codebase remains the
implementation source of truth.

## Source layout

```text
src/
  main.tsx
  App.tsx

  app/
    app-providers.tsx
    app-route-fallback.tsx

  routes/
    index.tsx
    auth.routes.tsx
    user.routes.tsx
    ingester.routes.tsx
    system-admin.routes.tsx
    private-route.tsx
    permission-route.tsx

  layouts/
    auth-layout.tsx
    user-layout.tsx
    ingester-layout.tsx
    system-admin-layout.tsx

  pages/
    auth/
    user/
    ingester/
    system-admin/
    errors/
    shared/

  features/
    auth/
    chat/
    conversations/
    knowledge/
    support-tickets/
    notifications/
    profile/
    documents/
    ingestion/
    taxonomy/
    knowledge-packages/
    users/
    access-control/
    model-management/
    retrieval-evaluation/
    analytics/
    audit-log/
    system-settings/
    system-health/

  components/
    ui/
    shared/

  lib/
    axios-client.ts
    query-client.ts
    permissions.ts
    utils.ts

  hooks/
  constants/
  styles/
  assets/
  test/
    setup.ts
    mocks/
    fixtures/
```

## Feature anatomy

Add only the folders a feature actually needs:

```text
features/documents/
  api/
    documents.api.ts
  components/
    document-list.tsx
  queries/
    keys.ts
    options.ts
    use-queries.ts
    use-mutations.ts
  schemas/
    document.schema.ts
  types/
    document.types.ts
  index.ts
```

Other features import only from that feature's public `index.ts` when a public
API exists. Avoid importing private internals across feature boundaries.

## Routing and access

Route objects are split by workspace. `AuthProvider` restores the cookie-backed
Backend session, `PrivateRoute` enforces authentication and role boundaries,
and `PermissionRoute` reads exact server-derived permission names.

Workspace routing follows the Backend roles:

1. `USER` enters the user and chat workspaces.
2. `INGEST_ADMIN` enters the ingestion workspace.
3. `SUPER_ADMIN` enters the system administration workspace.

The access and refresh tokens remain in `HttpOnly` cookies. Local storage keeps
only the selected profile needed for route presentation while the Backend
remains the authorization source of truth.

## Data flow

Feature query hooks call typed API modules backed by `httpClient`. Query keys
should be hierarchical arrays and live beside their domain API:

```ts
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filters: DocumentFilters) =>
    [...documentKeys.lists(), filters] as const,
}
```

Shared cache timing is defined in `constants/query-policies.ts`. Use the
`realtime`, `list`, `detail`, `infinite`, or `static` policy as appropriate.

## Shared components

The common patterns selected from the reference chat platform were rewritten for UniSage:

- `FullScreenLoading`
- `SearchAndActions`
- `SearchEmpty`
- `HelpTooltipIcon`
- `ActionButton`
- `ActionMenuItem`
- `Pagination`
- `useDebounce`

They use UniSage tokens, light mode, shadcn primitives, stable action IDs, and
accessible labels. Social/chat-specific Zalo components and legacy dark-mode
tokens were intentionally not copied.

## UI conventions

- Light mode only.
- Be Vietnam Pro for all text.
- Primary blue `#153898`, knowledge gold `#F9B200`, information sky
  `#8ED8F8`.
- Desktop staff workspaces use a 248px sidebar and a 72px top bar.
- Use Lucide icons and accessible names for icon-only controls.
- Place reusable component stories and tests beside their source.
