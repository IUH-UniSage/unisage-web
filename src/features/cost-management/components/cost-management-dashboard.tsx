import { Bell, History, LayoutDashboard, PiggyBank, Tag } from "lucide-react"

import { TabbedListPage } from "@/components/shared/page/tabbed-list-page"
import { FeatureComingSoon } from "@/components/shared/feature-coming-soon"
import { BudgetsTab } from "@/features/cost-management/components/budgets/budgets-tab"
import { OverviewTab } from "@/features/cost-management/components/overview/overview-tab"
import { useCostManagementDashboard } from "@/features/cost-management/hooks/use-cost-management-dashboard"

const TAB_LABELS = {
  alerts: "Cảnh báo",
  budgets: "Ngân sách",
  history: "Lịch sử",
  overview: "Tổng quan",
  pricing: "Bảng giá",
} as const

export function CostManagementDashboard() {
  const dashboard = useCostManagementDashboard()

  return (
    <TabbedListPage
      description="Theo dõi chi phí AI theo mục đích, nhà cung cấp và mô hình; quản lý ngân sách và cảnh báo vượt ngưỡng."
      kicker="Quản trị · Chi phí AI"
      onTabChange={(value) =>
        dashboard.setActiveTab(value as typeof dashboard.activeTab)
      }
      tabs={[
        {
          content: <OverviewTab />,
          icon: <LayoutDashboard aria-hidden="true" />,
          label: TAB_LABELS.overview,
          value: "overview",
        },
        {
          content: <BudgetsTab />,
          icon: <PiggyBank aria-hidden="true" />,
          label: TAB_LABELS.budgets,
          value: "budgets",
        },
        {
          content: (
            <FeatureComingSoon
              description="Cấu hình kênh cảnh báo và lịch sử các lần gửi cảnh báo sẽ hiển thị ở đây."
              headingLevel="h2"
              title={TAB_LABELS.alerts}
            />
          ),
          icon: <Bell aria-hidden="true" />,
          label: TAB_LABELS.alerts,
          value: "alerts",
        },
        {
          content: (
            <FeatureComingSoon
              description="Bảng giá theo mô hình/nhà cung cấp hiện đang áp dụng sẽ hiển thị ở đây."
              headingLevel="h2"
              title={TAB_LABELS.pricing}
            />
          ),
          icon: <Tag aria-hidden="true" />,
          label: TAB_LABELS.pricing,
          value: "pricing",
        },
        {
          content: (
            <FeatureComingSoon
              description="Danh sách và chi tiết từng request đã ghi nhận chi phí sẽ hiển thị ở đây."
              headingLevel="h2"
              title={TAB_LABELS.history}
            />
          ),
          icon: <History aria-hidden="true" />,
          label: TAB_LABELS.history,
          value: "history",
        },
      ]}
      title="Chi phí AI"
      value={dashboard.activeTab}
    />
  )
}
