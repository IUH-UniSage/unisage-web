import type { AccessPermission } from "@/features/rbac/schemas/rbac-schemas"
import {
  actionSuffixes,
  getResourceLabel,
  groupPermissions,
  splitPermissionName,
} from "@/features/rbac/utils/rbac-formatters"

export type MatrixAction = (typeof actionSuffixes)[number]

/** Display order for matrix columns — independent of `actionSuffixes`'s
 * internal suffix-matching order, which must stay as-is for `.endsWith()`
 * disambiguation in `splitPermissionName`. */
export const matrixColumnOrder: MatrixAction[] = [
  "ALL",
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "SEND",
  "TOGGLE_ACTIVE",
]

export type PermissionMatrixRow = {
  cells: Partial<Record<MatrixAction, AccessPermission>>
  resource: string
  resourceLabel: string
}

export function buildPermissionMatrix(
  permissions: AccessPermission[],
  searchQuery: string
): PermissionMatrixRow[] {
  return groupPermissions(permissions, searchQuery).map(
    ({ items, resource }) => ({
      cells: Object.fromEntries(
        items.map((item) => [splitPermissionName(item.name).action, item])
      ),
      resource,
      resourceLabel: getResourceLabel(resource),
    })
  )
}

export function getRowIds(row: PermissionMatrixRow): string[] {
  return Object.values(row.cells).map((permission) => permission.id)
}
