import { SystemHealthDashboard } from "@/features/system-health/components/system-health-dashboard"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

export function SystemHealthPage() {
  return (
    <div className="space-y-4">
      <div {...tourAnchor(TOUR_ANCHORS.pageHeader)}>
        <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          Quản trị · Hệ thống
        </p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">
          Tình trạng dịch vụ
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Trạng thái hiện tại của cơ sở dữ liệu, cổng API, trợ lý AI và lưu trữ
          file, cùng lịch sử kiểm tra định kỳ.
        </p>
      </div>

      <SystemHealthDashboard />
    </div>
  )
}
