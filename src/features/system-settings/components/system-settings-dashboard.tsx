import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Bot,
  Settings,
  ShieldCheck,
  UploadCloud,
  Wrench,
} from "lucide-react"
import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import { TabbedListPage } from "@/components/shared/page/tabbed-list-page"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryConfigForm } from "@/features/system-settings/components/category-config-form"
import { groupIngestConfigs } from "@/features/system-settings/components/ingest-config-groups"
import { useSystemConfigsQuery } from "@/features/system-settings/queries/use-queries"
import {
  SYSTEM_CONFIG_CATEGORY_LABELS,
  SYSTEM_CONFIG_CATEGORY_ORDER,
  type SystemConfig,
  type SystemConfigCategory,
} from "@/features/system-settings/schemas/system-config-schemas"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { getErrorMessage } from "@/utils/error-handler"

const EMPTY_CONFIGS: SystemConfig[] = []

const SYSTEM_CONFIG_CATEGORY_ICONS: Record<SystemConfigCategory, LucideIcon> = {
  AUDIT: Activity,
  CHAT: Bot,
  GENERAL: Settings,
  INGEST: UploadCloud,
  MAINTENANCE: Wrench,
  SECURITY: ShieldCheck,
}

const SYSTEM_CONFIG_CATEGORY_DESCRIPTIONS: Record<
  SystemConfigCategory,
  string
> = {
  AUDIT: "Cấu hình liên quan đến nhật ký hệ thống.",
  CHAT: "Giới hạn sử dụng và lịch sử trò chuyện.",
  GENERAL: "Thông tin chung của tổ chức.",
  INGEST: "Giới hạn và cấu hình nạp tài liệu.",
  MAINTENANCE: "Cấu hình bảo trì hệ thống.",
  SECURITY: "Thời gian sống của phiên đăng nhập và token.",
}

export function SystemSettingsDashboard() {
  const { data, error, isPending } = useSystemConfigsQuery()
  const { canUpdate } = useResourcePermissions("system_config")
  // Tab lives in ?tab= so the header search (and a shared link) can open a
  // specific category directly.
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get("tab")

  const configs = data ?? EMPTY_CONFIGS

  const configsByCategory = useMemo(() => {
    const grouped = new Map<SystemConfigCategory, SystemConfig[]>()
    for (const category of SYSTEM_CONFIG_CATEGORY_ORDER) {
      grouped.set(category, [])
    }
    for (const config of configs) {
      grouped.get(config.category)?.push(config)
    }
    return grouped
  }, [configs])

  // Only show a tab for a category that actually has seeded rows - an empty
  // tab (e.g. AUDIT, currently unseeded) is dead weight, not a placeholder
  // worth keeping around.
  const availableCategories = SYSTEM_CONFIG_CATEGORY_ORDER.filter(
    (category) => (configsByCategory.get(category)?.length ?? 0) > 0
  )

  if (isPending) {
    return <SystemSettingsSkeleton />
  }

  if (error) {
    return (
      <p className="m-4 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
        {getErrorMessage(error)}
      </p>
    )
  }

  const activeTab =
    requestedTab &&
    (availableCategories as readonly string[]).includes(requestedTab)
      ? (requestedTab as SystemConfigCategory)
      : (availableCategories[0] ?? SYSTEM_CONFIG_CATEGORY_ORDER[0])

  return (
    <TabbedListPage
      description={SYSTEM_CONFIG_CATEGORY_DESCRIPTIONS[activeTab]}
      kicker="Quản trị · Hệ thống"
      onTabChange={(value) =>
        setSearchParams(
          (previous) => {
            const next = new URLSearchParams(previous)
            next.set("tab", value)
            return next
          },
          { replace: true }
        )
      }
      tabs={availableCategories.map((category) => {
        const Icon = SYSTEM_CONFIG_CATEGORY_ICONS[category]
        const categoryConfigs = configsByCategory.get(category) ?? EMPTY_CONFIGS

        return {
          content: (
            <CategoryConfigForm
              canUpdate={canUpdate}
              configs={categoryConfigs}
              groups={
                category === "INGEST"
                  ? groupIngestConfigs(categoryConfigs)
                  : undefined
              }
            />
          ),
          icon: <Icon aria-hidden="true" />,
          label: SYSTEM_CONFIG_CATEGORY_LABELS[category],
          value: category,
        }
      })}
      title="Cài đặt hệ thống"
      value={activeTab}
    />
  )
}

function SystemSettingsSkeleton() {
  return (
    <div aria-label="Đang tải cài đặt hệ thống" className="space-y-5">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-155 max-w-full" />
      </div>
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="h-105 rounded-xl" />
    </div>
  )
}
