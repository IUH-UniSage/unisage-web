import { useDeferredValue, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import {
  getPermissionLabel,
  getResourceLabel,
  groupPermissions,
} from "@/features/access-control/lib/access-control-formatters"
import {
  createRoleRequestSchema,
  type AccessPermission,
  type AccessRole,
  type CreateRoleRequest,
} from "@/features/access-control/schemas/access-control-schemas"

type RoleDialogProps = {
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateRoleRequest) => Promise<void>
  open: boolean
  permissions: AccessPermission[]
  role?: AccessRole
}

export function RoleDialog({
  isSaving,
  onOpenChange,
  onSubmit,
  open,
  permissions,
  role,
}: RoleDialogProps) {
  const [permissionSearch, setPermissionSearch] = useState("")
  const deferredPermissionSearch = useDeferredValue(permissionSearch)
  const permissionGroups = useMemo(
    () => groupPermissions(permissions, deferredPermissionSearch),
    [deferredPermissionSearch, permissions]
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
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

  const submit = async (values: CreateRoleRequest) => {
    try {
      await onSubmit({
        ...values,
        description: values.description?.trim() || null,
        name: values.name.trim(),
      })
    } catch {
      // The global mutation handler presents the API error.
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {role ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
          </DialogTitle>
          <DialogDescription>
            Cấu hình thông tin vai trò và các quyền được phép sử dụng trong
            UniSage.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role-name">Tên vai trò</Label>
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
                  Sử dụng chữ in hoa và dấu gạch dưới.
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role-description">Mô tả</Label>
              <Textarea
                id="role-description"
                placeholder="Mô tả phạm vi trách nhiệm của vai trò..."
                {...register("description")}
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border p-3">
              <Checkbox
                checked={watch("isSystemRole")}
                onCheckedChange={(checked) =>
                  setValue("isSystemRole", checked === true, {
                    shouldDirty: true,
                  })
                }
              />
              <span>
                <span className="block text-sm font-medium">
                  Vai trò hệ thống
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  Dùng cho các nhóm quyền lõi do hệ thống quản lý.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border p-3">
              <Checkbox
                checked={watch("isActive")}
                onCheckedChange={(checked) =>
                  setValue("isActive", checked === true, {
                    shouldDirty: true,
                  })
                }
              />
              <span>
                <span className="block text-sm font-medium">
                  Kích hoạt vai trò
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  Cho phép gán vai trò này cho tài khoản.
                </span>
              </span>
            </label>
          </div>

          <div className="overflow-hidden rounded-xl border">
            <div className="border-b p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Gán quyền hạn</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Đã chọn {selectedPermissionIds.length} quyền
                  </p>
                </div>
                <ShieldCheck
                  aria-hidden="true"
                  className="size-5 text-primary"
                />
              </div>
              <div className="relative mt-3">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  aria-label="Tìm quyền để gán"
                  className="pl-9"
                  onChange={(event) => setPermissionSearch(event.target.value)}
                  placeholder="Tìm quyền hạn..."
                  value={permissionSearch}
                />
              </div>
            </div>

            <ScrollArea className="h-auto sm:h-64">
              <div className="grid gap-3 p-3 sm:grid-cols-2">
                {permissionGroups.map(({ items, resource }) => (
                  <section className="rounded-lg border p-3" key={resource}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xs font-semibold">
                        {getResourceLabel(resource)}
                      </h3>
                      <Badge variant="outline">{items.length}</Badge>
                    </div>
                    <div className="space-y-1">
                      {items.map((permission) => {
                        const checked = selectedPermissionIds.includes(
                          permission.id
                        )

                        return (
                          <label
                            className="flex min-h-10 items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                            key={permission.id}
                          >
                            <Checkbox
                              aria-label={`Cho phép ${permission.name}`}
                              checked={checked}
                              onCheckedChange={(value) =>
                                togglePermission(permission, value === true)
                              }
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-medium">
                                {getPermissionLabel(permission)}
                              </span>
                              <span className="block truncate font-mono text-[10px] text-muted-foreground">
                                {permission.name}
                              </span>
                            </span>
                            {permission.accessLevel !== null ? (
                              <Badge variant="secondary">
                                {permission.accessLevel}
                              </Badge>
                            ) : null}
                          </label>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isBusy} type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button disabled={isBusy} type="submit">
              <ShieldCheck aria-hidden="true" />
              {isBusy ? "Đang lưu..." : role ? "Lưu thay đổi" : "Tạo vai trò"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
