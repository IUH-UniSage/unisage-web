import { SearchX } from "lucide-react"

import { cn } from "@/lib/utils"

type SearchEmptyProps = {
  className?: string
  description?: string
  title: string
}

export function SearchEmpty({
  className,
  description,
  title,
}: SearchEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-10 text-center",
        className
      )}
    >
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
        <SearchX aria-hidden="true" className="size-7" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
