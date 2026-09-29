import { StaffWorkspaceLayout } from "@/components/shared/navigation/staff-workspace-layout"
import { BudgetAlertBanner } from "@/features/cost-management/components/budget-alert-banner"

export function SystemAdminLayout() {
  return (
    <StaffWorkspaceLayout
      banner={<BudgetAlertBanner />}
      workspace="system-admin"
    />
  )
}
