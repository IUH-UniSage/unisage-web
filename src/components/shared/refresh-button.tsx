import { type QueryKey, useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type RefreshButtonProps = {
  className?: string
  label?: string
  queryKeys: QueryKey[]
}

// Icon-only button that invalidates the given query key prefixes, so every
// active query under them refetches. Spins until all refetches settle.
export function RefreshButton({
  className,
  label = "Làm mới",
  queryKeys,
}: RefreshButtonProps) {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all(
        queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      )
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      aria-label={label}
      className={cn("shrink-0", className)}
      disabled={isRefreshing}
      onClick={() => void refresh()}
      size="icon"
      title={label}
      type="button"
      variant="outline"
    >
      <RefreshCw
        aria-hidden="true"
        className={isRefreshing ? "animate-spin" : undefined}
      />
    </Button>
  )
}
