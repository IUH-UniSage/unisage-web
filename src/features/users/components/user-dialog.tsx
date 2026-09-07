import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, Lock, Mail, Save } from "lucide-react"
import { useMemo, useState } from "react"
import { useController, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDepartmentsQuery } from "@/features/departments/queries/use-queries"
import { useAccessLevelsQuery } from "@/features/access-level/queries/use-queries"
import { DepartmentAccessSection } from "@/features/users/components/department-access-section"
import {
  type AppUser,
  type CreateUserRequest,
  type UpdateUserRequest,
  type UserFormValues,
  userFormSchema,
} from "@/features/users/schemas/user-schemas"
import type { AccessRole } from "@/features/rbac/schemas/rbac-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"
import { cn } from "@/lib/utils"

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
  const [showPassword, setShowPassword] = useState(false)
  const departmentsQuery = useDepartmentsQuery()
  const accessLevelsQuery = useAccessLevelsQuery()
  const {
    control,
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
      departmentAccesses:
        user?.departmentAccesses?.map((access) => ({
          accessLevel: access.accessLevel ?? 0,
          departmentId: access.departmentId,
        })) ?? [],
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

  const departmentAccessesField = useController({
    control,
    name: "departmentAccesses",
  })
  const departmentAccesses = useMemo(
    () => departmentAccessesField.field.value ?? [],
    [departmentAccessesField.field.value]
  )
  const departmentTree = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data]
  )

  const handleCancel = () => {
    onOpenChange(false)
  }

  const submit = async (values: UserFormValues) => {
    const formDepartmentAccesses = values.departmentAccesses ?? []
    const departmentIds = formDepartmentAccesses.map(
      (access) => access.departmentId
    )
    if (new Set(departmentIds).size !== departmentIds.length) {
      setError("root", {
        message:
          "Mỗi phòng ban chỉ được gán một lần. Vui lòng kiểm tra lại danh sách phòng ban.",
      })
      return
    }

    const accessLevelIdByLevel = new Map(
      (accessLevelsQuery.data ?? []).map((accessLevel) => [
        accessLevel.level,
        accessLevel.id,
      ])
    )
    const departmentAccesses: {
      accessLevelId: string
      departmentId: string
    }[] = []
    for (const access of formDepartmentAccesses) {
      const accessLevelId = accessLevelIdByLevel.get(access.accessLevel)
      if (!accessLevelId) {
        setError("root", {
          message:
            "Một hoặc nhiều phòng ban chưa được chọn cấp độ hợp lệ. Vui lòng kiểm tra lại.",
        })
        return
      }
      departmentAccesses.push({
        accessLevelId,
        departmentId: access.departmentId,
      })
    }

    try {
      if (isEdit) {
        const updatePayload: UpdateUserRequest = {
          accessLevelId: values.accessLevelId,
          code: values.code,
          departmentAccesses,
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
          departmentAccesses,
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
        <Card className="border bg-card shadow-none">
          <CardContent className="space-y-6 pt-6">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Thông tin cá nhân & liên hệ
            </p>
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

            {/* Code & Password */}
            <div className={cn("grid gap-4", !isEdit && "sm:grid-cols-2")}>
              <div className="space-y-2">
                <Label htmlFor="user-code">Mã GV/SV (Mã định danh)</Label>
                <Input
                  id="user-code"
                  placeholder="Ví dụ: 20012345, GV001..."
                  {...register("code")}
                />
              </div>

              {!isEdit ? (
                <div className="space-y-2">
                  <Label htmlFor="user-password">
                    Mật khẩu khởi tạo{" "}
                    <span className="translate-y-0.5 text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      aria-invalid={Boolean(errors.password)}
                      className="pr-10 pl-9"
                      id="user-password"
                      placeholder="Tối thiểu 8 ký tự"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                    />
                    <Button
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      className="absolute top-0.5 right-0.5 size-8 text-muted-foreground"
                      onClick={() => setShowPassword((current) => !current)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" className="size-4" />
                      ) : (
                        <Eye aria-hidden="true" className="size-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Role & Department Access */}
            <div className="space-y-4 border-t pt-6">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Phân quyền & phòng ban
              </p>
              <div className="space-y-2">
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
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Quyền truy cập phòng ban</Label>
                <DepartmentAccessSection
                  onChange={(next) =>
                    departmentAccessesField.field.onChange(next)
                  }
                  tree={departmentTree}
                  value={departmentAccesses}
                />
              </div>
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
      </form>
    </div>
  )
}
