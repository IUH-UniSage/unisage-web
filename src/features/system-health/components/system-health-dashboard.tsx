import { HealthHistorySection } from "@/features/system-health/components/health-history-section"
import { LiveHealthSection } from "@/features/system-health/components/live-health-section"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

export function SystemHealthDashboard() {
  return (
    <div className="space-y-8">
      <div {...tourAnchor(TOUR_ANCHORS.healthLive)}>
        <LiveHealthSection />
      </div>
      <div {...tourAnchor(TOUR_ANCHORS.healthHistory)}>
        <HealthHistorySection />
      </div>
    </div>
  )
}
