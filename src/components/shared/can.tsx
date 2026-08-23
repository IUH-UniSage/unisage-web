import type { ReactNode } from "react"

import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import type { ResourceName } from "@/utils/permissions"

type CrudAction = "read" | "create" | "update" | "delete"

type CanProps = {
  /** The CRUD action to check. */
  action: CrudAction
  /** Children rendered when the user has the required capability. */
  children: ReactNode
  /** Optional content rendered when access is denied. Defaults to `null`. */
  fallback?: ReactNode
  /** The resource name (e.g. "department", "document"). */
  resource: ResourceName
}

const ACTION_KEY: Record<
  CrudAction,
  keyof ReturnType<typeof useResourcePermissions>
> = {
  create: "canCreate",
  delete: "canDelete",
  read: "canRead",
  update: "canUpdate",
}

/**
 * Declarative permission gate for CRUD actions on a resource.
 *
 * Renders `children` when the current user has the required capability,
 * and `fallback` (default: nothing) otherwise.
 *
 * @example
 * <Can action="create" resource="department">
 *   <Button>Thêm phòng ban</Button>
 * </Can>
 *
 * <Can action="delete" resource="document" fallback={<span>No access</span>}>
 *   <DeleteButton />
 * </Can>
 */
export function Can({ action, children, fallback = null, resource }: CanProps) {
  const capabilities = useResourcePermissions(resource)
  const isAllowed = capabilities[ACTION_KEY[action]]

  return isAllowed ? <>{children}</> : <>{fallback}</>
}
