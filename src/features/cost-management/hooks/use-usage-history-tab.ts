import { useMemo, useState } from "react"

import { useUsageLogsQuery } from "@/features/cost-management/queries/use-queries"
import type {
  UsagePurpose,
  UsageRequestStatus,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { useDebounce } from "@/hooks/use-debounce"

const PAGE_SIZE = 20
const TEXT_FILTER_DEBOUNCE_MS = 400

export type UsageHistoryFilters = {
  fromDate: string
  model: string
  provider?: string
  purpose?: UsagePurpose
  status?: UsageRequestStatus
  toDate: string
  userOrIp: string
}

const EMPTY_FILTERS: UsageHistoryFilters = {
  fromDate: "",
  model: "",
  toDate: "",
  userOrIp: "",
}

// Date inputs are local calendar days; the API wants instants, so the
// boundaries are taken at local midnight rather than UTC midnight.
function startOfLocalDay(date: string): string | undefined {
  return date ? new Date(`${date}T00:00:00`).toISOString() : undefined
}

function startOfNextLocalDay(date: string): string | undefined {
  if (!date) return undefined
  const next = new Date(`${date}T00:00:00`)
  next.setDate(next.getDate() + 1)
  return next.toISOString()
}

export function useUsageHistoryTab() {
  const [filters, setFilters] = useState<UsageHistoryFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedUsageLogId, setSelectedUsageLogId] = useState<string>()

  const model = useDebounce(filters.model.trim(), TEXT_FILTER_DEBOUNCE_MS)
  const userOrIp = useDebounce(filters.userOrIp.trim(), TEXT_FILTER_DEBOUNCE_MS)

  const params = useMemo(
    () => ({
      from: startOfLocalDay(filters.fromDate),
      limit: PAGE_SIZE,
      model,
      page,
      provider: filters.provider,
      purpose: filters.purpose,
      status: filters.status,
      to: startOfNextLocalDay(filters.toDate),
      userOrIp,
    }),
    [filters, model, page, userOrIp]
  )

  const usageLogsQuery = useUsageLogsQuery(params)

  const changeFilters = (next: UsageHistoryFilters) => {
    setFilters(next)
    setPage(1)
  }

  const hasFilters = Object.values(filters).some((value) => Boolean(value))

  return {
    changeFilters,
    clearFilters: () => changeFilters(EMPTY_FILTERS),
    filters,
    hasFilters,
    page,
    pageSize: PAGE_SIZE,
    selectedUsageLogId,
    setPage,
    setSelectedUsageLogId,
    usageLogsQuery,
  }
}
