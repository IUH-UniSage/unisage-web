import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound } from "lucide-react"
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
  type AccessPermission,
  type CreatePermissionRequest,
  permissionRequestSchema,
} from "@/features/access-control/schemas/access-control-schemas"

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
    } catch {
      // The global mutation handler presents the API error.
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
            Đặt tên quyền theo đúng định dạng backend (vd: DOCUMENT_READ) để có
            thể gán cho vai trò.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div className="space-y-2">
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
                Dùng chữ in hoa và dấu gạch dưới, khớp đúng tên backend.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="permission-access-level">Cấp độ truy cập</Label>
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
          </div>

          <label className="flex items-start gap-3 rounded-xl border p-3">
            <Checkbox
              checked={watch("isActive")}
              onCheckedChange={(checked) =>
                setValue("isActive", checked === true, { shouldDirty: true })
              }
            />
            <span>
              <span className="block text-sm font-medium">
                Kích hoạt quyền hạn
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Cho phép gán quyền này cho vai trò.
              </span>
            </span>
          </label>

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isBusy} type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button disabled={isBusy} type="submit">
              <KeyRound aria-hidden="true" />
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
