---
name: crud-feature-scaffold
description: Scaffold a full CRUD admin feature (list + filters + create/edit dialog + status toggle + bulk actions + route) from a backend API, wired exactly like the rbac (roles/permissions) feature. Use when a new backend endpoint is ready and the user wants the matching frontend feature generated instead of hand-built.
---

# CRUD feature scaffold

Generates a complete admin CRUD feature module in `unisage-web`, following the **exact** file
layout, naming, and UI composition already proven in `src/features/rbac/`. That feature is the
canonical reference — when in doubt about a pattern, open the matching file there and copy its
shape, don't invent a new one.

## 1. Gather the inputs first

Don't start writing files until these are known. Ask the user (or read the backend controller/DTO
if they point you at it) for whatever is missing:

- **Entity name**: PascalCase singular (`Department`) and the camelCase/kebab-case forms derived
  from it (`department`, `departments`, `department-list.tsx`, ...).
- **Backend base path**: e.g. `/departments`, plus whichever of these it exposes:
  - `GET` list (does it paginate server-side, or return everything like rbac does with
    `limit: 500`? Match whichever the backend actually does — don't assume.)
  - `POST` create, `PUT`/`PATCH` update, `DELETE` (or a soft-delete/deactivate + recover pair —
    rbac uses activate/deactivate, not hard delete; ask which this entity uses)
  - bulk variants (`.../bulk-delete`, `.../bulk-recover`) if the list needs bulk actions
- **Fields**: name, type, whether it's editable in the create/edit form, whether it drives a
  filter, whether it drives a badge/enum (like `ResourceType` for permissions).
- **List page behavior needed**: search box? Which filter selects (status is almost always one)?
  Bulk actions bar? A resource/category badge column? A tooltip-truncated "+N" badge column (like
  `RolePermissionBadges`)?
- **Permission keys**: the `<RESOURCE>_<ACTION>` keys from `PredefinedPermissions.java` in
  `unisage-backend` that gate create/update/delete for this entity — check that file, per
  `.claude/rules/rbac-permissions.md`. Don't invent a key the backend doesn't expose.
- **Where it mounts**: which `WorkspacePlaceholderPage` in `src/routes/*.routes.tsx` this replaces,
  and the `ROUTE_SEGMENTS`/`PERMISSION_POLICIES` entries it needs.

If the user gives you a Jira ticket, an OpenAPI spec, or a backend controller file instead of
answering directly, derive these inputs from that source and confirm your reading back to them
briefly before generating files.

## 2. Multi-task epics: one branch, commit per task

If the work spans several tasks under one Jira epic, branch once from `main` (per
`git-commit-instructions/SKILL.md` naming) and reuse that branch for every task. Per task: build
it, run section 5's verification, screenshot the affected page and compare it against `rbac`
(or an earlier screenshot of the same page), then stage only that task's real diff (`git status`/
`git diff --stat` — Windows line-ending noise and any concurrent hand-edits on this branch can
make a file show as "modified" with no real content change; verify before staging) and commit with
that task's own `[UNISAGE-N]` key. Never batch unrelated tasks into one commit, and never commit or
push without the user's explicit go-ahead each time.

## 3. Reuse, don't reimplement, these shared pieces

- `src/hooks/use-selection.ts` — `useSelection<T>()` for the row-checkbox `Set` selection state
  (`selectedIds`, `toggle`, `toggleAll`, `clear`). Use it instead of hand-rolling
  toggle/toggleAll/clear logic per entity.
- `src/components/shared/list/entity-actions-menu.tsx` — `EntityActionsMenu` for the row "..."
  dropdown. Takes `entityLabel`, `canUpdate`/`canDelete`, `isActive`, `onEdit`, `onStatusRequest`,
  an optional `onDetail` (adds a "Xem chi tiết" item with an `Eye` icon, first in the list), and an
  optional `children` slot for extra feature-specific items. Use this rather than hand-rolling a
  `DropdownMenu` per feature.
- `src/components/shared/list/list-toolbar.tsx` — `ListToolbar` for the search+filters+reset row
  above the table. Pass the filter `<Select>`s as `children`.
