---
paths:
  - "src/utils/permissions.ts"
  - "src/features/auth/**/*.ts"
  - "src/features/auth/**/*.tsx"
  - "src/features/access-control/**/*.ts"
  - "src/features/access-control/**/*.tsx"
  - "src/constants/api-endpoints.ts"
  - "src/constants/error-codes.ts"
---

# RBAC / permissions — backend is the source of truth

`src/utils/permissions.ts` (`PERMISSIONS` constant) must exactly match `PredefinedPermissions.java`
in `unisage-backend` (`<RESOURCE>_<ACTION>`, upper snake case). Check that file before adding or
renaming a permission — don't invent a permission key for a feature the backend doesn't expose yet;
it'll never actually match anything a real role holds.

- `src/constants/api-endpoints.ts`: every API path lives here under a namespace (e.g.
  `API_ENDPOINTS.rbac.roles`), not as inline strings scattered across each `*-api.ts`.
- `src/constants/error-codes.ts`: maps backend error codes (`ErrorCode.java`) to FE-owned Vietnamese
  messages instead of showing the backend's raw message. Add an entry here whenever the backend adds
  a new `ErrorCode`.
