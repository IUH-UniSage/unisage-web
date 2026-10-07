import { Gauge } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { UsageMeter } from "@/features/usage-limits/components/usage-meter"
import { useMyUsageQuery } from "@/features/usage-limits/queries/use-queries"

// Profile section: what is left of today's and this week's chat quota.
export function UsageLimitCard() {
  const usageQuery = useMyUsageQuery()

  return (
    <Card
      {...tourAnchor(TOUR_ANCHORS.profileUsage)}
      className="border bg-card shadow-none"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Gauge aria-hidden="true" className="size-4" />
          Hạn mức sử dụng
        </CardTitle>
        <CardDescription>
          Mức đã dùng khi trò chuyện với trợ lý. Mỗi hạn mức bắt đầu tính từ
          lượt hỏi đầu tiên và tự làm mới khi hết thời gian.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {usageQuery.isPending ? (
          <div className="space-y-6">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        ) : usageQuery.data ? (
          <div className="space-y-6">
            <UsageMeter label="Trong 24 giờ" window={usageQuery.data.daily} />
            <UsageMeter label="Trong 7 ngày" window={usageQuery.data.weekly} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Không tải được hạn mức sử dụng. Vui lòng thử lại sau.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
