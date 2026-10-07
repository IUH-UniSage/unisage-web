import { zodResolver } from "@hookform/resolvers/zod"
import { Gauge } from "lucide-react"
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
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { DialogTourButton } from "@/features/product-tour"
import {
  usageLimitPlanFormSchema,
  type UsageLimitPlan,
  type UsageLimitPlanFormValues,
  type UsageLimitPlanRequest,
} from "@/features/usage-limits/schemas/usage-limit-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type UsageLimitPlanDialogProps = {
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UsageLimitPlanRequest) => Promise<void>
  plan?: UsageLimitPlan
}

const toLimit = (value: string) => (value.trim() === "" ? null : Number(value))

export function UsageLimitPlanDialog({
  isSaving,
  onOpenChange,
  onSubmit,
  plan,
}: UsageLimitPlanDialogProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<UsageLimitPlanFormValues>({
    defaultValues: {
      dailyTokenLimit: plan?.dailyTokenLimit?.toString() ?? "",
      isDefault: plan?.isDefault ?? false,
      name: plan?.name ?? "",
      weeklyTokenLimit: plan?.weeklyTokenLimit?.toString() ?? "",
    },
    resolver: zodResolver(usageLimitPlanFormSchema),
  })
  const isBusy = isSaving || isSubmitting
  // The one default plan cannot be unmarked here: pick another plan as default instead.
  const isLockedDefault = plan?.isDefault === true

  const submit = async (values: UsageLimitPlanFormValues) => {
    try {
      await onSubmit({
        dailyTokenLimit: toLimit(values.dailyTokenLimit),
        isDefault: values.isDefault,
        name: values.name.trim(),
        weeklyTokenLimit: toLimit(values.weeklyTokenLimit),
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
        <DialogTourButton tourKey="usage-limit-plan-form" />
        <DialogHeader {...tourAnchor(TOUR_ANCHORS.dialogHeader)}>
          <DialogTitle>
            {plan ? "Chỉnh sửa gói hạn mức" : "Thêm gói hạn mức"}
          </DialogTitle>
          <DialogDescription>
            Hạn mức tính bằng token, cho mỗi 24 giờ và mỗi 7 ngày kể từ lượt hỏi
            đầu tiên. Để trống nếu không giới hạn.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div
            {...tourAnchor(TOUR_ANCHORS.usagePlanFormName)}
            className="space-y-2 rounded-xl border p-3"
          >
            <Label htmlFor="usage-plan-name">Tên gói</Label>
            <Input
              aria-invalid={Boolean(errors.name)}
              autoFocus
              id="usage-plan-name"
              placeholder="Ví dụ: Giảng viên"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div
            {...tourAnchor(TOUR_ANCHORS.usagePlanFormLimits)}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2 rounded-xl border p-3">
              <Label htmlFor="usage-plan-daily">Token / 24 giờ</Label>
              <Input
                aria-invalid={Boolean(errors.dailyTokenLimit)}
                id="usage-plan-daily"
                inputMode="numeric"
                placeholder="Không giới hạn"
                {...register("dailyTokenLimit")}
              />
              {errors.dailyTokenLimit ? (
                <p className="text-xs text-destructive">
                  {errors.dailyTokenLimit.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 rounded-xl border p-3">
              <Label htmlFor="usage-plan-weekly">Token / 7 ngày</Label>
              <Input
                aria-invalid={Boolean(errors.weeklyTokenLimit)}
                id="usage-plan-weekly"
                inputMode="numeric"
                placeholder="Không giới hạn"
                {...register("weeklyTokenLimit")}
              />
              {errors.weeklyTokenLimit ? (
                <p className="text-xs text-destructive">
                  {errors.weeklyTokenLimit.message}
                </p>
              ) : null}
            </div>
          </div>

          <div
            {...tourAnchor(TOUR_ANCHORS.usagePlanFormDefault)}
            className="flex items-start gap-3 rounded-xl border p-3"
          >
            <Checkbox
              checked={watch("isDefault")}
              disabled={isLockedDefault}
              id="usage-plan-default"
              onCheckedChange={(checked) =>
                setValue("isDefault", checked === true)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="usage-plan-default">Đặt làm gói mặc định</Label>
              <p className="text-xs leading-5 text-muted-foreground">
                {isLockedDefault
                  ? "Đây là gói mặc định. Để đổi, hãy đặt một gói khác làm mặc định."
                  : "Gói mặc định áp dụng cho khách chưa đăng nhập và các vai trò chưa được gán gói. Gói mặc định hiện tại sẽ được thay thế."}
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

          <DialogFooter {...tourAnchor(TOUR_ANCHORS.dialogFooter)}>
            <DialogClose asChild>
              <Button disabled={isBusy} type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button disabled={isBusy} type="submit">
              <Gauge aria-hidden="true" />
              {isBusy ? "Đang lưu..." : plan ? "Lưu thay đổi" : "Tạo gói"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
