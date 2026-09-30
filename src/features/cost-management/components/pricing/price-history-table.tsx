import type { ColumnDef } from "@tanstack/react-table"
import { X } from "lucide-react"
import { useState } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { Pagination } from "@/components/shared/list/pagination"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { CHAT_MODEL_PROVIDERS } from "@/features/chat-models/constants/chat-model-providers"
import { useModelPriceHistoryQuery } from "@/features/cost-management/queries/use-queries"
import {
  modelPriceChangeTypeSchema,
  type ModelPriceChange,
  type ModelPriceChangeType,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { formatUsdPrecise } from "@/features/cost-management/utils/format-cost"
import { getPriceChangeTypeLabel } from "@/features/cost-management/utils/pricing-labels"
import { formatUtcDateTime } from "@/features/cost-management/utils/usage-display"
import { useDebounce } from "@/hooks/use-debounce"
import { getErrorMessage } from "@/utils/error-handler"

const PAGE_SIZE = 10
const ALL = "ALL"

export type PriceHistoryPreset = {
  model: string
  nonce: number
  provider: string
}

type Filters = {
  changeType?: ModelPriceChangeType
  fromDate: string
  model?: string
  provider?: string
  query: string
  toDate: string
}

const EMPTY_FILTERS: Filters = { fromDate: "", query: "", toDate: "" }

const PRICE_PARTS = [
  {
    label: "Input",
    newKey: "newInputPerMillion",
    oldKey: "oldInputPerMillion",
  },
  {
    label: "Cache",
    newKey: "newCachedInputPerMillion",
    oldKey: "oldCachedInputPerMillion",
  },
  {
    label: "Output",
    newKey: "newOutputPerMillion",
    oldKey: "oldOutputPerMillion",
  },
] as const

function formatPrice(value: number | null): string {
  return value == null ? "—" : formatUsdPrecise(value)
}

function describePrice(
  type: ModelPriceChangeType,
  oldValue: number | null,
  newValue: number | null
): string {
  if (type === "SYNC_CREATE" || type === "MANUAL_CREATE")
    return formatPrice(newValue)
  // The override is deleted; the following sync row carries the restored price.
  if (type === "MANUAL_RESET") return `${formatPrice(oldValue)} (bỏ giá tay)`
  return `${formatPrice(oldValue)} → ${formatPrice(newValue)}`
}

function PriceDiff({ change }: { change: ModelPriceChange }) {
  const parts = PRICE_PARTS.filter(
    (part) => change[part.oldKey] != null || change[part.newKey] != null
  )
  return (
    <div className="space-y-0.5 text-xs">
      {parts.map((part) => {
        const oldValue = change[part.oldKey]
        const newValue = change[part.newKey]
        const changed = oldValue !== newValue
        return (
          <p
            className={changed ? undefined : "text-muted-foreground"}
            key={part.label}
          >
            <span className="inline-block w-12 text-muted-foreground">
              {part.label}
            </span>
            {describePrice(change.changeType, oldValue, newValue)}
          </p>
        )
      })}
    </div>
  )
}

// Local calendar days → UTC instants; `to` is the next local midnight (exclusive).
function toRange(fromDate: string, toDate: string) {
  let to: string | undefined
  if (toDate) {
    const next = new Date(`${toDate}T00:00:00`)
    next.setDate(next.getDate() + 1)
    to = next.toISOString()
  }
  return {
    from: fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : undefined,
    to,
  }
}

const COLUMNS: ColumnDef<ModelPriceChange, unknown>[] = [
  {
    cell: ({ row }) => formatUtcDateTime(row.original.changedAt),
    header: "Thời điểm",
    id: "changedAt",
    meta: { className: "text-sm whitespace-nowrap" },
  },
  {
    cell: ({ row }) => (
      <div className="text-sm">
        <p className="font-medium">{row.original.modelName}</p>
        <p className="text-xs text-muted-foreground">{row.original.provider}</p>
      </div>
    ),
    header: "Mô hình",
    id: "model",
  },
  {
    cell: ({ row }) => (
      <Badge
        className={
          row.original.changeType.startsWith("MANUAL")
            ? "border-transparent bg-warning/40 text-warning-foreground"
            : "border-transparent bg-muted text-muted-foreground"
        }
        variant="ghost"
      >
        {getPriceChangeTypeLabel(row.original.changeType)}
      </Badge>
    ),
    header: "Thay đổi",
    id: "changeType",
  },
  {
    cell: ({ row }) => <PriceDiff change={row.original} />,
    header: "Giá / 1M token",
    id: "prices",
  },
  {
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.changedByEmail ?? "Đồng bộ tự động"}
      </span>
    ),
    header: "Người thực hiện",
    id: "changedBy",
  },
]

