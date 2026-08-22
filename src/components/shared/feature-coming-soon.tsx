import type { ReactNode } from "react"
import { Construction } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type FeatureComingSoonProps = {
  actions?: ReactNode
  className?: string
  description: string
  headingLevel?: "h1" | "h2"
  title: string
}

export function FeatureComingSoon({
  actions,
  className,
  description,
  headingLevel = "h1",
  title,
}: FeatureComingSoonProps) {
  const Heading = headingLevel

  return (
    <section
      className={cn("flex flex-col items-center text-center", className)}
    >
      <div className="relative mb-5 grid size-16 place-items-center rounded-2xl bg-secondary text-primary">
        <div className="absolute -top-1 -right-1 size-3 rounded-full bg-knowledge ring-4 ring-background" />
        <Construction aria-hidden="true" className="size-7" />
      </div>
      <Badge className="border-primary/15 bg-secondary text-primary hover:bg-secondary">
        Tính năng đang phát triển
      </Badge>
      <Heading className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </Heading>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {actions ? (
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {actions}
        </div>
      ) : null}
    </section>
  )
}
