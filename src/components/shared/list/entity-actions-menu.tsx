import { MoreHorizontal, Pencil, Power, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type EntityActionsMenuProps = {
  canDelete: boolean
  canUpdate: boolean
  entityLabel: string
  isActive: boolean
  onEdit: () => void
  onStatusRequest: () => void
}

export function EntityActionsMenu({
  canDelete,
  canUpdate,
  entityLabel,
  isActive,
  onEdit,
  onStatusRequest,
}: EntityActionsMenuProps) {
  if (!canUpdate && !canDelete) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Hành động cho ${entityLabel}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdate ? (
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil aria-hidden="true" />
            Chỉnh sửa
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            onSelect={onStatusRequest}
            variant={isActive ? "destructive" : "default"}
          >
            {isActive ? (
              <Power aria-hidden="true" />
            ) : (
              <RotateCcw aria-hidden="true" />
            )}
            {isActive ? "Vô hiệu hóa" : "Khôi phục"}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
