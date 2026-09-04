import { useAccessRolesQuery } from "@/features/rbac/queries/use-queries"

export function useRoleDetail(roleId: string | undefined) {
  const rolesQuery = useAccessRolesQuery()
  const role = rolesQuery.data?.data.find(
    (candidate) => candidate.id === roleId
  )

  return { data: role, isPending: rolesQuery.isPending }
}