- `src/components/shared/list/bulk-actions-bar.tsx` — `BulkActionsBar` for the "N selected" bar
  above the table (animates open/closed via a `grid-rows` transition, not a plain conditional
  render). Takes `selectedCount`, `isSubmitting`, `onDeactivate`, `onRecover`, `onClear`. Its
  `onDeactivate`/`onRecover` callbacks must only **open a confirm dialog** (see
  `BulkStatusDialog` below) — never call the bulk mutation directly from the bar itself, so a
  misclick can't silently deactivate/recover a batch of rows.
- `src/components/shared/list/entity-status-badge.tsx` — `EntityStatusBadge({ isActive })` for the
  "Hoạt động"/"Vô hiệu hóa" status pill. Don't hand-roll another status badge.
- `src/components/shared/list/pagination.tsx`, `search-empty.tsx` — table footer and empty state.
- `src/components/shared/list/data-table.tsx` — `DataTable<TData>({ columns, data, getRowId })`,
  a thin `@tanstack/react-table` (v8 API — `useReactTable`/`getCoreRowModel`, not the v9 `useTable`
  rewrite; pin `@tanstack/react-table@^8` if reinstalling) wrapper around the shadcn `Table`
  primitives. Define a `ColumnDef<TEntity, unknown>[]` (memoized with `useMemo`) instead of hand
  writing `<TableRow>`/`<TableCell>` JSX — see `role-list.tsx`/`permission-list.tsx` for the
  pattern (select-checkbox column, STT column via `row.index`, an actions column). **Column
  order**: the status column (`EntityStatusBadge` or equivalent) always goes immediately before
  the actions column — last data column, right before "Hành động" — never earlier (e.g. not
  between description and the audit columns). `role-list.tsx`/`user-list.tsx` already follow this;
  match them rather than any other existing list if they disagree. `meta` on a
  column has **two separate** class fields — don't collapse them into one:
  - `meta.className` — body **cell** only (e.g. `"text-sm text-muted-foreground"`,
    `"text-right"`).
  - `meta.headerClassName` — header cell only (e.g. `"w-10"` for a narrow column, `"text-right"`
    to align an actions header). Typography overrides (size/color) belong in `className`, never in
    `headerClassName` — the header already carries its own consistent size via `TableHead`'s
    default classes, and copying a cell's `text-sm` into the header makes that one column's header
    render a visibly different size than the rest (a real bug that shipped once — verify visually,
    not just by typechecking).
    This does NOT replace the mobile card view — TanStack Table is headless, so the `md:hidden` card
    list is still hand-written separately.
- `src/components/shared/page/tabbed-list-page.tsx` — `TabbedListPage` for a page header (kicker +
  title + description + optional `actions`) plus a `Tabs` block, when the feature's list is tabbed
  across two related entities (like roles/permissions). Skip it and go straight to `<EntityList
.../>` in the page component if the feature isn't tabbed.
- `src/components/shared/form/toggle-option-card.tsx` — `ToggleOptionCard({ checked, label,
description, onCheckedChange })` for a bordered "Checkbox + title + description" row in a create
  dialog (e.g. "Kích hoạt vai trò" / "Vai trò hệ thống"). Use this instead of writing the
  `<label className="flex items-start gap-3 rounded-xl border p-3">...` markup inline again.
- `src/components/shared/dialog/entity-status-dialog.tsx` — `EntityStatusDialog({ entityLabel,
entityNoun, assignedToNoun, isActive, isSubmitting, onConfirm, onOpenChange })` for the
  single-row activate/deactivate confirm dialog. `<feature>-status-dialog.tsx` should be a thin
  wrapper over this (see `role-status-dialog.tsx`), not a hand-copied `Dialog` block.
- `src/components/shared/dialog/bulk-status-dialog.tsx` — `BulkStatusDialog({ action, count,
entityNoun, assignedToNoun, isSubmitting, onConfirm, onOpenChange })` — the bulk equivalent of
  `EntityStatusDialog`, shown when the user clicks "Vô hiệu hóa"/"Khôi phục" in `BulkActionsBar`.
  `action` is `"deactivate" | "recover"`; `count` must be the number of selected rows actually
  eligible for that action (only active rows for deactivate, only inactive for recover — see
  `pendingRoleBulkCount` in `use-rbac-dashboard.ts`), not just `selectedIds.size`.
