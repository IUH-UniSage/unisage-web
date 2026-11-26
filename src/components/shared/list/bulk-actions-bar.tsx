import { Power, RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SelectionStatusCounts } from "@/utils/selection"

type BulkActionsBarProps = {
  isSubmitting: boolean
  onClear: () => void
  onDeactivate: () => void
  onRecover: () => void
  selectedCount: number
  /**
   * Active / inactive split of the selected rows (see `countSelectedByStatus`). "Vô hiệu hóa"
   * shows only when some selected row is active, "Khôi phục" only when some is inactive; with no selection both show, disabled.
   */
  statusCounts: SelectionStatusCounts
}

export function BulkActionsBar({
  isSubmitting,
  onClear,
  onDeactivate,
  onRecover,
  selectedCount,
  statusCounts,
}: BulkActionsBarProps) {
  const hasSelection = selectedCount > 0
  // Nothing selected → show both actions (disabled); otherwise only those that apply.
  const showDeactivate = !hasSelection || statusCounts.active > 0
  const showRecover = !hasSelection || statusCounts.inactive > 0

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2 transition-colors duration-200 md:px-4",
        hasSelection ? "border-primary/20 bg-primary/8" : "bg-muted/30"
      )}
    >
      <p
        className={cn(
          "text-sm",
          hasSelection ? "font-semibold text-primary" : "text-muted-foreground"
        )}
      >
        {hasSelection ? `Đã chọn ${selectedCount} mục` : "Chưa chọn mục nào"}
      </p>
      <div className="flex items-center gap-2">
        {showDeactivate ? (
          <Button
            className={cn(
              hasSelection
                ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                : "text-muted-foreground"
            )}
            disabled={isSubmitting || !hasSelection}
            onClick={onDeactivate}
            size="sm"
            variant="outline"
          >
            <Power aria-hidden="true" />
            Vô hiệu hóa
          </Button>
        ) : null}
        {showRecover ? (
          <Button
            className={cn(
              hasSelection
                ? "border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                : "text-muted-foreground"
            )}
            disabled={isSubmitting || !hasSelection}
            onClick={onRecover}
            size="sm"
            variant="outline"
          >
            <RotateCcw aria-hidden="true" />
            Khôi phục
          </Button>
        ) : null}
        <Button
          aria-label="Bỏ chọn"
          className={cn(!hasSelection && "invisible")}
          disabled={isSubmitting || !hasSelection}
          onClick={onClear}
          size="icon-sm"
          variant="ghost"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
