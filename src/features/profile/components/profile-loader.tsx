import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useMyProfileQuery } from "@/features/profile/queries/use-queries"
import type { AppUser } from "@/features/users/schemas/user-schemas"
import { getErrorMessage } from "@/utils/error-handler"

// Fetches the signed-in user's own profile once so the client and admin
// profile screens can each render it in their own layout style.
export function ProfileLoader({
  children,
}: {
  children: (me: AppUser) => ReactNode
}) {
  const { data: me, error, isPending } = useMyProfileQuery()

  if (isPending) {
    return (
      <div aria-label="Đang tải hồ sơ" className="space-y-6">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!me) {
    return (
      <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
        {error ? getErrorMessage(error) : "Không tải được hồ sơ."}
      </p>
    )
  }

  return <>{children(me)}</>
}
