import { useMemo } from "react"

import { TourHelpButton } from "@/features/product-tour/components/tour-help-button"
import { useProductTour } from "@/features/product-tour/hooks/use-product-tour"
import { getClientPageTour } from "@/features/product-tour/tours/client-tours"

type ClientTourButtonProps = {
  className?: string
  pathname: string
}

// Student-facing pages (also open to guests): no workspace intro, each page
// introduces itself.
export function ClientTourButton({
  className,
  pathname,
}: ClientTourButtonProps) {
  const pageTour = useMemo(() => getClientPageTour(pathname), [pathname])
  const { hasTour, start } = useProductTour({ pageTour })

  return hasTour ? (
    <TourHelpButton className={className} onClick={start} />
  ) : null
}
