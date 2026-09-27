import axios from "axios"
import { RefreshCcw, WifiOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AgentDependenciesStrip } from "@/features/system-health/components/agent-dependencies-strip"
import { ComponentHealthCard } from "@/features/system-health/components/component-health-card"
import { OverallStatusBanner } from "@/features/system-health/components/overall-status-banner"
import { useSystemHealthLiveQuery } from "@/features/system-health/queries/use-queries"
import { getErrorMessage } from "@/utils/error-handler"

// This is the one page in the app where the thing being monitored failing
// is an expected, not exceptional, scenario - a network error reaching
// `/admin/health` itself (backend down, gateway unreachable) is distinct
// from a *successful* response reporting a DOWN component, and gets its own
// message rather than the generic error banner other list pages use.
function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response
}

export function LiveHealthSection() {
  const { data, error, isPending, isRefetching, refetch } =
    useSystemHealthLiveQuery()

  if (isPending) {
    return (
      <div aria-label="Đang kiểm tra tình trạng hệ thống" className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    const networkError = isNetworkError(error)

    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-10 text-center">
        <WifiOff aria-hidden="true" className="size-8 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">
            {networkError
              ? "Không thể kết nối đến máy chủ kiểm tra tình trạng hệ thống"
              : "Không thể tải tình trạng hệ thống"}
          </p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {networkError
              ? "Máy chủ backend có thể đang ngừng hoạt động hoặc không thể truy cập. Hệ thống sẽ tự động thử lại."
              : getErrorMessage(error)}
          </p>
        </div>
        <Button onClick={() => refetch()} size="sm" variant="outline">
          <RefreshCcw aria-hidden="true" />
          Thử lại ngay
        </Button>
      </div>
    )
  }

  if (!data) return null

  const componentEntries = Object.entries(data.components)

  return (
    <div className="space-y-4">
      <OverallStatusBanner
        checkedAt={data.checkedAt}
        status={data.overallStatus}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Trạng thái từng thành phần
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCcw
            aria-hidden="true"
            className={isRefetching ? "size-3 animate-spin" : "size-3"}
          />
          Tự động làm mới mỗi 15 giây
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {componentEntries.map(([key, health]) => (
          <ComponentHealthCard componentKey={key} health={health} key={key} />
        ))}
      </div>

      <AgentDependenciesStrip details={data.components.agent?.details} />
    </div>
  )
}
