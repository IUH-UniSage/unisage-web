import { CircleHelp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

type TourHelpButtonProps = {
  className?: string
  onClick: () => void
}

export function TourHelpButton({ className, onClick }: TourHelpButtonProps) {
  return (
    <Button
      {...tourAnchor(TOUR_ANCHORS.tourButton)}
      aria-label="Hướng dẫn sử dụng trang này"
      className={className}
      onClick={onClick}
      size="icon"
      title="Hướng dẫn sử dụng trang này"
      type="button"
      variant="ghost"
    >
      <CircleHelp aria-hidden="true" />
    </Button>
  )
}
