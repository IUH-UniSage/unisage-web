import { zodResolver } from "@hookform/resolvers/zod"
import { ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import {
  accessLevelRequestSchema,
  type AccessLevel,
  type CreateAccessLevelRequest,
} from "@/features/access-level/schemas/access-level-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type AccessLevelDialogProps = {
  accessLevel?: AccessLevel
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateAccessLevelRequest) => Promise<void>
  open: boolean
}

export function AccessLevelDialog({
  accessLevel,
  isSaving,
  onOpenChange,
  onSubmit,
  open,
}: AccessLevelDialogProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<CreateAccessLevelRequest>({
    defaultValues: {
      description: accessLevel?.description ?? null,
      level: accessLevel?.level ?? 0,
    },
    resolver: zodResolver(accessLevelRequestSchema),
  })
  const isBusy = isSaving || isSubmitting

  const submit = async (values: CreateAccessLevelRequest) => {
    try {
      await onSubmit({
        ...values,
        description: values.description?.trim() || null,
      })
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {accessLevel ? "Chỉnh sửa cấp độ truy cập" : "Thêm cấp độ truy cập"}
          </DialogTitle>
          <DialogDescription>
            Cấp độ dùng để giới hạn quyền truy cập tài liệu và quyền hạn theo
            một ngưỡng số nguyên.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="access-level-level">Cấp độ</Label>
            <Input
              aria-invalid={Boolean(errors.level)}
              autoFocus
              id="access-level-level"
              min={0}
              type="number"
              {...register("level", { valueAsNumber: true })}
            />
            {errors.level ? (
              <p className="text-xs text-destructive">{errors.level.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Số nguyên không âm, ví dụ: 0, 1, 2...
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="access-level-description">Mô tả</Label>
            <Textarea
              id="access-level-description"
              placeholder="Mô tả ý nghĩa của cấp độ này..."
              {...register("description")}
            />
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
              <ShieldCheck aria-hidden="true" />
              {isBusy
                ? "Đang lưu..."
                : accessLevel
                  ? "Lưu thay đổi"
                  : "Tạo cấp độ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
