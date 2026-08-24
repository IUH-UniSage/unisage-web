# 1. Add a second fixed axios client (`aiHttpClient`) for the AI agent's Gateway route

Status: accepted

## Decision

`unisage-web` uses two fixed axios instances behind the same Gateway: `httpClient` (existing,
`baseURL` = Gateway's `/api/v1/master` route, backed by `backend-java`) and `aiHttpClient` (new,
`baseURL` = Gateway's `/api/v1/ai` route, backed by `unisage-agent`). Every future feature that
calls `unisage-agent` uses `aiHttpClient`, not `httpClient`.

## Context

Both `backend-java` and `unisage-agent` sit behind the same API Gateway, on two different route
prefixes (`/api/v1/master/**` and `/api/v1/ai/**`, see `api-gateway/application.yml`). The
ingestion wizard (`ingest-preview-chunk-embed-resume`) is the first feature in this codebase that
needs to call `unisage-agent` at all — until now `httpClient`'s `baseURL` only ever needed to point
at one backend. A decision was needed for how a second backend behind the same Gateway gets called
from the frontend, and it's the kind of decision later code will implicitly depend on (every
`*-api.ts` that calls `unisage-agent` inherits whichever pattern gets picked here), so it's
recorded rather than left as an implicit convention only visible by reading `ai-client.ts`.

## Alternatives considered

- **One `httpClient` with a per-request `baseURL` override** — rejected. Every call site would
  need to remember to pass the AI route's `baseURL` explicitly; forgetting it silently sends the
  request to the Java route instead (wrong 404, not an obvious error), and once several features
  depend on the override pattern it's harder to walk back than adding a second fixed client is
  today.
- **Two entirely separate axios instances, each with its own interceptor stack (copy-pasted)** —
  rejected. Both clients need the same `Accept-Language` request header and the same 401 ->
  refresh-token-via-Java -> retry-once response behavior (the refresh cookie and the
  `POST /auth/refresh` endpoint are Java's regardless of which client triggered the 401 — there's
  only one login session, not one per backend). Copy-pasting the interceptor logic risks the two
  copies drifting out of sync, and two independent in-flight-refresh trackers could race each
  other into firing two concurrent refresh calls for the same expired session.
- **Two fixed clients sharing one interceptor factory (chosen)** — `axios-client.ts` now exports
  `createAuthenticatedClient(baseURL)`, which both `httpClient` and the new `aiHttpClient` are
  built from. Same `Accept-Language` header, same refresh-and-retry behavior, and the same
  module-level in-flight-refresh promise is shared across both clients, so a 401 from either one
  triggers at most one refresh call. Each call site's `baseURL` is fixed and explicit (`httpClient`
  vs `aiHttpClient`), so misrouting a request is a compile-time import choice, not a silently wrong
  runtime string.

## Consequences

- Any new `*-api.ts` module that calls `unisage-agent` must import `aiHttpClient` from
  `src/lib/ai-client.ts`, mirroring how existing `*-api.ts` modules import `httpClient` from
  `src/lib/axios-client.ts` — this is now the established pattern, not something to reinvent per
  feature.
- A third backend behind the Gateway (if one is ever added) follows the same shape: one more fixed
  client built from `createAuthenticatedClient(baseURL)`, not a third bespoke interceptor stack.
- `VITE_AI_API_BASE_URL` joins `VITE_API_BASE_URL` as a required env var (`.env.example`) — both
  must point at the Gateway, never directly at a backend's own port, same rule `environment.md`
  already states for `VITE_API_BASE_URL`.
- If the two backends' auth models ever diverge (e.g. `unisage-agent` gets its own independent
  session/refresh flow instead of sharing Java's), `createAuthenticatedClient` would need a second,
  differently-behaved factory — this decision assumes one shared session across both backends,
  which holds as of this ADR (both are IdP'd through the same Java-issued JWT + refresh cookie).
