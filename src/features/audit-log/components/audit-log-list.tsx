import type { ColumnDef } from "@tanstack/react-table"
import { Fragment, useMemo, useState } from "react"

import { CopyableId } from "@/components/shared/copyable-id"
import { DataTable } from "@/components/shared/list/data-table"
import { EntityActionsMenu } from "@/components/shared/list/entity-actions-menu"
import { ListToolbar } from "@/components/shared/list/list-toolbar"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AUDIT_ACTION_LABELS,
  auditActionSchema,
  getAuditActionBadgeClassName,
  type AuditAction,
  type AuditLog,
} from "@/features/audit-log/schemas/audit-log-schemas"
import { useAuditLogsQuery } from "@/features/audit-log/queries/use-queries"
import { parseAuditDetails } from "@/features/audit-log/utils/format-details"
import {
  getResourceTypeLabel,
  RESOURCE_TYPE_LABELS,
  type ResourceTypeKey,
} from "@/constants/resource-types"
import { getErrorMessage } from "@/utils/error-handler"
import { formatDateTime } from "@/utils/date"
import { Input } from "@/components/ui/input"

const PAGE_SIZE = 20
const ALL = "ALL"

type Filters = {
  action?: AuditAction
  // Filters by the human-readable actorCode (e.g. "SA-001"), not the actorId
  // UUID - that's the only actor identifier visible anywhere in this UI (the
  // "Người thực hiện" column), an admin has no way to know a raw UUID to
  // type in. The backend's /audit-logs?actorCode= does a case-insensitive
  // contains match against AuditLog.actorCode.
  actorCode: string
  fromDate: string
  resourceType?: ResourceTypeKey
  toDate: string
}

const EMPTY_FILTERS: Filters = { actorCode: "", fromDate: "", toDate: "" }

function AuditActionBadge({ action }: { action: AuditAction }) {
  return (
    <Badge className={getAuditActionBadgeClassName(action)} variant="ghost">
      {AUDIT_ACTION_LABELS[action]}
    </Badge>
  )
}

function AuditActorCell({ log }: { log: AuditLog }) {
  // A null actor means the mutation was made by the system itself (a
  // scheduled job, a migration, an internal service call) rather than a
  // signed-in user - mirrors the "System" fallback used for createdByName
  // elsewhere (role-list.tsx, category-list.tsx).
  if (!log.actorId) {
    return <span className="text-muted-foreground">Hệ thống</span>
  }

  return (
    <div className="text-sm">
      <p className="font-medium">{log.actorName || "Không xác định"}</p>
      {log.actorCode ? (
        <p className="text-xs text-muted-foreground">{log.actorCode}</p>
      ) : null}
    </div>
  )
}

function AuditDetailsCell({ details }: { details: string | null | undefined }) {
  const rows = parseAuditDetails(details)

  if (rows === null || rows.length === 0) {
    return <span className="text-muted-foreground">{details || "—"}</span>
  }

  const [first, ...rest] = rows
  const firstLine =
    first.kind === "diff"
      ? `${first.label}: ${first.oldValue} → ${first.newValue}`
      : `${first.label}: ${first.value}`

  return (
    <div className="max-w-xs text-sm text-muted-foreground">
      <p className="line-clamp-2 wrap-break-word">{firstLine}</p>
      {rest.length > 0 ? (
        <p className="mt-0.5 text-xs">+{rest.length} thay đổi khác</p>
      ) : null}
    </div>
  )
}

function AuditLogDetailRows({
  details,
}: {
  details: string | null | undefined
}) {
  const rows = parseAuditDetails(details)

  if (rows === null) {
    // Not the expected {field: value} / {field: {old, new}} shape (or
    // empty) - show the raw string rather than hiding data.
    return (
      <p className="text-sm text-muted-foreground">
        {details || "Không có dữ liệu chi tiết."}
      </p>
    )
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Không có thay đổi nào được ghi nhận.
      </p>
    )
  }

  return (
    <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
      {rows.map((row) => (
        <Fragment key={row.key}>
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="col-span-2 wrap-break-word">
            {row.kind === "diff" ? (
              <>
                <span className="text-muted-foreground line-through">
                  {row.oldValue}
                </span>{" "}
                → <span className="font-medium">{row.newValue}</span>
              </>
            ) : (
              row.value
            )}
          </dd>
        </Fragment>
      ))}
    </dl>
  )
}

