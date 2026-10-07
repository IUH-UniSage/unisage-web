import { CircleHelp } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { useDialogTour } from "@/features/product-tour/hooks/use-dialog-tour"
import type { DialogTourKey } from "@/features/product-tour/tours/dialog-tours"

type DialogTourButtonProps = {
  tourKey: DialogTourKey
}

// Render as the first child of DialogContent / SheetContent: it sits next to
// the close button and auto-starts the dialog's tour the first time it opens.
export function DialogTourButton({ tourKey }: DialogTourButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { start } = useDialogTour(tourKey, buttonRef)

  return (
    <Button
      aria-label="Hướng dẫn sử dụng hộp thoại này"
      className="absolute top-4 right-12 z-10"
      data-dialog-tour-button=""
      onClick={start}
      ref={buttonRef}
      size="icon-sm"
      title="Hướng dẫn sử dụng hộp thoại này"
      type="button"
      variant="ghost"
    >
      <CircleHelp aria-hidden="true" />
    </Button>
  )
}
