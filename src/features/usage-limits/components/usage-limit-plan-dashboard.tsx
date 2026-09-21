import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/shared/dialog/confirm-delete-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UsageLimitPlanDialog } from "@/features/usage-limits/components/usage-limit-plan-dialog"
import {
  USAGE_LIMIT_PLAN_PAGE_SIZE,
  UsageLimitPlanList,
} from "@/features/usage-limits/components/usage-limit-plan-list"
import {
  useCreateUsageLimitPlanMutation,
  useDeleteUsageLimitPlanMutation,
  useUpdateUsageLimitPlanMutation,
} from "@/features/usage-limits/queries/use-mutations"
import { useUsageLimitPlansQuery } from "@/features/usage-limits/queries/use-queries"
import type {
  UsageLimitPlan,
  UsageLimitPlanRequest,
} from "@/features/usage-limits/schemas/usage-limit-schemas"
import {
  matchesPlanKind,
  type PlanKindFilter,
} from "@/features/usage-limits/utils/plan-kind"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"

const NO_PLANS: UsageLimitPlan[] = []

export function UsageLimitPlanDashboard() {
  const plansQuery = useUsageLimitPlansQuery()
  const createPlan = useCreateUsageLimitPlanMutation()
  const updatePlan = useUpdateUsageLimitPlanMutation()
  const deletePlan = useDeleteUsageLimitPlanMutation()
  const { canCreate, canDelete, canUpdate } =
    useResourcePermissions("usage_limit_plan")

  // Same "type, then press Lọc" behaviour as the other admin lists: the draft
  // is what the inputs show, the applied values are what filters the table.
  const [draftSearch, setDraftSearch] = useState("")
  const [draftKind, setDraftKind] = useState<PlanKindFilter>("all")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [appliedKind, setAppliedKind] = useState<PlanKindFilter>("all")
  const [page, setPage] = useState(1)

  // `undefined` = closed, `"new"` = creating, a plan = editing that plan.
  const [dialogTarget, setDialogTarget] = useState<UsageLimitPlan | "new">()
  const [deletingPlan, setDeletingPlan] = useState<UsageLimitPlan>()

  const plans = plansQuery.data ?? NO_PLANS
  const isFiltered = appliedSearch.trim() !== "" || appliedKind !== "all"

  const filteredPlans = useMemo(() => {
    const normalizedSearch = appliedSearch.trim().toLocaleLowerCase("vi")

    return plans.filter(
      (plan) =>
        matchesPlanKind(plan, appliedKind) &&
        (!normalizedSearch ||
          plan.name.toLocaleLowerCase("vi").includes(normalizedSearch))
    )
  }, [appliedKind, appliedSearch, plans])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlans.length / USAGE_LIMIT_PLAN_PAGE_SIZE)
  )
  const currentPage = Math.min(page, totalPages)
  const pagedPlans = filteredPlans.slice(
    (currentPage - 1) * USAGE_LIMIT_PLAN_PAGE_SIZE,
    currentPage * USAGE_LIMIT_PLAN_PAGE_SIZE
  )

  const applyFilters = () => {
    setAppliedSearch(draftSearch)
    setAppliedKind(draftKind)
    setPage(1)
  }

  const resetFilters = () => {
    setDraftSearch("")
    setDraftKind("all")
    setAppliedSearch("")
    setAppliedKind("all")
    setPage(1)
  }

  const save = async (input: UsageLimitPlanRequest) => {
    if (dialogTarget && dialogTarget !== "new") {
      await updatePlan.mutateAsync({ input, planId: dialogTarget.id })
    } else {
      await createPlan.mutateAsync(input)
    }
    setDialogTarget(undefined)
  }

  const confirmDelete = async () => {
    if (!deletingPlan) return

    await deletePlan.mutateAsync(deletingPlan.id)
    setDeletingPlan(undefined)
  }

  if (plansQuery.isPending) {
    return <UsageLimitPlanSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Hạn mức
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">
            Cấu hình hạn mức
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Quản lý các gói hạn mức token theo 24 giờ và 7 ngày. Gắn gói cho vai
            trò ở trang quản lý vai trò. Khách chưa đăng nhập và vai trò chưa có
            gói dùng gói mặc định.
          </p>
        </div>

        {canCreate ? (
          <Button
            className="sm:self-end"
            onClick={() => setDialogTarget("new")}
          >
            <Plus aria-hidden="true" />
            Thêm gói mới
          </Button>
        ) : null}
      </div>

      <UsageLimitPlanList
        canDelete={canDelete}
        canUpdate={canUpdate}
        currentPage={currentPage}
        isFiltered={isFiltered}
        kind={draftKind}
        onApplyFilters={applyFilters}
        onEdit={setDialogTarget}
        onKindChange={setDraftKind}
        onPageChange={setPage}
        onRequestDelete={setDeletingPlan}
        onResetFilters={resetFilters}
        onSearchChange={setDraftSearch}
        plans={pagedPlans}
        search={draftSearch}
        totalItems={filteredPlans.length}
        totalPages={totalPages}
      />

      {dialogTarget ? (
        <UsageLimitPlanDialog
          isSaving={createPlan.isPending || updatePlan.isPending}
          onOpenChange={(open) => {
            if (!open) setDialogTarget(undefined)
          }}
          onSubmit={save}
          plan={dialogTarget === "new" ? undefined : dialogTarget}
        />
      ) : null}

      {deletingPlan ? (
        <ConfirmDeleteDialog
          description={`Gói "${deletingPlan.name}" sẽ bị xóa vĩnh viễn. Không xóa được gói đang gán cho vai trò.`}
          entityLabel="gói hạn mức"
          isSubmitting={deletePlan.isPending}
          onConfirm={confirmDelete}
          onOpenChange={(open) => {
            if (!open) setDeletingPlan(undefined)
          }}
          title={`Xóa gói "${deletingPlan.name}"?`}
        />
      ) : null}
    </div>
  )
}

function UsageLimitPlanSkeleton() {
  return (
    <div className="space-y-5" aria-label="Đang tải danh sách gói hạn mức">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-155 max-w-full" />
      </div>
      <Skeleton className="h-[420px] rounded-xl" />
    </div>
  )
}
