import type { ReactNode } from "react"

import { CHAT_MODEL_PROVIDERS } from "@/features/chat-models/constants/chat-model-providers"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OverviewFilters } from "@/features/cost-management/hooks/use-overview-tab"
import {
  usagePurposeSchema,
  type UsagePurpose,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { getUsagePurposeLabel } from "@/features/cost-management/utils/purpose-labels"

const ALL = "ALL"

type OverviewFiltersBarProps = {
  actions?: ReactNode
  filters: OverviewFilters
  onChange: (filters: OverviewFilters) => void
}

export function OverviewFiltersBar({
  actions,
  filters,
  onChange,
}: OverviewFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-3">
      <div className="flex items-center gap-1.5">
        <Label
          className="text-xs text-muted-foreground"
          htmlFor="overview-from-date"
        >
          Từ
        </Label>
        <Input
          className="w-full sm:w-38"
          id="overview-from-date"
          max={filters.toDate}
          onChange={(event) =>
            onChange({ ...filters, fromDate: event.target.value })
          }
          type="date"
          value={filters.fromDate}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <Label
          className="text-xs text-muted-foreground"
          htmlFor="overview-to-date"
        >
          Đến
        </Label>
        <Input
          className="w-full sm:w-38"
          id="overview-to-date"
          min={filters.fromDate}
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
          className="w-full sm:w-44"
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
          className="w-full sm:w-48"
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
      {actions ? <div className="ml-auto flex gap-2">{actions}</div> : null}
    </div>
  )
}
