import { Gauge } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { UsageMeter } from "@/features/usage-limits/components/usage-meter"
import { useUserUsageQuery } from "@/features/usage-limits/queries/use-queries"

type AdminUserUsageCardProps = {
  userId: string
}

// Admin view of a single user's chat quota, mirroring the profile page's card.
export function AdminUserUsageCard({ userId }: AdminUserUsageCardProps) {
  const usageQuery = useUserUsageQuery(userId)

  return (
    <Card
      {...tourAnchor(TOUR_ANCHORS.userDetailUsage)}
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
        <CardAction>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled size="sm" type="button" variant="outline">
                  Xem chi tiết
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Tính năng đang phát triển</TooltipContent>
          </Tooltip>
        </CardAction>
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
