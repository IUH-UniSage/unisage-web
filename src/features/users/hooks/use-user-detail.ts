import { useUsersQuery } from "@/features/users/queries/use-queries"

export function useUserDetail(userId: string | undefined) {
  const usersQuery = useUsersQuery()
  const user = usersQuery.data?.data.find(
    (candidate) => candidate.id === userId
  )

  return { data: user, isPending: usersQuery.isPending }
}
