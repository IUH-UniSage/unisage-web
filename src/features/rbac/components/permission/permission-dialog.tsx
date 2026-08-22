import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { ToggleOptionCard } from "@/components/shared/form/toggle-option-card"
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
  type AccessPermission,
  type CreatePermissionRequest,
  permissionRequestSchema,
} from "@/features/rbac/schemas/rbac-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type PermissionDialogProps = {
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreatePermissionRequest) => Promise<void>
  open: boolean
  permission?: AccessPermission
}

export function PermissionDialog({
  isSaving,
  onOpenChange,
  onSubmit,
  open,
  permission,
}: PermissionDialogProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<CreatePermissionRequest>({
    defaultValues: {
      accessLevel: permission?.accessLevel ?? null,
      isActive: permission?.isActive ?? true,
      name: permission?.name ?? "",
    },
    resolver: zodResolver(permissionRequestSchema),
  })
  const accessLevel = watch("accessLevel")
  const isBusy = isSaving || isSubmitting

  const submit = async (values: CreatePermissionRequest) => {
    try {
      await onSubmit({ ...values, name: values.name.trim() })
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
            {permission ? "Chỉnh sửa quyền hạn" : "Thêm quyền hạn mới"}
          </DialogTitle>
          <DialogDescription>
            Đặt tên quyền theo đúng định dạng (vd: DOCUMENT_READ) để có thể gán
            cho vai trò.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="permission-name">Tên quyền</Label>
            <Input
              aria-invalid={Boolean(errors.name)}
              autoFocus
              id="permission-name"
              placeholder="Ví dụ: DOCUMENT_READ"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Dùng chữ in hoa và dấu gạch dưới.
              </p>
            )}
          </div>

          <div className="space-y-3 rounded-xl border p-3">
            <Label htmlFor="permission-access-level">Cấp độ truy cập</Label>
            <Input
              disabled={accessLevel === null}
              id="permission-access-level"
              min={0}
              onChange={(event) =>
                setValue(
                  "accessLevel",
                  event.target.value === "" ? 0 : Number(event.target.value),
                  { shouldDirty: true }
                )
              }
              type="number"
              value={accessLevel ?? ""}
            />
            {errors.accessLevel ? (
              <p className="text-xs text-destructive">
                {errors.accessLevel.message}
              </p>
            ) : null}
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={accessLevel === null}
                onCheckedChange={(checked) =>
                  setValue("accessLevel", checked === true ? null : 0, {
                    shouldDirty: true,
                  })
                }
              />
              Không giới hạn
            </label>
          </div>

          <ToggleOptionCard
            checked={watch("isActive")}
            description="Cho phép gán quyền này cho vai trò."
            label="Kích hoạt quyền hạn"
            onCheckedChange={(checked) =>
              setValue("isActive", checked, { shouldDirty: true })
            }
          />

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
                : permission
                  ? "Lưu thay đổi"
                  : "Tạo quyền hạn"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
