import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type AppUser,
  type CreateUserRequest,
  type UpdateUserRequest,
  type UserFormValues,
  userFormSchema,
} from "@/features/users/schemas/user-schemas"
import type { AccessRole } from "@/features/rbac/schemas/rbac-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type UserDialogProps = {
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateUserRequest | UpdateUserRequest) => Promise<void>
  open: boolean
  roles: AccessRole[]
  user?: AppUser
}

export function UserDialog({
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
  } = useForm<UserFormValues>({
    defaultValues: {
      accessLevelId: user?.accessLevelId ?? undefined,
      code: user?.code ?? undefined,
      departmentAccesses: [],
      email: user?.email ?? "",
      firstName: user?.firstName ?? "",
      gender: user?.gender ?? undefined,
      lastName: user?.lastName ?? "",
      password: "",
      phone: user?.phone ?? "",
      roleId: user?.roleId ?? undefined,
    },
    resolver: zodResolver(userFormSchema),
  })
  const isBusy = isSaving || isSubmitting

  const submit = async (values: UserFormValues) => {
    try {
      if (isEdit) {
        const updatePayload: UpdateUserRequest = {
          accessLevelId: values.accessLevelId,
          code: values.code,
          departmentAccesses: values.departmentAccesses ?? [],
          email: values.email,
          firstName: values.firstName,
          gender: values.gender,
          lastName: values.lastName,
          phone: values.phone,
          roleId: values.roleId ?? undefined,
        }
        await onSubmit(updatePayload)
      } else {
        if (!values.password || values.password.length < 8) {
          setError("password", {
            message: "Mật khẩu phải có ít nhất 8 ký tự.",
          })
          return
        }
        if (!values.roleId) {
          setError("roleId", {
            message: "Vui lòng chọn một vai trò.",
          })
          return
        }
        const createPayload: CreateUserRequest = {
          accessLevelId: values.accessLevelId,
          code: values.code,
          departmentAccesses: values.departmentAccesses ?? [],
          email: values.email,
          firstName: values.firstName,
          gender: values.gender,
          lastName: values.lastName,
          password: values.password,
          phone: values.phone,
          roleId: values.roleId,
        }
        await onSubmit(createPayload)
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
            Cấu hình thông tin tài khoản trong UniSage.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border p-3">
            <div className="space-y-2">
              <Label htmlFor="user-lastname">
                Họ <span className="translate-y-0.5 text-destructive">*</span>
              </Label>
              <Input
                aria-invalid={Boolean(errors.lastName)}
                autoFocus
                id="user-lastname"
                placeholder="Nguyễn"
                {...register("lastName")}
              />
              {errors.lastName ? (
                <p className="text-xs text-destructive">
                  {errors.lastName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-firstname">
                Tên <span className="translate-y-0.5 text-destructive">*</span>
              </Label>
              <Input
                aria-invalid={Boolean(errors.firstName)}
                id="user-firstname"
                placeholder="Văn A"
                {...register("firstName")}
              />
              {errors.firstName ? (
                <p className="text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-3">
            <div className="space-y-2">
              <Label htmlFor="user-email">
                Email{" "}
                <span className="translate-y-0.5 text-destructive">*</span>
              </Label>
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

            {!isEdit ? (
              <div className="space-y-2">
                <Label htmlFor="user-password">
                  Mật khẩu{" "}
                  <span className="translate-y-0.5 text-destructive">*</span>
                </Label>
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
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="user-phone">Số điện thoại</Label>
              <Input
                id="user-phone"
                placeholder="0901234567"
                type="tel"
                {...register("phone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-code">Mã GV/SV</Label>
              <Input
                id="user-code"
                placeholder="Ví dụ: 20012345, GV001..."
                {...register("code")}
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="user-role">
              Vai trò{" "}
              <span className="translate-y-0.5 text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue("roleId", value, { shouldDirty: true })
              }
              value={watch("roleId") ?? ""}
            >
              <SelectTrigger className="w-full" id="user-role">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roles
                  .filter((role) => role.isActive)
                  .map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.roleId ? (
              <p className="text-xs text-destructive">
                {errors.roleId.message}
              </p>
            ) : null}
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
