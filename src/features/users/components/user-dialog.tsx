import { zodResolver } from "@hookform/resolvers/zod"
import { UserCog } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createUserRequestSchema,
  updateUserRequestSchema,
  type AppUser,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "@/features/users/schemas/user-schemas"
import type { AccessRole } from "@/features/rbac/schemas/rbac-schemas"
import type { Department } from "@/features/departments/schemas/department-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type UserDialogProps = {
  departments: Department[]
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateUserRequest | UpdateUserRequest) => Promise<void>
  open: boolean
  roles: AccessRole[]
  user?: AppUser
}

export function UserDialog({
  departments,
  isSaving,
  onOpenChange,
  onSubmit,
  open,
  roles,
  user,
}: UserDialogProps) {
  const isEdit = Boolean(user)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<CreateUserRequest>({
    defaultValues: {
      departmentId: user?.department?.id ?? null,
      email: user?.email ?? "",
      fullName: user?.fullName ?? "",
      isActive: user?.isActive ?? true,
      password: "",
      roleIds: user?.roles.map((role) => role.id) ?? [],
      username: user?.username ?? "",
    },
    resolver: zodResolver(
      isEdit ? updateUserRequestSchema : createUserRequestSchema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any,
  })

  const selectedRoleIds = watch("roleIds")
  const isBusy = isSaving || isSubmitting

  const toggleRole = (roleId: string, checked: boolean) => {
    if (checked) {
      setValue("roleIds", [...selectedRoleIds, roleId], { shouldDirty: true })
    } else {
      setValue(
        "roleIds",
        selectedRoleIds.filter((id) => id !== roleId),
        { shouldDirty: true }
      )
    }
  }

  const submit = async (values: CreateUserRequest) => {
    try {
      if (isEdit) {
        const updatePayload: UpdateUserRequest = {
          departmentId: values.departmentId,
          fullName: values.fullName.trim(),
          isActive: values.isActive,
          roleIds: values.roleIds,
        }
        await onSubmit(updatePayload)
      } else {
        await onSubmit({
          ...values,
          fullName: values.fullName.trim(),
          username: values.username.trim(),
          email: values.email.trim(),
        })
      }
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {user ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </DialogTitle>
          <DialogDescription>
            Cấu hình thông tin tài khoản và phân công vai trò trong UniSage.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          {/* Basic info */}
          <div className="space-y-4 rounded-xl border p-3">
            <div className="space-y-2">
              <Label htmlFor="user-fullname">Họ và tên</Label>
              <Input
                aria-invalid={Boolean(errors.fullName)}
                autoFocus
                id="user-fullname"
                placeholder="Nguyễn Văn A"
                {...register("fullName")}
              />
              {errors.fullName ? (
                <p className="text-xs text-destructive">
                  {errors.fullName.message}
                </p>
              ) : null}
            </div>

            {!isEdit ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="user-username">Tên đăng nhập</Label>
                  <Input
                    aria-invalid={Boolean(errors.username)}
                    id="user-username"
                    placeholder="nguyen_van_a"
                    {...register("username")}
                  />
                  {errors.username ? (
                    <p className="text-xs text-destructive">
                      {errors.username.message}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Chữ thường, số và dấu gạch dưới.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    aria-invalid={Boolean(errors.email)}
                    id="user-email"
                    placeholder="example@iuh.edu.vn"
                    type="email"
                    {...register("email")}
                  />
                  {errors.email ? (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-password">Mật khẩu</Label>
                  <Input
                    aria-invalid={Boolean(errors.password)}
                    id="user-password"
                    type="password"
                    {...register("password")}
                  />
                  {errors.password ? (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="user-department">Phòng ban</Label>
              <Select
                onValueChange={(value) =>
                  setValue("departmentId", value === "none" ? null : value, {
                    shouldDirty: true,
                  })
                }
                value={watch("departmentId") ?? "none"}
              >
                <SelectTrigger
                  aria-label="Chọn phòng ban"
                  className="w-full"
                  id="user-department"
                >
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    — Không thuộc phòng ban —
                  </SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Role assignment */}
          <div className="overflow-hidden rounded-xl border">
            <div className="border-b p-3">
              <p className="text-sm font-semibold">Gán vai trò</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Đã chọn {selectedRoleIds.length} vai trò
              </p>
            </div>
            <ScrollArea className="h-40">
              <div className="space-y-0.5 p-2">
                {roles
                  .filter((role) => role.isActive)
                  .map((role) => {
                    const checked = selectedRoleIds.includes(role.id)
                    return (
                      <label
                        className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                        key={role.id}
                      >
                        <Checkbox
                          aria-label={`Gán vai trò ${role.name}`}
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleRole(role.id, value === true)
                          }
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium">
                            {role.name}
                          </span>
                          {role.description ? (
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {role.description}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    )
                  })}
              </div>
            </ScrollArea>
          </div>

          {/* Status toggle */}
          <ToggleOptionCard
            checked={watch("isActive")}
            description="Cho phép tài khoản này đăng nhập và sử dụng hệ thống."
            label="Kích hoạt tài khoản"
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
              <UserCog aria-hidden="true" />
              {isBusy
                ? "Đang lưu..."
                : user
                  ? "Lưu thay đổi"
                  : "Tạo người dùng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
