import { AlertHistoryTable } from "@/features/cost-management/components/alerts/alert-history-table"
import { AlertSettingsForm } from "@/features/cost-management/components/alerts/alert-settings-form"
import { useUpdateBudgetAlertSettingsMutation } from "@/features/cost-management/queries/use-mutations"
import { useBudgetAlertSettingsQuery } from "@/features/cost-management/queries/use-queries"
import type { UpdateBudgetAlertSettingFormValues } from "@/features/cost-management/schemas/cost-management-schemas"
import { getErrorMessage } from "@/utils/error-handler"
import { Skeleton } from "@/components/ui/skeleton"

export function AlertsTab() {
  const settingsQuery = useBudgetAlertSettingsQuery()
  const updateSettings = useUpdateBudgetAlertSettingsMutation()

  const save = async (input: UpdateBudgetAlertSettingFormValues) => {
    await updateSettings.mutateAsync(input)
  }

  return (
    <div className="space-y-6">
      <h2 className="sr-only">Cảnh báo ngân sách</h2>

      {settingsQuery.isPending ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : settingsQuery.isError ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {getErrorMessage(settingsQuery.error)}
        </p>
      ) : (
        <AlertSettingsForm
          isSaving={updateSettings.isPending}
          onSubmit={save}
          setting={settingsQuery.data}
        />
      )}

      <AlertHistoryTable />
    </div>
  )
}
