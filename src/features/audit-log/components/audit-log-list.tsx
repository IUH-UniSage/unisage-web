import type { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { ListToolbar } from "@/components/shared/list/list-toolbar"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AUDIT_ACTION_LABELS,
  auditActionSchema,
  getAuditActionBadgeClassName,
  type AuditAction,
  type AuditLog,
} from "@/features/audit-log/schemas/audit-log-schemas"
import { useAuditLogsQuery } from "@/features/audit-log/queries/use-queries"
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
  actorId: string
  fromDate: string
  resourceType?: ResourceTypeKey
  toDate: string
}

const EMPTY_FILTERS: Filters = { actorId: "", fromDate: "", toDate: "" }

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
  if (!details) return <span className="text-muted-foreground">—</span>

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className="max-w-xs cursor-default truncate text-sm text-muted-foreground">
          {details}
        </p>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm break-words whitespace-pre-wrap">
        {details}
      </TooltipContent>
    </Tooltip>
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
    actorId: applied.actorId.trim() || undefined,
    fromDate: applied.fromDate || undefined,
    limit: PAGE_SIZE,
    page,
    resourceType: applied.resourceType,
    toDate: applied.toDate || undefined,
  })

  const logs = useMemo(() => data?.data ?? [], [data])
  const firstRowNumber = (page - 1) * PAGE_SIZE + 1
  const isFiltered = Boolean(
    applied.actorId ||
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
        header: "Hành động",
        id: "action",
      },
      {
        cell: ({ row }) => (
          <div className="text-sm">
            <p>{getResourceTypeLabel(row.original.resourceType)}</p>
            <p className="max-w-40 truncate font-mono text-xs text-muted-foreground">
              {row.original.resourceId}
            </p>
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
          onSearchChange={(actorId) =>
            setDraft((current) => ({ ...current, actorId }))
          }
          search={draft.actorId}
          searchAriaLabel="Tìm theo mã người thực hiện"
          searchPlaceholder="Tìm theo mã người thực hiện (actorId)..."
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
                  <p className="mt-2 text-xs text-muted-foreground">
                    {getResourceTypeLabel(log.resourceType)} ·{" "}
                    <span className="font-mono">{log.resourceId}</span>
                  </p>
                  <div className="mt-2">
                    <AuditDetailsCell details={log.details} />
                  </div>
                  <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </p>
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
