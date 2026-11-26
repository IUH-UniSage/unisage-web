import { useQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { departmentOptions } from "@/features/departments/queries/options"
import { departmentLabel } from "@/features/departments/utils/department-label"
import { flattenDepartmentTreeWithDepth } from "@/features/departments/utils/tree"
import { PERMISSIONS } from "@/utils/permissions"

/**
 * For responses that only carry `departmentId` + `departmentName` (the code) - a user's
 * department accesses, a document's department: resolves the readable label from the cached
 * department tree. Without DEPARTMENT_READ (or while the tree loads) the given name is kept.
 */
export function useDepartmentLabels() {
  const { can } = usePermissions()
  const departmentsQuery = useQuery({
    ...departmentOptions.list(),
    enabled: can(PERMISSIONS.departmentRead),
  })

  const labelById = useMemo(() => {
    const index = new Map<string, string>()
    for (const node of flattenDepartmentTreeWithDepth(
      departmentsQuery.data ?? []
    )) {
      index.set(node.id, departmentLabel(node))
    }
    return index
  }, [departmentsQuery.data])

  return useCallback(
    (departmentId: string | null | undefined, fallbackName: string): string =>
      (departmentId ? labelById.get(departmentId) : undefined) ?? fallbackName,
    [labelById]
  )
}