function AuditLogDetailDialog({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <EntityActionsMenu entityLabel="nhật ký" onDetail={() => setOpen(true)} />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết nhật ký</DialogTitle>
          <DialogDescription>{formatDateTime(log.createdAt)}</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Người thực hiện</dt>
          <dd className="col-span-2">
            {log.actorId
              ? `${log.actorName || "Không xác định"}${log.actorCode ? ` (${log.actorCode})` : ""}`
              : "Hệ thống"}
          </dd>
          <dt className="text-muted-foreground">Hành động</dt>
          <dd className="col-span-2">
            <AuditActionBadge action={log.action} />
          </dd>
          <dt className="text-muted-foreground">Đối tượng</dt>
          <dd className="col-span-2">
            <p>{getResourceTypeLabel(log.resourceType)}</p>
            {log.resourceId ? (
              <CopyableId className="mt-0.5" value={log.resourceId} />
            ) : null}
          </dd>
        </dl>
        <div className="max-h-80 overflow-auto rounded-lg border bg-muted/50 p-3">
          <AuditLogDetailRows details={log.details} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Read-only admin list: every mutating DB operation across the system,
// filterable by resource type, action, actor and a date range. There is no
// create/edit/delete here - audit logs are immutable - so this mirrors
// AdminTickets' server-filtered list shape rather than the CRUD scaffold's
// (no EntityActionsMenu, no bulk actions, no status column).
export function AuditLogList() {
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS)
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS)

  const { data, error, isPending } = useAuditLogsQuery({
    action: applied.action,
    actorCode: applied.actorCode.trim() || undefined,
    // The date inputs give YYYY-MM-DD; the backend binds fromDate/toDate as
    // @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime and 400s on a bare
    // date, so widen to the start/end of day before sending.
    fromDate: applied.fromDate ? `${applied.fromDate}T00:00:00` : undefined,
    limit: PAGE_SIZE,
    page,
    resourceType: applied.resourceType,
    toDate: applied.toDate ? `${applied.toDate}T23:59:59` : undefined,
  })

  const logs = useMemo(() => data?.data ?? [], [data])
  const firstRowNumber = (page - 1) * PAGE_SIZE + 1
  const isFiltered = Boolean(
    applied.actorCode ||
    applied.action ||
    applied.resourceType ||
    applied.fromDate ||
    applied.toDate
  )

  const columns = useMemo<ColumnDef<AuditLog, unknown>[]>(
    () => [
      {
        cell: ({ row }) => firstRowNumber + row.index,
        header: "STT",
        id: "stt",
        meta: {
          className: "text-sm text-muted-foreground",
          headerClassName: "w-10",
        },
      },
      {
        cell: ({ row }) => formatDateTime(row.original.createdAt),
        header: "Thời gian",
        id: "createdAt",
        meta: { className: "text-sm whitespace-nowrap" },
      },
      {
        cell: ({ row }) => <AuditActorCell log={row.original} />,
        header: "Người thực hiện",
        id: "actor",
      },
      {
        cell: ({ row }) => <AuditActionBadge action={row.original.action} />,
        // "Loại thao tác" (the CREATE/UPDATE/DELETE/... type), not to be
        // confused with the "Hành động" row-actions column below - this
        // codebase's convention (role-list.tsx, permission-list.tsx) reserves
        // "Hành động" for the row's own action buttons.
        header: "Loại thao tác",
        id: "action",
      },
      {
        cell: ({ row }) => (
          <div className="max-w-52 text-sm">
            <p>{getResourceTypeLabel(row.original.resourceType)}</p>
            {row.original.resourceId ? (
              <CopyableId className="mt-0.5" value={row.original.resourceId} />
            ) : null}
          </div>
        ),
        header: "Đối tượng",
        id: "resource",
      },
      {
        cell: ({ row }) => <AuditDetailsCell details={row.original.details} />,
        header: "Chi tiết",
        id: "details",
      },
      {
        cell: ({ row }) => <AuditLogDetailDialog log={row.original} />,
        header: "Hành động",
        id: "actions",
        meta: { className: "text-right", headerClassName: "text-right" },
      },
    ],
    [firstRowNumber]
  )

  const applyFilters = () => {
    setApplied(draft)
    setPage(1)
  }

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS)
    setApplied(EMPTY_FILTERS)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <ListToolbar
          isFiltered={isFiltered}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          onSearchChange={(actorCode) =>
            setDraft((current) => ({ ...current, actorCode }))
          }
          search={draft.actorCode}
          searchAriaLabel="Tìm theo mã người thực hiện"
          searchPlaceholder="Tìm theo mã người thực hiện (VD: SA-001)..."
        >
          <Select
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                resourceType:
                  value === ALL ? undefined : (value as ResourceTypeKey),
              }))
            }
            value={draft.resourceType ?? ALL}
          >
            <SelectTrigger
              aria-label="Lọc theo đối tượng"
              className="w-full sm:w-52"
            >
              <SelectValue placeholder="Mọi đối tượng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi đối tượng</SelectItem>
              {(Object.keys(RESOURCE_TYPE_LABELS) as ResourceTypeKey[]).map(
                (resourceType) => (
                  <SelectItem key={resourceType} value={resourceType}>
                    {RESOURCE_TYPE_LABELS[resourceType]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                action: value === ALL ? undefined : (value as AuditAction),
              }))
            }
            value={draft.action ?? ALL}
          >
            <SelectTrigger
              aria-label="Lọc theo hành động"
              className="w-full sm:w-40"
            >
              <SelectValue placeholder="Mọi hành động" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi hành động</SelectItem>
              {auditActionSchema.options.map((action) => (
                <SelectItem key={action} value={action}>
                  {AUDIT_ACTION_LABELS[action]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor="audit-from-date"
            >
              Từ
            </Label>
            <Input
              className="w-full sm:w-38"
              id="audit-from-date"
              max={draft.toDate || undefined}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fromDate: event.target.value,
                }))
              }
              type="date"
              value={draft.fromDate}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor="audit-to-date"
            >
              Đến
            </Label>
            <Input
              className="w-full sm:w-38"
              id="audit-to-date"
              min={draft.fromDate || undefined}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  toDate: event.target.value,
                }))
              }
              type="date"
              value={draft.toDate}
            />
          </div>
        </ListToolbar>

        {isPending ? (
          <div aria-label="Đang tải nhật ký hệ thống" className="space-y-2 p-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : error ? (
          <p className="m-4 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        ) : logs.length === 0 ? (
          <SearchEmpty
            description={
              isFiltered
                ? "Thử đổi hoặc đặt lại bộ lọc."
                : "Chưa có thao tác nào được ghi nhận trong hệ thống."
            }
            title="Không tìm thấy nhật ký phù hợp"
          />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={logs}
                getRowId={(log) => log.id}
              />
            </div>
            <div className="grid gap-3 p-3 md:hidden">
              {logs.map((log, index) => (
                <article className="rounded-xl border p-4" key={log.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        #{firstRowNumber + index}
                      </p>
                      <AuditActorCell log={log} />
                    </div>
                    <AuditActionBadge action={log.action} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    <span>{getResourceTypeLabel(log.resourceType)}</span>
                    {log.resourceId ? (
                      <>
                        <span>·</span>
                        <CopyableId value={log.resourceId} />
                      </>
                    ) : null}
                  </div>
                  <div className="mt-2">
                    <AuditDetailsCell details={log.details} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </p>
                    <AuditLogDetailDialog log={log} />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {data ? (
        <Pagination
          currentPage={page}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={data.totalItems}
          totalPages={data.totalPages}
        />
      ) : null}
    </div>
  )
}
