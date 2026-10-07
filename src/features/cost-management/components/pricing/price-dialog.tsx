import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
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
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { CHAT_MODEL_PROVIDERS } from "@/features/chat-models/constants/chat-model-providers"
import {
  modelPriceFormSchema,
  type ModelPrice,
  type ModelPriceFormOutput,
  type ModelPriceFormValues,
  type ModelPriceRequest,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { DialogTourButton } from "@/features/product-tour"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type PriceDialogProps = {
  // Prefill for "add price" launched from a registered model that has none yet.
  initialModel?: { modelName: string; provider: string }
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: ModelPriceRequest) => Promise<void>
  price?: ModelPrice
}

const PRICE_FIELDS = [
  { id: "inputPerMillion", label: "Input", required: true },
  { id: "cachedInputPerMillion", label: "Input cache", required: false },
  { id: "outputPerMillion", label: "Output", required: false },
] as const

export function PriceDialog({
  initialModel,
  isSaving,
  onOpenChange,
  onSubmit,
  price,
}: PriceDialogProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<ModelPriceFormValues, unknown, ModelPriceFormOutput>({
    defaultValues: {
      cachedInputPerMillion: price?.cachedInputPerMillion ?? undefined,
      inputPerMillion: price?.inputPerMillion ?? undefined,
      modelName: price?.modelName ?? initialModel?.modelName ?? "",
      outputPerMillion: price?.outputPerMillion ?? undefined,
      provider: price?.provider ?? initialModel?.provider ?? "",
    },
    resolver: zodResolver(modelPriceFormSchema),
  })
  const isEditing = Boolean(price)
  const isBusy = isSaving || isSubmitting

  const submit = async (values: ModelPriceFormOutput) => {
    try {
      await onSubmit({
        cachedInputPerMillion: values.cachedInputPerMillion,
        inputPerMillion: values.inputPerMillion,
        modelName: isEditing ? undefined : values.modelName,
        outputPerMillion: values.outputPerMillion,
        provider: isEditing ? undefined : values.provider,
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
        <DialogTourButton tourKey="price-form" />
        <DialogHeader {...tourAnchor(TOUR_ANCHORS.dialogHeader)}>
          <DialogTitle>
            {isEditing ? `Sửa giá ${price?.modelName}` : "Thêm giá mô hình"}
          </DialogTitle>
          <DialogDescription>
            Giá tính bằng USD cho mỗi 1 triệu token. Giá chỉnh tay không bị đồng
            bộ LiteLLM ghi đè và chỉ áp dụng cho các lượt gọi sau khi lưu.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div
            {...tourAnchor(TOUR_ANCHORS.priceFormModel)}
            className="grid grid-cols-2 gap-3 rounded-xl border p-3"
          >
            <div className="space-y-2">
              <Label htmlFor="price-provider">Nhà cung cấp</Label>
              <Select
                disabled={isEditing}
                onValueChange={(value) =>
                  setValue("provider", value, { shouldDirty: true })
                }
                value={watch("provider") || undefined}
              >
                <SelectTrigger
                  aria-invalid={Boolean(errors.provider)}
                  className="w-full"
                  id="price-provider"
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
              {errors.provider ? (
                <p className="text-xs text-destructive">
                  {errors.provider.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price-model">Mô hình</Label>
              <Input
                aria-invalid={Boolean(errors.modelName)}
                disabled={isEditing}
                id="price-model"
                placeholder="vd. gpt-4o-mini"
                {...register("modelName")}
              />
              {errors.modelName ? (
                <p className="text-xs text-destructive">
                  {errors.modelName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div
            {...tourAnchor(TOUR_ANCHORS.priceFormRates)}
            className="grid grid-cols-3 gap-3 rounded-xl border p-3"
          >
            {PRICE_FIELDS.map((field) => (
              <div className="space-y-2" key={field.id}>
                <Label htmlFor={`price-${field.id}`}>
                  {field.label} ($/1M)
                </Label>
                <Input
                  aria-invalid={Boolean(errors[field.id])}
                  id={`price-${field.id}`}
                  min={0}
                  placeholder={field.required ? undefined : "Không có"}
                  step="any"
                  type="number"
                  {...register(field.id, { valueAsNumber: true })}
                />
                {errors[field.id] ? (
                  <p className="text-xs text-destructive">
                    {errors[field.id]?.message}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Bỏ trống giá cache để tính token cache theo giá input; bỏ trống
            output cho mô hình embedding.
          </p>

          {errors.root ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
              {errors.root.message}
            </p>
          ) : null}

          <DialogFooter {...tourAnchor(TOUR_ANCHORS.dialogFooter)}>
            <Button
              disabled={isBusy}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Hủy
            </Button>
            <Button disabled={isBusy} type="submit">
              {isEditing ? "Lưu giá" : "Thêm giá"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