export function PriceHistoryTable({ preset }: { preset?: PriceHistoryPreset }) {
  // The parent remounts this table (key = nonce) to apply a new preset.
  const [filters, setFilters] = useState<Filters>(() =>
    preset
      ? { ...EMPTY_FILTERS, model: preset.model, provider: preset.provider }
      : EMPTY_FILTERS
  )
  const [page, setPage] = useState(1)
  const query = useDebounce(filters.query.trim(), 400)

  const change = (next: Partial<Filters>) => {
    setFilters((previous) => ({ ...previous, ...next }))
    setPage(1)
  }

  const historyQuery = useModelPriceHistoryQuery({
    ...toRange(filters.fromDate, filters.toDate),
    changeType: filters.changeType,
    limit: PAGE_SIZE,
    model: filters.model,
    page,
    provider: filters.provider,
    q: query,
  })
  const rows = historyQuery.data?.data ?? []
  const hasFilters = Boolean(
    filters.changeType ||
    filters.fromDate ||
    filters.model ||
    filters.provider ||
    filters.query ||
    filters.toDate
  )

  return (
    <Card className="border bg-card shadow-none" id="price-history">
      <CardHeader className="space-y-3">
        <CardTitle>Lịch sử thay đổi giá</CardTitle>
        <div className="flex flex-wrap items-end gap-2">
          <Select
            onValueChange={(value) =>
              change({ provider: value === ALL ? undefined : value })
            }
            value={filters.provider ?? ALL}
          >
            <SelectTrigger aria-label="Lọc theo nhà cung cấp" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi nhà cung cấp</SelectItem>
              {CHAT_MODEL_PROVIDERS.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  {provider.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.model ? (
            <Badge className="h-9 gap-1 px-3" variant="outline">
              {filters.model}
              <button
                aria-label="Bỏ lọc mô hình"
                onClick={() => change({ model: undefined })}
                type="button"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </Badge>
          ) : (
            <Input
              aria-label="Tìm mô hình trong lịch sử"
              className="w-48"
              onChange={(event) => change({ query: event.target.value })}
              placeholder="Tìm mô hình..."
              value={filters.query}
            />
          )}
          <Select
            onValueChange={(value) =>
              change({
                changeType:
                  value === ALL ? undefined : (value as ModelPriceChangeType),
              })
            }
            value={filters.changeType ?? ALL}
          >
            <SelectTrigger aria-label="Lọc theo loại thay đổi" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi loại thay đổi</SelectItem>
              {modelPriceChangeTypeSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {getPriceChangeTypeLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor="price-history-from"
            >
              Từ
            </Label>
            <Input
              className="w-38"
              id="price-history-from"
              max={filters.toDate || undefined}
              onChange={(event) => change({ fromDate: event.target.value })}
              type="date"
              value={filters.fromDate}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor="price-history-to"
            >
              Đến
            </Label>
            <Input
              className="w-38"
              id="price-history-to"
              min={filters.fromDate || undefined}
              onChange={(event) => change({ toDate: event.target.value })}
              type="date"
              value={filters.toDate}
            />
          </div>
          {hasFilters ? (
            <Button
              onClick={() => {
                setFilters(EMPTY_FILTERS)
                setPage(1)
              }}
              variant="ghost"
            >
              Xoá bộ lọc
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {historyQuery.isPending ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : historyQuery.isError ? (
          <p className="p-5 text-sm text-destructive">
            {getErrorMessage(historyQuery.error)}
          </p>
        ) : rows.length === 0 ? (
          <SearchEmpty
            description={
              hasFilters ? "Thử thay đổi bộ lọc." : "Chưa có lần đổi giá nào."
            }
            title="Không có thay đổi giá"
          />
        ) : (
          <>
            <DataTable columns={COLUMNS} data={rows} getRowId={(c) => c.id} />
            <Pagination
              className="rounded-none border-x-0 border-b-0 shadow-none"
              currentPage={page}
              onPageChange={setPage}
              pageSize={PAGE_SIZE}
              totalItems={historyQuery.data?.totalItems ?? 0}
              totalPages={historyQuery.data?.totalPages ?? 0}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