- `src/utils/error-handler.ts` — every create/edit dialog's submit handler must wire this in, not
  swallow the error with a bare comment:
  ```ts
  const submit = async (values: CreateEntityRequest) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }
  ```
  and render the root error somewhere in the form (see `permission-dialog.tsx`):
  ```tsx
  {
    errors.root?.message ? (
      <p
        className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
        role="alert"
      >
        {errors.root.message}
      </p>
    ) : null
  }
  ```
  `applyFieldErrors` maps backend field-level validation errors (e.g. "name already exists") onto
  the matching form field via `setError`; `getErrorMessage` is the fallback for errors that don't
  map to a field. Destructure `setError` from `useForm()` alongside the other fields to use this.
- `src/constants/resource-types.ts` pattern — if the entity has a backend enum that needs a
  Vietnamese label + badge color, add a sibling constants file the same shape (label map + badge
  color map + `get*Label`/`get*BadgeClassName` helpers), don't hardcode labels inline in JSX.
- **View-detail dialog** (`<feature>-detail-dialog.tsx`) — a "Xem chi tiết" row action (wired via
  `EntityActionsMenu`'s `onDetail`) that opens a read-only, centered `Dialog`: header with entity
  name + `EntityStatusBadge` + a one-line subtitle/category badge; body with a
  `rounded-lg border bg-muted/30 p-3.5` block for the main description, an optional related-items
  list capped `max-h-36 overflow-y-auto`, and a `grid grid-cols-2 gap-3 border-t pt-3 text-xs
text-muted-foreground` block for createdBy/createdAt/updatedAt via `formatAuditDate`; footer with
  an always-present "Đóng" button and a conditional "Chỉnh sửa" button (gated on `canUpdate`) that
  closes itself (`onOpenChange(false)`) before calling `onEdit(entity)`.

Check these files still exist with this shape before relying on them — they get refactored
occasionally; grep for the export name if a path 404s, and check whether the shape described here
still matches before copying it wholesale.

## 4. File generation order

Follow `architecture.md`'s feature flow exactly: **schemas → api → queries/keys.ts →
queries/options.ts + use-queries/use-mutations → hooks → components → pages → routes**.

### `src/features/<feature>/schemas/<feature>-schemas.ts`

Zod schemas for the entity, its page-wrapper (`{ data, limit, page, totalItems, totalPages }` —
copy `pageSchema` verbatim), and create/update request schemas with the same validation shape as
`roleRequestSchema`/`permissionRequestSchema` (name pattern, length limits, Vietnamese error
messages). Export inferred `z.infer` types at the bottom.

### `src/features/<feature>/api/<feature>-api.ts`

One object literal (`<feature>Api`) with methods matching backend operations, each: parse the
request with the Zod schema, call `httpClient` via `API_ENDPOINTS.<namespace>.*` (add the endpoint
group to `src/constants/api-endpoints.ts` if missing, per `rbac-permissions.md`'s convention),
unwrap with `readSuccessData`/`readApiResponse`. Copy `rbac-api.ts`'s method shape
exactly — same async/await style, same `ApiResponse<T>` typing.

### `src/features/<feature>/queries/keys.ts`

```ts
export const <feature>Keys = {
  all: ["<feature>"] as const,
  list: () => [...<feature>Keys.all, "list"] as const,
}
```

### `src/features/<feature>/queries/options.ts`

`queryOptions({ ...QUERY_POLICIES.<policy>, queryFn, queryKey })` — pick the policy
(`list`/`static`/`detail`/...) from `src/constants/query-policies.ts` that matches how often this
entity changes; don't invent a new `staleTime`.

### `src/features/<feature>/queries/use-mutations.ts`

One `use<Verb><Entity>Mutation` hook per backend operation, each with `meta.invalidatesQuery` and
a Vietnamese `meta.successMessage` (the global mutation handler shows it — don't toast manually).
For update, mirror `useUpdateRoleMutation`'s optimistic `setQueryData` patch so the list doesn't
need a full refetch after an edit.

### `src/features/<feature>/hooks/use-<feature>-dashboard.ts`

The page-level hook: fetches via the query, holds filter/search/page state, computes the filtered

- paginated slice, exposes selection state (via `useSelection`), dialog open/close state (including
  the pending bulk-action state — `pending<Entity>BulkAction: "deactivate" | "recover" | null` plus a
  derived `pending<Entity>BulkCount`, see point 3 above), and the mutation-calling action functions
  the components call. Check `use-rbac-dashboard.ts` first for the current filter-state pattern in
  use on this branch (search + selects can be either "live" or "apply on click" — the branch has had
  both at different points; match whatever's currently there rather than assuming) before copying its
  shape.

For the view-detail dialog: a `viewing<Entity>` piece of state (undefined = closed) plus
`open<Entity>Detail(entity)`/`close<Entity>Detail()` — see `openRoleDetail`/`closeRoleDetail` in
`use-rbac-dashboard.ts`. `openEdit`/`openCreate` must clear the viewing state before opening the
edit/create dialog, so the detail dialog and the edit dialog never end up mounted at once.

### `src/features/<feature>/components/`

If the feature is a **single** entity (not a tabbed pair like roles/permissions), put its
components flat in this folder. If it's a tabbed pair, split into one subfolder per entity —
`components/<entity-a>/` and `components/<entity-b>/` — with the shared dashboard/tab-container
component staying directly in `components/` (see `role/`, `permission/`, and
`rbac-dashboard.tsx` for the exact split).

- `<feature>-list.tsx` — table (desktop, via `DataTable` + a memoized `ColumnDef[]`) + card list
  (mobile, `md:hidden`, still hand-written JSX), wrapped in `ListToolbar` +
  `BulkActionsBar` + `EntityActionsMenu` (row actions, `onDetail` wired to open the detail dialog)
  - `EntityStatusBadge` (status column) + `Pagination` + `SearchEmpty` — matching `role-list.tsx`'s
    composition.
- `<feature>-dialog.tsx` — create/edit form dialog via `react-hook-form` + `zodResolver`, grouped
  into bordered `rounded-xl border p-3` sections (see `permission-dialog.tsx`), toggle fields via
  `ToggleOptionCard`, wired to `error-handler.ts` per point 3 above, submit button with a
  contextual icon, `isSaving` and `isSubmitting` combined into one `isBusy` disabled flag.
- `<feature>-detail-dialog.tsx` — the read-only "Xem chi tiết" dialog described in point 3 above.
  Generate this for every feature, not as an optional extra.
- `<feature>-status-dialog.tsx` — a thin wrapper over `EntityStatusDialog` (single-row
  activate/deactivate), if this entity soft-deletes. The dashboard/hook also needs a
  `BulkStatusDialog` render for the bulk-action confirm (see point 3 above) — this one has no
  per-feature wrapper file, it's rendered directly from `<feature>-dashboard.tsx` or the page.
- `<feature>-dashboard.tsx` (only if this entity shares a page with another, tabbed, like
  roles/permissions, composed via `TabbedListPage`) or skip straight to the page if it's
  standalone. This is where the detail dialog gets rendered too, alongside the create/edit dialog
  and the status/bulk dialogs.

### `src/pages/<area>/<feature>-page.tsx`

Thin wrapper rendering the dashboard/list component — no logic, matching `rbac-page.tsx`.

### Route wiring

In the relevant `src/routes/*.routes.tsx`: add a `lazy(() => import(...))` entry, replace the
`WorkspacePlaceholderPage` for that `ROUTE_SEGMENTS` entry with `<PermissionRoute
requiredPermissions={PERMISSION_POLICIES.<key>} strategy="all" fallbackTo={ROUTES.admin}>`. Add the
`PERMISSION_POLICIES.<key>` entry in `src/features/auth/utils/permission-policies.ts` if missing.

### Barrel

Update `src/features/<feature>/index.ts` if the feature is consumed from outside its own folder —
otherwise it can stay a placeholder comment like `rbac`'s currently does.

## 5. Verification (never skip)

Run the full matrix from `checklist.md` before calling the scaffold done:

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm build
pnpm test
```

Then start the dev server and screenshot the new list page at both 375px and 1280px per
`ui-rules.md` — a scaffolded feature that has never been rendered is not verified, it's typed. If a
new runtime dependency was installed for this feature, make sure `package.json`/`pnpm-lock.yaml`
are staged along with the feature code — that's a real diff, not line-ending noise.

## 6. Standing rules that still apply here

- **Never commit or push** anything this skill generates without the user's explicit prior
  approval — same rule as everywhere else in this project.
- Backend is the source of truth: if the generated Zod schema doesn't match what the API actually
  returns (a field missing, a type mismatch), fix the frontend schema/mapping — don't ask the
  backend to add a field just to satisfy an assumption made here.
- No arbitrary hex colors — any new badge/status color goes through the token system in
  `styling.md`.
