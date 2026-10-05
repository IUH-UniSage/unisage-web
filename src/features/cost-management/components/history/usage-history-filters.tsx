import type { ReactNode } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CHAT_MODEL_PROVIDERS } from "@/features/chat-models/constants/chat-model-providers"
import type { UsageHistoryFilters } from "@/features/cost-management/hooks/use-usage-history-tab"
import {
  usagePurposeSchema,
  usageRequestStatusSchema,
  type UsagePurpose,
  type UsageRequestStatus,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { getUsagePurposeLabel } from "@/features/cost-management/utils/purpose-labels"
import { getUsageRequestStatusLabel } from "@/features/cost-management/utils/usage-labels"

const ALL = "ALL"

type UsageHistoryFiltersBarProps = {
  actions?: ReactNode
  filters: UsageHistoryFilters
  hasFilters: boolean
  onChange: (filters: UsageHistoryFilters) => void
  onClear: () => void
}

export function UsageHistoryFiltersBar({
  actions,
  filters,
  hasFilters,
  onChange,
  onClear,
}: UsageHistoryFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-3">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-muted-foreground" htmlFor="usage-from">
          Từ
        </Label>
        <Input
          className="w-full sm:w-38"
          id="usage-from"
          max={filters.toDate || undefined}
          onChange={(event) =>
            onChange({ ...filters, fromDate: event.target.value })
          }
          type="date"
          value={filters.fromDate}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-muted-foreground" htmlFor="usage-to">
          Đến
        </Label>
        <Input
          className="w-full sm:w-38"
          id="usage-to"
          min={filters.fromDate || undefined}
          onChange={(event) =>
            onChange({ ...filters, toDate: event.target.value })
          }
          type="date"
          value={filters.toDate}
        />
      </div>
      <Select
        onValueChange={(value) =>
          onChange({
            ...filters,
            purpose: value === ALL ? undefined : (value as UsagePurpose),
          })
        }
        value={filters.purpose ?? ALL}
      >
        <SelectTrigger
          aria-label="Lọc theo mục đích"
          className="w-full sm:w-40"
        >
          <SelectValue placeholder="Mọi mục đích" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Mọi mục đích</SelectItem>
          {usagePurposeSchema.options.map((purpose) => (
            <SelectItem key={purpose} value={purpose}>
              {getUsagePurposeLabel(purpose)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        onValueChange={(value) =>
          onChange({ ...filters, provider: value === ALL ? undefined : value })
        }
        value={filters.provider ?? ALL}
      >
        <SelectTrigger
          aria-label="Lọc theo nhà cung cấp"
          className="w-full sm:w-44"
        >
          <SelectValue placeholder="Mọi nhà cung cấp" />
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
      <Input
        aria-label="Lọc theo mô hình"
        className="w-full sm:w-44"
        onChange={(event) =>
          onChange({ ...filters, model: event.target.value })
        }
        placeholder="Tên mô hình"
        value={filters.model}
      />
      <Input
        aria-label="Lọc theo người dùng hoặc IP"
        className="w-full sm:w-48"
        onChange={(event) =>
          onChange({ ...filters, userOrIp: event.target.value })
        }
        placeholder="Email hoặc IP"
        value={filters.userOrIp}
      />
      <Select
        onValueChange={(value) =>
          onChange({
            ...filters,
            status: value === ALL ? undefined : (value as UsageRequestStatus),
          })
        }
        value={filters.status ?? ALL}
      >
        <SelectTrigger
          aria-label="Lọc theo trạng thái"
          className="w-full sm:w-40"
        >
          <SelectValue placeholder="Mọi trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
          {usageRequestStatusSchema.options.map((status) => (
            <SelectItem key={status} value={status}>
              {getUsageRequestStatusLabel(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters ? (
        <Button onClick={onClear} variant="ghost">
          Xoá bộ lọc
        </Button>
      ) : null}
      {actions ? <div className="ml-auto flex gap-2">{actions}</div> : null}
    </div>
  )
}
