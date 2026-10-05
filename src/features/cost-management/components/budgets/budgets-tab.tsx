import { Plus } from "lucide-react"
import { useState } from "react"

import { RefreshButton } from "@/components/shared/refresh-button"
import { ConfirmDeleteDialog } from "@/components/shared/dialog/confirm-delete-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BudgetDialog } from "@/features/cost-management/components/budgets/budget-dialog"
import { BudgetList } from "@/features/cost-management/components/budgets/budget-list"
import {
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
  useUpdateBudgetMutation,
} from "@/features/cost-management/queries/use-mutations"
import { costManagementKeys } from "@/features/cost-management/queries/keys"
import { useBudgetsQuery } from "@/features/cost-management/queries/use-queries"
import type {
  Budget,
  CreateBudgetRequest,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { getBudgetScopeLabel } from "@/features/cost-management/utils/budget-labels"
import { getErrorMessage } from "@/utils/error-handler"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"

export function BudgetsTab() {
  const budgetsQuery = useBudgetsQuery()
  const createBudget = useCreateBudgetMutation()
  const updateBudget = useUpdateBudgetMutation()
  const deleteBudget = useDeleteBudgetMutation()
  const { canCreate, canDelete, canUpdate } = useResourcePermissions("budget")

  // `undefined` = closed, `"new"` = creating, a budget = editing that budget.
  const [dialogTarget, setDialogTarget] = useState<Budget | "new">()
  const [deletingBudget, setDeletingBudget] = useState<Budget>()

  const save = async (input: CreateBudgetRequest) => {
    if (dialogTarget && dialogTarget !== "new") {
      await updateBudget.mutateAsync({ budgetId: dialogTarget.id, input })
    } else {
      await createBudget.mutateAsync(input)
    }
    setDialogTarget(undefined)
  }

  const confirmDelete = async () => {
    if (!deletingBudget) return

    await deleteBudget.mutateAsync(deletingBudget.id)
    setDeletingBudget(undefined)
  }

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Ngân sách và giới hạn</h2>

      <div className="flex items-center justify-between gap-4">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Ngân sách là giới hạn mềm: hết ngân sách theo nhà cung cấp sẽ chuyển
          sang nhà cung cấp khác, hết ngân sách hệ thống hoặc theo mục đích sẽ
          từ chối request mới.
        </p>
        <div className="flex shrink-0 gap-2">
          <RefreshButton
            label="Làm mới ngân sách"
            queryKeys={[costManagementKeys.budgets()]}
          />
          {canCreate ? (
            <Button onClick={() => setDialogTarget("new")}>
              <Plus aria-hidden="true" />
              Thêm ngân sách
            </Button>
          ) : null}
        </div>
      </div>

      {budgetsQuery.isPending ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : budgetsQuery.isError ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {getErrorMessage(budgetsQuery.error)}
        </p>
      ) : (
        <BudgetList
          budgets={budgetsQuery.data ?? []}
          canDelete={canDelete}
          canUpdate={canUpdate}
          onEdit={setDialogTarget}
          onRequestDelete={setDeletingBudget}
        />
      )}

      {dialogTarget ? (
        <BudgetDialog
          budget={dialogTarget === "new" ? undefined : dialogTarget}
          isSaving={createBudget.isPending || updateBudget.isPending}
          onOpenChange={(open) => {
            if (!open) setDialogTarget(undefined)
          }}
          onSubmit={save}
        />
      ) : null}

      {deletingBudget ? (
        <ConfirmDeleteDialog
          description={`Ngân sách "${getBudgetScopeLabel(deletingBudget.scope)}" sẽ bị xóa vĩnh viễn.`}
          entityLabel="ngân sách"
          isSubmitting={deleteBudget.isPending}
          onConfirm={confirmDelete}
          onOpenChange={(open) => {
            if (!open) setDeletingBudget(undefined)
          }}
          title={`Xóa ngân sách "${getBudgetScopeLabel(deletingBudget.scope)}"?`}
        />
      ) : null}
    </div>
  )
}
