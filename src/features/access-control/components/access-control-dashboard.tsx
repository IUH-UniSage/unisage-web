import { useMemo, useState } from "react"
import {
  Check,
  KeyRound,
  LockKeyhole,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"
import { useAccessPermissionsQuery } from "@/features/access-control/queries/use-queries"
import { useAccessRolesQuery } from "@/features/access-control/queries/use-queries"
import { useUpdateRoleMutation } from "@/features/access-control/queries/use-mutations"
import type {
  AccessPermission,
  AccessRole,
} from "@/features/access-control/schemas/access-control-schemas"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSIONS } from "@/lib/permissions"
import { cn } from "@/lib/utils"

const resourceLabels: Record<string, string> = {
  ACCOUNT: "Tài khoản",
  AUDIT_LOG: "Nhật ký kiểm toán",
  CATEGORY: "Danh mục",
  CHATBOT_CONFIG: "Cấu hình chatbot",
  CHATBOT_POOL: "Cụm chatbot",
  CONVERSATION: "Cuộc trò chuyện",
  DOCUMENT: "Tài liệu",
  DOCUMENT_CHUNK: "Đoạn tài liệu",
  DOCUMENT_PROCESS_LOG: "Nhật ký xử lý",
  DOC_PACKAGE: "Gói tri thức",
  EMBEDDED_MODEL: "Mô hình nhúng",
  INGEST: "Nạp dữ liệu",
  LLM_TRACE_LOG: "Truy vết mô hình",
  MESSAGE: "Tin nhắn",
  PERMISSION: "Quyền hạn",
  ROLE: "Vai trò",
  SUPER_ADMIN: "Quản trị toàn hệ thống",
  USER: "Người dùng",
}

const actionLabels: Record<string, string> = {
  ALL: "Toàn quyền",
  CREATE: "Tạo mới",
  DELETE: "Xóa",
  READ: "Xem",
  SEND: "Gửi",
  TOGGLE_ACTIVE: "Bật / tắt",
  UPDATE: "Cập nhật",
}

const actionSuffixes = [
  "TOGGLE_ACTIVE",
  "CREATE",
  "UPDATE",
  "DELETE",
  "READ",
  "SEND",
  "ALL",
] as const

const EMPTY_PERMISSIONS: AccessPermission[] = []
const EMPTY_ROLES: AccessRole[] = []

function splitPermissionName(name: string) {
  const action = actionSuffixes.find((suffix) => name.endsWith(`_${suffix}`))

  if (!action) return { action: name, resource: name }

  return {
    action,
    resource: name.slice(0, -(action.length + 1)),
  }
}

function getPermissionLabel(permission: AccessPermission) {
  const { action } = splitPermissionName(permission.name)
  return actionLabels[action] ?? action
}

function getResourceLabel(resource: string) {
  return resourceLabels[resource] ?? resource.replaceAll("_", " ")
}

function getRoleLabel(name: string) {
  const labels: Record<string, string> = {
    INGEST_ADMIN: "Quản trị tri thức",
    SUPER_ADMIN: "Quản trị hệ thống",
    USER: "Người dùng",
  }

  return labels[name] ?? name.replaceAll("_", " ")
}

function equalPermissionSets(
  left: readonly string[],
  right: readonly string[]
) {
  if (left.length !== right.length) return false

  const rightSet = new Set(right)
  return left.every((id) => rightSet.has(id))
}

