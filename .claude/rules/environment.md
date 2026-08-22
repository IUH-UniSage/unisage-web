Environment variable rules and the backend/gateway routing they must point at.

- `VITE_*` = exposed to the client (e.g. `VITE_API_BASE_URL`). Never put secrets behind this
  prefix.
- File: `.env.local` (dev, gitignored). New variable → also update `.env.example`.
- `VITE_API_BASE_URL` must point at the **API Gateway** (`unisage-gateway`, port 8400) with the
  `/api/v1/master` prefix, not directly at `unisage-backend` (port 8401). The gateway rewrites
  `/api/v1/master/**` to the backend's `/api/v1/**`.
