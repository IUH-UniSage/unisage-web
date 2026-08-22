import { Power, RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ui/button"

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
  if (!selectedCount) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/50 px-3 py-2 md:px-4">
      <p className="text-sm font-medium">Đã chọn {selectedCount} mục</p>
      <div className="flex items-center gap-2">
        <Button
          disabled={isSubmitting}
          onClick={onDeactivate}
          size="sm"
          variant="outline"
        >
          <Power aria-hidden="true" />
          Vô hiệu hóa
        </Button>
        <Button
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
  )
}