export function AccessControlDashboard() {
  const rolesQuery = useAccessRolesQuery()
  const permissionsQuery = useAccessPermissionsQuery()
  const updateRole = useUpdateRoleMutation()
  const { can } = usePermissions()
  const canUpdateRoles = can(PERMISSIONS.roleUpdate)
  const [selectedRoleId, setSelectedRoleId] = useState<string>()
  const [permissionSearch, setPermissionSearch] = useState("")
  const [draftPermissionIds, setDraftPermissionIds] = useState<string[] | null>(
    null
  )

  const roles = rolesQuery.data?.data ?? EMPTY_ROLES
  const permissions = permissionsQuery.data?.data ?? EMPTY_PERMISSIONS
  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? roles[0]

  const normalizedSearch = permissionSearch.trim().toLocaleLowerCase("vi")
  const permissionGroups = useMemo(() => {
    const groups = new Map<string, AccessPermission[]>()

    permissions
      .filter((permission) => {
        if (!permission.isActive) return false
        if (!normalizedSearch) return true

        const { action, resource } = splitPermissionName(permission.name)
        const searchable = [
          permission.name,
          getPermissionLabel(permission),
          getResourceLabel(resource),
          action,
        ]
          .join(" ")
          .toLocaleLowerCase("vi")

        return searchable.includes(normalizedSearch)
      })
      .forEach((permission) => {
        const { resource } = splitPermissionName(permission.name)
        const current = groups.get(resource) ?? []
        current.push(permission)
        groups.set(resource, current)
      })

    return [...groups.entries()]
      .map(([resource, items]) => ({
        items: items.sort((left, right) => {
          const levelDifference =
            (left.accessLevel ?? 0) - (right.accessLevel ?? 0)
          return left.name.localeCompare(right.name) || levelDifference
        }),
        resource,
      }))
      .sort((left, right) =>
        getResourceLabel(left.resource).localeCompare(
          getResourceLabel(right.resource),
          "vi"
        )
      )
  }, [normalizedSearch, permissions])

  const originalPermissionIds =
    selectedRole?.permissions.map((permission) => permission.id) ?? []
  const activePermissionIds = draftPermissionIds ?? originalPermissionIds
  const isDirty = !equalPermissionSets(
    activePermissionIds,
    originalPermissionIds
  )

  const selectRole = (role: AccessRole) => {
    setSelectedRoleId(role.id)
    setDraftPermissionIds(null)
  }

  const togglePermission = (permission: AccessPermission) => {
    setDraftPermissionIds((current) => {
      const permissionIds = current ?? originalPermissionIds

      if (permissionIds.includes(permission.id)) {
        return permissionIds.filter((id) => id !== permission.id)
      }

      const permissionIdsWithSameName = new Set(
        permissions
          .filter((candidate) => candidate.name === permission.name)
          .map((candidate) => candidate.id)
      )

      return [
        ...permissionIds.filter((id) => !permissionIdsWithSameName.has(id)),
        permission.id,
      ]
    })
  }

  const saveRole = () => {
    if (!selectedRole) return

    updateRole.mutate(
      {
        input: {
          description: selectedRole.description ?? null,
          isActive: selectedRole.isActive,
          isSystemRole: selectedRole.isSystemRole,
          name: selectedRole.name,
          permissionIds: activePermissionIds,
        },
        roleId: selectedRole.id,
      },
      {
        onSuccess: (updatedRole) => {
          setDraftPermissionIds(
            updatedRole.permissions.map((permission) => permission.id)
          )
        },
      }
    )
  }

  if (rolesQuery.isPending || permissionsQuery.isPending) {
    return <AccessControlSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Kiểm soát truy cập
          </p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            Vai trò & phân quyền
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Quản lý phạm vi chức năng được phép sử dụng theo từng vai trò trong
            UniSage.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="h-7 px-3" variant="secondary">
            <UsersRound aria-hidden="true" />
            {roles.length} vai trò
          </Badge>
          <Badge className="h-7 px-3" variant="outline">
            <KeyRound aria-hidden="true" />
            {
              permissions.filter((permission) => permission.isActive).length
            }{" "}
            quyền
          </Badge>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="border bg-card shadow-none">
          <CardHeader className="border-b">
            <CardTitle>Vai trò hệ thống</CardTitle>
            <CardDescription>
              Chọn vai trò để xem và điều chỉnh quyền.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.map((role) => {
              const isSelected = role.id === selectedRole?.id

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:ring-3 focus-visible:ring-primary/15 focus-visible:outline-none",
                    isSelected
                      ? "border-primary/35 bg-secondary"
                      : "bg-background/50 hover:border-primary/20 hover:bg-secondary/45"
                  )}
                  key={role.id}
                  onClick={() => selectRole(role)}
                  type="button"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary"
                    )}
                  >
                    <ShieldCheck aria-hidden="true" className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {getRoleLabel(role.name)}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {role.permissions.length} quyền được cấp
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {role.isSystemRole ? (
                        <Badge variant="outline">Hệ thống</Badge>
                      ) : (
                        <Badge variant="secondary">Tùy chỉnh</Badge>
                      )}
                      {!role.isActive ? (
                        <Badge variant="destructive">Đã khóa</Badge>
                      ) : null}
                    </span>
                  </span>
                  {isSelected ? (
                    <Check
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-primary"
                    />
                  ) : null}
                </button>
              )
            })}
          </CardContent>
        </Card>

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
                onChange={(event) => setPermissionSearch(event.target.value)}
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
                        const checked = activePermissionIds.includes(
                          permission.id
                        )

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
                              onCheckedChange={() =>
                                togglePermission(permission)
                              }
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
                disabled={!isDirty || updateRole.isPending}
                onClick={() => setDraftPermissionIds(null)}
                variant="outline"
              >
                Hoàn tác
              </Button>
              <Button
                disabled={
                  !selectedRole ||
                  !canUpdateRoles ||
                  !isDirty ||
                  updateRole.isPending
                }
                onClick={saveRole}
              >
                <ShieldCheck aria-hidden="true" />
                {updateRole.isPending ? "Đang lưu..." : "Lưu phân quyền"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function AccessControlSkeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải trang phân quyền">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-[520px] max-w-full" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-[640px] rounded-xl" />
      </div>
    </div>
  )
}
