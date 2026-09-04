Convention for view-detail and create/edit screens of a single entity.

Viewing or editing a single entity must be addressable by a URL path param — never by
component-local dialog/modal `useState` alone. A screen driven only by in-memory state has no URL
of its own: refreshing loses it, it can't be linked or shared, and browser back/forward doesn't
work.

Pattern, under the entity's existing list segment:

- `/<segment>/:id` — view detail
- `/<segment>/new` — create
- `/<segment>/:id/edit` — edit

Precedent: the ingest wizard (`/admin/documents/:documentId/ingest`,
`/ingester/processing/:documentId`) reads the id via `useParams` and fetches the entity with a
dedicated query (see `src/pages/ingester/ingest-wizard-page.tsx` +
`useDocumentQuery` in `src/features/documents/queries/use-queries.ts`). Users, Roles and Documents
detail/create/edit routes follow the same shape — see `src/routes/system-admin.routes.tsx` /
`src/routes/ingester.routes.tsx` for how these are registered as sibling entries alongside the
`FEATURE_REGISTRY`-generated list route, and `src/constants/paths.ts` for the path-builder
helpers (`adminDocumentIngestWizardPath` etc. — add new helpers there, don't hand-build path
strings at the call site).

Navigate to these routes with `useNavigate()`/`<Link>`, not local `useState` + conditional
rendering swapping the list body out for a detail/form component.

Exempt: true transient confirmation/status modals acting on an already-loaded row (delete
confirm, activate/deactivate toggles) — these aren't navigable views and can stay as local dialog
state.
