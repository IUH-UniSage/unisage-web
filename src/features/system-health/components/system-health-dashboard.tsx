import { HealthHistorySection } from "@/features/system-health/components/health-history-section"
import { LiveHealthSection } from "@/features/system-health/components/live-health-section"

export function SystemHealthDashboard() {
  return (
    <div className="space-y-8">
      <LiveHealthSection />
      <HealthHistorySection />
    </div>
  )
}
