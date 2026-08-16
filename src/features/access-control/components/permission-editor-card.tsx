import { LockKeyhole, Search, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  getPermissionLabel,
  getResourceLabel,
  getRoleLabel,
  type PermissionGroup,
} from "@/features/access-control/lib/access-control-formatters"
import type {
  AccessPermission,
  AccessRole,
} from "@/features/access-control/schemas/access-control-schemas"
import { cn } from "@/lib/utils"

type PermissionEditorCardProps = {
  activePermissionIds: string[]
  canUpdateRoles: boolean
  isDirty: boolean
  isSaving: boolean
  onPermissionSearchChange: (value: string) => void
  onReset: () => void
  onSave: () => void
  onTogglePermission: (permission: AccessPermission) => void
  permissionGroups: PermissionGroup[]
  permissionSearch: string
  selectedRole: AccessRole | undefined
}

export function PermissionEditorCard({
  activePermissionIds,
  canUpdateRoles,
  isDirty,
  isSaving,
  onPermissionSearchChange,
  onReset,
  onSave,
  onTogglePermission,
  permissionGroups,
  permissionSearch,
  selectedRole,
}: PermissionEditorCardProps) {
  return (
    <Card className="min-w-0 border bg-card shadow-none">
      <CardHeader className="gap-4 border-b">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <CardTitle>
              {selectedRole
                ? getRoleLabel(selectedRole.name)
                : "Chưa có vai trò"}
            </CardTitle>
            <CardDescription className="mt-1 max-w-2xl">
              {selectedRole?.description ||
                "Chọn các quyền mà vai trò này được sử dụng."}
            </CardDescription>
          </div>
          <Badge variant={canUpdateRoles ? "secondary" : "outline"}>
            {canUpdateRoles ? "Có thể chỉnh sửa" : "Chỉ xem"}
          </Badge>
        </div>

        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Tìm quyền hạn"
            className="bg-background pl-9"
            onChange={(event) => onPermissionSearchChange(event.target.value)}
            placeholder="Tìm theo chức năng hoặc tên permission..."
            value={permissionSearch}
          />
        </div>
      </CardHeader>

      <CardContent>
        {permissionGroups.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {permissionGroups.map(({ items, resource }) => (
              <section
                aria-labelledby={`permission-group-${resource}`}
                className="rounded-xl border bg-background/45 p-4"
                key={resource}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2
                    className="text-sm font-semibold"
                    id={`permission-group-${resource}`}
                  >
                    {getResourceLabel(resource)}
                  </h2>
                  <Badge variant="outline">{items.length}</Badge>
                </div>
                <div className="space-y-1">
                  {items.map((permission) => {
                    const checked = activePermissionIds.includes(permission.id)

                    return (
                      <label
                        className={cn(
                          "flex min-h-10 items-center gap-3 rounded-lg px-2.5 py-2 transition-colors",
                          canUpdateRoles
                            ? "cursor-pointer hover:bg-secondary/55"
                            : "cursor-default",
                          checked && "bg-secondary/70"
                        )}
                        key={permission.id}
                      >
                        <Checkbox
                          aria-label={`Cho phép ${permission.name}${
                            permission.accessLevel === null
                              ? ""
                              : ` cấp ${permission.accessLevel}`
                          }`}
                          checked={checked}
                          disabled={!canUpdateRoles}
                          onCheckedChange={() => onTogglePermission(permission)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium">
                            {getPermissionLabel(permission)}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                            {permission.name}
                          </span>
                        </span>
                        {permission.accessLevel !== null ? (
                          <Badge variant="outline">
                            Cấp {permission.accessLevel}
                          </Badge>
                        ) : null}
                      </label>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <LockKeyhole
                aria-hidden="true"
                className="mx-auto size-8 text-muted-foreground"
              />
              <h2 className="mt-3 text-sm font-semibold">
                Không tìm thấy quyền phù hợp
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Thử tìm bằng tên chức năng hoặc mã permission khác.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch justify-between gap-3 border-t sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          Đã chọn{" "}
          <span className="font-semibold text-foreground">
            {activePermissionIds.length}
          </span>{" "}
          quyền
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            disabled={!isDirty || isSaving}
            onClick={onReset}
            variant="outline"
          >
            Hoàn tác
          </Button>
          <Button
            disabled={!selectedRole || !canUpdateRoles || !isDirty || isSaving}
            onClick={onSave}
          >
            <ShieldCheck aria-hidden="true" />
            {isSaving ? "Đang lưu..." : "Lưu phân quyền"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
