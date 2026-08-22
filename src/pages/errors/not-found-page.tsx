import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/paths"

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-10 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
      <Button asChild>
        <Link to={ROUTES.home}>Back to home</Link>
      </Button>
    </div>
  )
}
