import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { BackupDashboard } from "@/features/backups"

export function BackupPage() {
  return (
    <div className="space-y-4">
      <div {...tourAnchor(TOUR_ANCHORS.pageHeader)}>
        <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          Quản trị · Hệ thống
        </p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">
          Sao lưu & khôi phục
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Theo dõi các bản sao lưu cơ sở dữ liệu và Qdrant, sao lưu ngay khi
          cần, và khôi phục dữ liệu về một bản sao lưu hoặc một thời điểm.
        </p>
      </div>

      <BackupDashboard />
    </div>
  )
}
