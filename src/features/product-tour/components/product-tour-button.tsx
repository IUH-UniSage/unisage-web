import { CircleHelp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { useProductTour } from "@/features/product-tour/hooks/use-product-tour"
import type { StaffWorkspace } from "@/routes/feature-registry"

type ProductTourButtonProps = {
  featureKey: string | null
  workspace: StaffWorkspace
}

export function ProductTourButton({
  featureKey,
  workspace,
}: ProductTourButtonProps) {
  const { hasTour, start } = useProductTour({ featureKey, workspace })

  if (!hasTour) return null

  return (
    <Button
      {...tourAnchor(TOUR_ANCHORS.tourButton)}
      aria-label="Hướng dẫn sử dụng trang này"
      onClick={start}
      size="icon"
      title="Hướng dẫn sử dụng trang này"
      type="button"
      variant="ghost"
    >
      <CircleHelp aria-hidden="true" />
    </Button>
  )
}
