import { useDeferredValue, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckSquare,
  Loader2,
  Save,
  Search,
  ShieldCheck,
  Square,
} from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  getPermissionLabel,
  getResourceLabel,
  groupPermissions,
  splitPermissionName,
} from "@/features/rbac/utils/rbac-formatters"
import {
  createRoleRequestSchema,
  type AccessPermission,
  type AccessRole,
  type CreateRoleRequest,
} from "@/features/rbac/schemas/rbac-schemas"
import { cn } from "@/lib/utils"
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
  const [resourceFilter, setResourceFilter] = useState("all")
  const deferredPermissionSearch = useDeferredValue(permissionSearch)
  const permissionGroups = useMemo(
    () => groupPermissions(permissions, deferredPermissionSearch),
    [deferredPermissionSearch, permissions]
  )
  const resourceOptions = useMemo(
    () =>
      [
        ...new Set(
          permissions
            .filter((permission) => permission.isActive)
            .map((permission) => splitPermissionName(permission.name).resource)
        ),
      ].sort((left, right) =>
        getResourceLabel(left).localeCompare(getResourceLabel(right), "vi")
      ),
    [permissions]
  )
  const visibleGroups =
    resourceFilter === "all"
      ? permissionGroups
      : permissionGroups.filter((group) => group.resource === resourceFilter)

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
      permissionIds: role?.permissions.map((permission) => permission.id) ?? [],
    },
    resolver: zodResolver(createRoleRequestSchema),
  })

  const selectedPermissionIds = watch("permissionIds")
  const isBusy = isSaving || isSubmitting

  const handleCancel = () => {
    onOpenChange(false)
  }

  const togglePermission = (permission: AccessPermission, checked: boolean) => {
    if (!checked) {
      setValue(
        "permissionIds",
        selectedPermissionIds.filter((id) => id !== permission.id),
        { shouldDirty: true }
      )
      return
    }

    const permissionIdsWithSameName = new Set(
      permissions
        .filter((candidate) => candidate.name === permission.name)
        .map((candidate) => candidate.id)
    )
    setValue(
      "permissionIds",
      [
        ...selectedPermissionIds.filter(
          (id) => !permissionIdsWithSameName.has(id)
        ),
        permission.id,
      ],
      { shouldDirty: true }
    )
  }

  const toggleGroupPermissions = (
    groupItems: AccessPermission[],
    selectAll: boolean
  ) => {
    const groupIds = groupItems.map((item) => item.id)
    if (selectAll) {
      const nextIds = new Set([...selectedPermissionIds, ...groupIds])
      setValue("permissionIds", Array.from(nextIds), { shouldDirty: true })
    } else {
      setValue(
        "permissionIds",
        selectedPermissionIds.filter((id) => !groupIds.includes(id)),
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Phân quyền
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">
            {role ? `Chỉnh sửa vai trò — ${role.name}` : "Thêm vai trò mới"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cấu hình thông tin vai trò và các quyền hạn được phép sử dụng trong
            hệ thống UniSage.
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
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-semibold">
              Thông tin cơ bản
            </CardTitle>
            <CardDescription>
              Thiết lập tên gọi, mô tả và phân loại cơ bản cho vai trò.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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
          <CardHeader className="border-b pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
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
              <ShieldCheck
                aria-hidden="true"
                className="size-6 shrink-0 text-primary"
              />
            </div>

            {/* Filter & Search Bar */}
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_240px]">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  aria-label="Tìm quyền để gán"
                  className="pl-9"
                  onChange={(event) => setPermissionSearch(event.target.value)}
                  placeholder="Tìm kiếm quyền hạn (theo tên, mã hoặc mô tả)..."
                  value={permissionSearch}
                />
              </div>
              <Select onValueChange={setResourceFilter} value={resourceFilter}>
                <SelectTrigger
                  aria-label="Lọc theo nhóm chức năng"
                  className="w-full min-w-0"
                >
                  <SelectValue
                    className="truncate"
                    placeholder="Tất cả nhóm chức năng"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Tất cả nhóm ({permissionGroups.length})
                  </SelectItem>
                  {resourceOptions.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {getResourceLabel(resource)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {visibleGroups.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Không tìm thấy quyền hạn nào phù hợp với điều kiện tìm kiếm.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visibleGroups.map(({ items, resource }) => {
                  const allInGroupSelected =
                    items.length > 0 &&
                    items.every((item) =>
                      selectedPermissionIds.includes(item.id)
                    )

                  return (
                    <section
                      className="flex flex-col rounded-xl border bg-card p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                      key={resource}
                    >
                      <div className="mb-3 flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                            {getResourceLabel(resource)}
                          </h3>
                          <Badge variant="outline">{items.length}</Badge>
                        </div>
                        <Button
                          className="h-7 px-2 text-[11px]"
                          onClick={() =>
                            toggleGroupPermissions(items, !allInGroupSelected)
                          }
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          {allInGroupSelected ? (
                            <>
                              <Square className="mr-1 size-3 text-muted-foreground" />
                              Bỏ chọn
                            </>
                          ) : (
                            <>
                              <CheckSquare className="mr-1 size-3 text-primary" />
                              Chọn tất cả
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        {items.map((permission) => {
                          const checked = selectedPermissionIds.includes(
                            permission.id
                          )

                          return (
                            <label
                              className={cn(
                                "flex min-h-10 cursor-pointer items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted/70",
                                checked && "bg-primary/5 dark:bg-primary/10"
                              )}
                              key={permission.id}
                            >
                              <Checkbox
                                aria-label={`Cho phép ${permission.name}`}
                                checked={checked}
                                className="mt-0.5"
                                onCheckedChange={(value) =>
                                  togglePermission(permission, value === true)
                                }
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block text-xs leading-tight font-semibold text-foreground">
                                  {getPermissionLabel(permission)}
                                </span>
                                <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                                  {permission.name}
                                </span>
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
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
