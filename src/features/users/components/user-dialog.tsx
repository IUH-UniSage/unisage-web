import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Lock, Mail, Save, Shield, User } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  open?: boolean
  roles: AccessRole[]
  user?: AppUser
}

export function UserDialog({
  isSaving,
  onOpenChange,
  onSubmit,
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

  const handleCancel = () => {
    onOpenChange(false)
  }

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

  const displayName = isEdit
    ? [user?.firstName, user?.lastName].filter(Boolean).join(" ")
    : ""

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Người dùng
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">
            {isEdit
              ? `Chỉnh sửa người dùng — ${displayName || user?.email}`
              : "Thêm người dùng mới"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cấu hình thông tin cá nhân, tài khoản và gán vai trò trong hệ thống
            UniSage.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <Button
            disabled={isBusy}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            Hủy
          </Button>
          <Button disabled={isBusy} form="user-form" type="submit">
            {isBusy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                {isEdit ? "Lưu thay đổi" : "Tạo người dùng"}
              </>
            )}
          </Button>
        </div>
      </div>

      <form
        className="space-y-6"
        id="user-form"
        onSubmit={(event) => void handleSubmit(submit)(event)}
      >
        {/* Personal & Contact Information Card */}
        <Card className="border bg-card shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Thông tin cá nhân & liên hệ
              </CardTitle>
            </div>
            <CardDescription>
              Họ tên, email, số điện thoại và mã danh tính của người dùng.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name fields */}
            <div className="grid gap-4 sm:grid-cols-2">
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
                  Tên{" "}
                  <span className="translate-y-0.5 text-destructive">*</span>
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

            {/* Email & Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-email">
                  Email đăng nhập{" "}
                  <span className="translate-y-0.5 text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-invalid={Boolean(errors.email)}
                    className="pl-9"
                    id="user-email"
                    placeholder="example@iuh.edu.vn"
                    type="email"
                    {...register("email")}
                  />
                </div>
                {errors.email ? (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-phone">Số điện thoại</Label>
                <Input
                  id="user-phone"
                  placeholder="0901234567"
                  type="tel"
                  {...register("phone")}
                />
              </div>
            </div>

            {/* Code */}
            <div className="max-w-md space-y-2">
              <Label htmlFor="user-code">Mã GV/SV (Mã định danh)</Label>
              <Input
                id="user-code"
                placeholder="Ví dụ: 20012345, GV001..."
                {...register("code")}
              />
              <p className="text-xs text-muted-foreground">
                Mã giảng viên, sinh viên hoặc mã nhân viên trong tổ chức.
              </p>
            </div>

            {/* Password (Only when creating) */}
            {!isEdit ? (
              <div className="max-w-md space-y-2 border-t pt-4">
                <Label htmlFor="user-password">
                  Mật khẩu khởi tạo{" "}
                  <span className="translate-y-0.5 text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-invalid={Boolean(errors.password)}
                    className="pl-9"
                    id="user-password"
                    placeholder="Tối thiểu 8 ký tự"
                    type="password"
                    {...register("password")}
                  />
                </div>
                {errors.password ? (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Mật khẩu cần ít nhất 8 ký tự. Người dùng có thể đổi lại sau.
                  </p>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Role Assignment Card */}
        <Card className="border bg-card shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Phân quyền & Vai trò
              </CardTitle>
            </div>
            <CardDescription>
              Gán nhóm quyền truy cập chính cho người dùng trong hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md space-y-2">
              <Label htmlFor="user-role">
                Vai trò hệ thống{" "}
                <span className="translate-y-0.5 text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("roleId", value, { shouldDirty: true })
                }
                value={watch("roleId") ?? ""}
              >
                <SelectTrigger className="w-full" id="user-role">
                  <SelectValue placeholder="Chọn vai trò cho tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  {roles
                    .filter((role) => role.isActive)
                    .map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                        {role.description ? ` — ${role.description}` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.roleId ? (
                <p className="text-xs text-destructive">
                  {errors.roleId.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Vai trò quyết định toàn bộ quyền thao tác chính trên UniSage.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {errors.root?.message ? (
          <p
            className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive"
            role="alert"
          >
            {errors.root.message}
          </p>
        ) : null}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button
            disabled={isBusy}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            Hủy
          </Button>
          <Button disabled={isBusy} type="submit">
            {isBusy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                {isEdit ? "Lưu thay đổi" : "Tạo người dùng"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
