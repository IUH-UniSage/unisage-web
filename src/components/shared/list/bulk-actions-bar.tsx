import { Power, RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BulkActionsBarProps = {
  isSubmitting: boolean
  onClear: () => void
  onDeactivate: () => void
  onRecover: () => void
  selectedCount: number
}

export function BulkActionsBar({
  isSubmitting,
  onClear,
  onDeactivate,
  onRecover,
  selectedCount,
}: BulkActionsBarProps) {
  const isOpen = selectedCount > 0

  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className={cn("overflow-hidden", !isOpen && "pointer-events-none")}>
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 bg-primary/8 px-3 py-2 transition-opacity duration-200 md:px-4",
            isOpen ? "opacity-100" : "opacity-0"
          )}
        >
          <p className="text-sm font-semibold text-primary">
            Đã chọn {selectedCount} mục
          </p>
          <div className="flex items-center gap-2">
            <Button
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={isSubmitting}
              onClick={onDeactivate}
              size="sm"
              variant="outline"
            >
              <Power aria-hidden="true" />
              Vô hiệu hóa
            </Button>
            <Button
              className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              disabled={isSubmitting}
              onClick={onRecover}
              size="sm"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" />
              Khôi phục
            </Button>
            <Button
              aria-label="Bỏ chọn"
              disabled={isSubmitting}
              onClick={onClear}
              size="icon-sm"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
