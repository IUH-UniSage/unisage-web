import { useDeferredValue, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Info, Loader2, Save, ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"

import { ToggleOptionCard } from "@/components/shared/form/toggle-option-card"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { PermissionMatrix } from "@/features/rbac/components/permission/permission-matrix"
import { buildPermissionMatrix } from "@/features/rbac/utils/permission-matrix"
import {
  expandImpliedPermissionIds,
  isImpliedByAll,
  splitPermissionName,
} from "@/features/rbac/utils/rbac-formatters"
import {
  createRoleRequestSchema,
  type AccessPermission,
  type AccessRole,
  type CreateRoleRequest,
} from "@/features/rbac/schemas/rbac-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type RoleDialogProps = {
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateRoleRequest) => Promise<void>
  open?: boolean
  permissions: AccessPermission[]
  role?: AccessRole
}

export function RoleDialog({
  isSaving,
  onOpenChange,
  onSubmit,
  permissions,
  role,
}: RoleDialogProps) {
  const [permissionSearch, setPermissionSearch] = useState("")
  const deferredPermissionSearch = useDeferredValue(permissionSearch)
  const matrixRows = useMemo(
    () => buildPermissionMatrix(permissions, deferredPermissionSearch),
    [deferredPermissionSearch, permissions]
  )

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<CreateRoleRequest>({
    defaultValues: {
      description: role?.description ?? "",
      isActive: role?.isActive ?? true,
      isSystemRole: role?.isSystemRole ?? false,
      name: role?.name ?? "",
      permissionIds: expandImpliedPermissionIds(
        role?.permissions.map((permission) => permission.id) ?? [],
        permissions
      ),
    },
    resolver: zodResolver(createRoleRequestSchema),
  })

  const selectedPermissionIds = watch("permissionIds")
  const isBusy = isSaving || isSubmitting

  const handleCancel = () => {
    onOpenChange(false)
  }

  // Resources whose "ALL" permission is currently checked — their other
  // action checkboxes are implied and locked, so users can't leave a
  // contradictory ALL-plus-partial selection the backend has no way to
  // represent (its authorization check treats "ALL" as matching every HTTP
  // method on that resource path).
  const resourcesWithAllChecked = new Set(
    permissions
      .filter((candidate) => selectedPermissionIds.includes(candidate.id))
      .map((candidate) => splitPermissionName(candidate.name))
      .filter(({ action }) => action === "ALL")
      .map(({ resource }) => resource)
  )

  const isCellDisabled = (permission: AccessPermission) =>
    isImpliedByAll(permission, resourcesWithAllChecked)

  const onToggleCell = (permission: AccessPermission, checked: boolean) => {
    const { action, resource } = splitPermissionName(permission.name)

    if (!checked) {
      const idsToRemove = new Set(
        action === "ALL"
          ? [
              permission.id,
              ...permissions
                .filter((candidate) => {
                  const split = splitPermissionName(candidate.name)
                  return split.resource === resource && split.action !== "ALL"
                })
                .map((candidate) => candidate.id),
            ]
          : [permission.id]
      )
      setValue(
        "permissionIds",
        selectedPermissionIds.filter((id) => !idsToRemove.has(id)),
        { shouldDirty: true }
      )
      return
    }

    const nextIds = expandImpliedPermissionIds(
      [...selectedPermissionIds, permission.id],
      permissions
    )
    setValue("permissionIds", nextIds, { shouldDirty: true })
  }

  const onToggleRow = (ids: string[], selectAll: boolean) => {
    if (selectAll) {
      const nextIds = expandImpliedPermissionIds(
        Array.from(new Set([...selectedPermissionIds, ...ids])),
        permissions
      )
      setValue("permissionIds", nextIds, { shouldDirty: true })
    } else {
      setValue(
        "permissionIds",
        selectedPermissionIds.filter((id) => !ids.includes(id)),
        { shouldDirty: true }
      )
    }
  }

  const submit = async (values: CreateRoleRequest) => {
    try {
      await onSubmit({
        ...values,
        description: values.description?.trim() || null,
        name: values.name.trim(),
      })
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            aria-label="Quay lại"
            className="mt-0.5 shrink-0"
            disabled={isBusy}
            onClick={handleCancel}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Quản trị · Phân quyền
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              {role ? `Chỉnh sửa vai trò — ${role.name}` : "Thêm vai trò mới"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cấu hình thông tin vai trò và các quyền hạn được phép sử dụng
              trong hệ thống UniSage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-start">
          <Button
            disabled={isBusy}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            Hủy
          </Button>
          <Button disabled={isBusy} form="role-form" type="submit">
            {isBusy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                {role ? "Lưu thay đổi" : "Tạo vai trò"}
              </>
            )}
          </Button>
        </div>
      </div>

      <form
        className="space-y-6"
        id="role-form"
        onSubmit={(event) => void handleSubmit(submit)(event)}
      >
        {/* Basic Information Card */}
        <Card className="border bg-card shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Info className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Thông tin cơ bản
              </CardTitle>
            </div>
            <CardDescription>
              Thiết lập tên gọi, mô tả và phân loại cơ bản cho vai trò.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="role-name">
                  Tên vai trò{" "}
                  <span className="translate-y-0.5 text-destructive">*</span>
                </Label>
                <Input
                  aria-invalid={Boolean(errors.name)}
                  autoFocus
                  id="role-name"
                  placeholder="Ví dụ: CONTENT_REVIEWER"
                  {...register("name")}
                />
                {errors.name ? (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sử dụng chữ in hoa và dấu gạch dưới (VD: CONTENT_ADMIN,
                    DEPT_MANAGER).
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="role-description">Mô tả vai trò</Label>
                <Textarea
                  className="min-h-20"
                  id="role-description"
                  placeholder="Mô tả phạm vi trách nhiệm và các thao tác vai trò này được thực hiện..."
                  {...register("description")}
                />
              </div>

              <ToggleOptionCard
                checked={watch("isSystemRole")}
                description="Dùng cho các nhóm quyền lõi do hệ thống quản lý."
                label="Vai trò hệ thống"
                onCheckedChange={(checked) =>
                  setValue("isSystemRole", checked, { shouldDirty: true })
                }
              />

              <ToggleOptionCard
                checked={watch("isActive")}
                description="Cho phép gán vai trò này cho tài khoản người dùng."
                label="Kích hoạt vai trò"
                onCheckedChange={(checked) =>
                  setValue("isActive", checked, { shouldDirty: true })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions Assignment Card */}
        <Card className="border bg-card shadow-none">
          <CardHeader className="border-b">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Gán quyền hạn
                </CardTitle>
                <Badge className="font-mono" variant="secondary">
                  {selectedPermissionIds.length} đã chọn
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Chọn các quyền truy cập và thao tác được phép cấp cho vai trò
                này.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <PermissionMatrix
              isChecked={(id) => selectedPermissionIds.includes(id)}
              isDisabled={isCellDisabled}
              onSearchQueryChange={setPermissionSearch}
              onToggleCell={onToggleCell}
              onToggleRow={onToggleRow}
              rows={matrixRows}
              searchPlaceholder="Tìm kiếm quyền hạn (theo tên, mã hoặc mô tả)..."
              searchQuery={permissionSearch}
            />
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

        {/* Bottom Form Actions */}
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
                {role ? "Lưu thay đổi" : "Tạo vai trò"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
