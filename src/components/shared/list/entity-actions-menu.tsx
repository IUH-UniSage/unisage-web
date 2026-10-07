import { Eye, MoreHorizontal, Pencil, Power, RotateCcw } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

type EntityActionsMenuProps = {
  canDelete?: boolean
  canUpdate?: boolean
  children?: ReactNode
  detailLabel?: string
  editLabel?: string
  entityLabel: string
  isActive?: boolean
  onDetail?: () => void
  onEdit?: () => void
  onStatusRequest?: () => void
}

export function EntityActionsMenu({
  canDelete = false,
  canUpdate = false,
  children,
  detailLabel = "Xem chi tiết",
  editLabel = "Chỉnh sửa",
  entityLabel,
  isActive = true,
  onDetail,
  onEdit,
  onStatusRequest,
}: EntityActionsMenuProps) {
  const hasActions = Boolean(
    onDetail ||
    (canUpdate && onEdit) ||
    (canDelete && onStatusRequest) ||
    children
  )
  if (!hasActions) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          {...tourAnchor(TOUR_ANCHORS.rowActions)}
          aria-label={`Hành động cho ${entityLabel}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48"
        onClick={(event) => event.stopPropagation()}
      >
        {onDetail ? (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation()
              onDetail()
            }}
          >
            <Eye aria-hidden="true" className="size-4" />
            <span>{detailLabel}</span>
          </DropdownMenuItem>
        ) : null}
        {canUpdate && onEdit ? (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation()
              onEdit()
            }}
          >
            <Pencil aria-hidden="true" className="size-4" />
            <span>{editLabel}</span>
          </DropdownMenuItem>
        ) : null}
        {children}
        {canDelete && onStatusRequest ? (
          <>
            {onDetail || (canUpdate && onEdit) || children ? (
              <DropdownMenuSeparator />
            ) : null}
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation()
                onStatusRequest()
              }}
              variant={isActive ? "destructive" : "default"}
            >
              {isActive ? (
                <Power aria-hidden="true" className="size-4" />
              ) : (
                <RotateCcw aria-hidden="true" className="size-4" />
              )}
              <span>{isActive ? "Vô hiệu hóa" : "Khôi phục"}</span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
