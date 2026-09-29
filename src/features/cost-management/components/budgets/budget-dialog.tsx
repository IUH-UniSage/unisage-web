import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CHAT_MODEL_PROVIDERS } from "@/features/chat-models/constants/chat-model-providers"
import {
  budgetActionSchema,
  budgetFormSchema,
  budgetPeriodSchema,
  budgetScopeSchema,
  usagePurposeSchema,
  type Budget,
  type BudgetFormValues,
  type CreateBudgetRequest,
} from "@/features/cost-management/schemas/cost-management-schemas"
import {
  getBudgetActionLabel,
  getBudgetPeriodLabel,
  getBudgetScopeLabel,
} from "@/features/cost-management/utils/budget-labels"
import { getUsagePurposeLabel } from "@/features/cost-management/utils/purpose-labels"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type BudgetDialogProps = {
  budget?: Budget
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateBudgetRequest) => Promise<void>
}

export function BudgetDialog({
  budget,
  isSaving,
  onOpenChange,
  onSubmit,
}: BudgetDialogProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<BudgetFormValues>({
    defaultValues: {
      action: budget?.action ?? "ALERT",
      isEnabled: budget?.isEnabled ?? true,
      limitUsd: budget?.limitUsd ?? 0,
      period: budget?.period ?? "MONTHLY",
      scope: budget?.scope ?? "SYSTEM",
      scopeProvider: budget?.scopeProvider ?? undefined,
      scopePurpose: budget?.scopePurpose ?? undefined,
      throttleMaxConcurrency: budget?.throttleMaxConcurrency ?? undefined,
    },
    resolver: zodResolver(budgetFormSchema),
  })
  const scope = watch("scope")
  const action = watch("action")
  const isBusy = isSaving || isSubmitting

  const submit = async (values: BudgetFormValues) => {
    try {
      await onSubmit({
        action: values.action,
        isEnabled: values.isEnabled,
        limitUsd: values.limitUsd,
        period: values.period,
        scope: values.scope,
        scopeProvider:
          values.scope === "PROVIDER" ? values.scopeProvider : undefined,
        scopePurpose:
          values.scope === "PURPOSE" ? values.scopePurpose : undefined,
        throttleMaxConcurrency:
          values.action === "THROTTLE"
            ? values.throttleMaxConcurrency
            : undefined,
      })
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {budget ? "Chỉnh sửa ngân sách" : "Thêm ngân sách mới"}
          </DialogTitle>
          <DialogDescription>
            Ngân sách là giới hạn mềm - có thể vượt nhẹ bởi các request đang
            chạy khi vừa chạm ngưỡng. Hết ngân sách PROVIDER sẽ chuyển sang nhà
            cung cấp khác; hết ngân sách SYSTEM/PURPOSE sẽ từ chối request mới.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div className="space-y-3 rounded-xl border p-3">
            <Label htmlFor="budget-scope">Phạm vi</Label>
            <Select
              onValueChange={(value) =>
                setValue("scope", value as BudgetFormValues["scope"], {
                  shouldDirty: true,
                })
              }
              value={scope}
            >
              <SelectTrigger className="w-full" id="budget-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {budgetScopeSchema.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {getBudgetScopeLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {scope === "PROVIDER" ? (
              <>
                <Label htmlFor="budget-scope-provider">Nhà cung cấp</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("scopeProvider", value, { shouldDirty: true })
                  }
                  value={watch("scopeProvider") || undefined}
                >
                  <SelectTrigger
                    aria-invalid={Boolean(errors.scopeProvider)}
                    className="w-full"
                    id="budget-scope-provider"
                  >
                    <SelectValue placeholder="Chọn nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAT_MODEL_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.scopeProvider ? (
                  <p className="text-xs text-destructive">
                    {errors.scopeProvider.message}
                  </p>
                ) : null}
              </>
            ) : null}

            {scope === "PURPOSE" ? (
              <>
                <Label htmlFor="budget-scope-purpose">Mục đích</Label>
                <Select
                  onValueChange={(value) =>
                    setValue(
                      "scopePurpose",
                      value as BudgetFormValues["scopePurpose"],
                      { shouldDirty: true }
                    )
                  }
                  value={watch("scopePurpose") || undefined}
                >
                  <SelectTrigger
                    aria-invalid={Boolean(errors.scopePurpose)}
                    className="w-full"
                    id="budget-scope-purpose"
                  >
                    <SelectValue placeholder="Chọn mục đích" />
                  </SelectTrigger>
                  <SelectContent>
                    {usagePurposeSchema.options.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {getUsagePurposeLabel(purpose)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.scopePurpose ? (
                  <p className="text-xs text-destructive">
                    {errors.scopePurpose.message}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border p-3">
            <div className="space-y-2">
              <Label htmlFor="budget-period">Chu kỳ</Label>
              <Select
                onValueChange={(value) =>
                  setValue("period", value as BudgetFormValues["period"], {
                    shouldDirty: true,
                  })
                }
                value={watch("period")}
              >
                <SelectTrigger className="w-full" id="budget-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {budgetPeriodSchema.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {getBudgetPeriodLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-limit">Giới hạn ($)</Label>
              <Input
                aria-invalid={Boolean(errors.limitUsd)}
                id="budget-limit"
                min={0}
                step="0.01"
                type="number"
                {...register("limitUsd", { valueAsNumber: true })}
              />
              {errors.limitUsd ? (
                <p className="text-xs text-destructive">
                  {errors.limitUsd.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border p-3">
            <Label htmlFor="budget-action">Hành động khi vượt ngân sách</Label>
            <Select
              onValueChange={(value) =>
                setValue("action", value as BudgetFormValues["action"], {
                  shouldDirty: true,
                })
              }
              value={action}
            >
              <SelectTrigger className="w-full" id="budget-action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {budgetActionSchema.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {getBudgetActionLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {action === "THROTTLE" ? (
              <>
                <Label htmlFor="budget-throttle-concurrency">
                  Số request đồng thời tối đa
                </Label>
                <Input
                  aria-invalid={Boolean(errors.throttleMaxConcurrency)}
                  id="budget-throttle-concurrency"
                  min={1}
                  type="number"
                  {...register("throttleMaxConcurrency", {
                    valueAsNumber: true,
                  })}
                />
                {errors.throttleMaxConcurrency ? (
                  <p className="text-xs text-destructive">
                    {errors.throttleMaxConcurrency.message}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="flex items-start gap-3 rounded-xl border p-3">
            <Checkbox
              checked={watch("isEnabled")}
              id="budget-enabled"
              onCheckedChange={(checked) =>
                setValue("isEnabled", checked === true)
              }
            />
            <div>
              <Label htmlFor="budget-enabled">Kích hoạt ngân sách này</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Chỉ một ngân sách được bật cho mỗi phạm vi + chu kỳ.
              </p>
            </div>
          </div>

          {errors.root?.message ? (
            <p
              className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              {errors.root.message}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isBusy} type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button disabled={isBusy} type="submit">
              {isBusy
                ? "Đang lưu..."
                : budget
                  ? "Lưu thay đổi"
                  : "Tạo ngân sách"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
