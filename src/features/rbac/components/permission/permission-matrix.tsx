import {
  CheckSquare,
  ChevronsDownUp,
  ChevronsUpDown,
  Search,
  Square,
} from "lucide-react"
import { useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import type { AccessPermission } from "@/features/rbac/schemas/rbac-schemas"
import {
  getRowIds,
  matrixColumnOrder,
  type PermissionMatrixRow,
} from "@/features/rbac/utils/permission-matrix"
import { getActionLabel } from "@/features/rbac/utils/rbac-formatters"
import { cn } from "@/lib/utils"

type PermissionMatrixProps = {
  isChecked: (id: string) => boolean
  isDisabled?: (permission: AccessPermission) => boolean
  onSearchQueryChange?: (value: string) => void
  onToggleCell?: (permission: AccessPermission, checked: boolean) => void
  onToggleRow?: (ids: string[], checked: boolean) => void
  rows: PermissionMatrixRow[]
  searchPlaceholder?: string
  searchQuery?: string
}

/**
 * Resource → action permission picker/viewer, grouped as a collapsible tree
 * (one section per resource) rather than a resource × action matrix — a
 * uniform grid visually forces every resource into the same fixed set of
 * columns even though most rows don't use most actions, which reads as
 * repetitive "wall of checkboxes." A tree scales better at this catalog's
 * size (~15 resources) and lets each resource show only the actions it
 * actually has.
 *
 * Passing no `onToggleCell` renders a fully read-only view (disabled
 * checkboxes) — used by the role detail page.
 */
export function PermissionMatrix({
  isChecked,
  isDisabled,
  onSearchQueryChange,
  onToggleCell,
  onToggleRow,
  rows,
  searchPlaceholder,
  searchQuery,
}: PermissionMatrixProps) {
  const [expandedResources, setExpandedResources] = useState<string[]>([])

  return (
    <div className="space-y-3">
      <div
        {...tourAnchor(TOUR_ANCHORS.permissionMatrixToolbar)}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        {onSearchQueryChange ? (
          <div className="relative max-w-md flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Tìm quyền hạn"
              className="pl-9"
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder={searchPlaceholder ?? "Tìm kiếm quyền hạn..."}
              value={searchQuery ?? ""}
            />
          </div>
        ) : null}
        <div className="flex shrink-0 justify-end gap-2">
          <Button
            className="h-7 px-2.5 text-[11px]"
            onClick={() =>
              setExpandedResources(rows.map((row) => row.resource))
            }
            size="sm"
            type="button"
            variant="outline"
          >
            <ChevronsUpDown className="mr-1 size-3" />
            Mở rộng tất cả
          </Button>
          <Button
            className="h-7 px-2.5 text-[11px]"
            onClick={() => setExpandedResources([])}
            size="sm"
            type="button"
            variant="outline"
          >
            <ChevronsDownUp className="mr-1 size-3" />
            Thu gọn tất cả
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Không tìm thấy quyền hạn nào phù hợp với điều kiện tìm kiếm.
        </p>
      ) : (
        <Accordion
          {...tourAnchor(TOUR_ANCHORS.permissionMatrixGroups)}
          className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2"
          onValueChange={setExpandedResources}
          type="multiple"
          value={expandedResources}
        >
          {rows.map((row) => {
            const rowIds = getRowIds(row)
            const checkedCount = rowIds.filter(isChecked).length
            const isFullyGranted =
              rowIds.length > 0 && checkedCount === rowIds.length
            const actions = matrixColumnOrder.filter(
              (action) => row.cells[action]
            )

            return (
              <AccordionItem
                className="rounded-lg border bg-card px-3"
                key={row.resource}
                value={row.resource}
              >
                <div className="flex items-center gap-1">
                  <AccordionTrigger className="flex-1 rounded-md py-3 hover:bg-muted/60 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-wide text-foreground uppercase">
                        {row.resourceLabel}
                      </span>
                      <Badge
                        className="font-mono"
                        variant={
                          checkedCount === 0
                            ? "outline"
                            : isFullyGranted
                              ? "default"
                              : "secondary"
                        }
                      >
                        {checkedCount}/{rowIds.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  {onToggleRow && rowIds.length > 0 ? (
                    <Button
                      className="h-7 shrink-0 px-2 text-[11px]"
                      onClick={(event) => {
                        event.stopPropagation()
                        onToggleRow(rowIds, checkedCount === 0)
                      }}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      {checkedCount === 0 ? (
                        <>
                          <CheckSquare className="mr-1 size-3 text-primary" />
                          Chọn tất cả
                        </>
                      ) : (
                        <>
                          <Square className="mr-1 size-3 text-muted-foreground" />
                          Bỏ chọn
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
                <AccordionContent className="pb-3">
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action) => {
                      const permission = row.cells[action]
                      if (!permission) return null
                      const checked = isChecked(permission.id)
                      const disabled =
                        !onToggleCell || (isDisabled?.(permission) ?? false)

                      return (
                        <label
                          className={cn(
                            "flex items-center gap-2 rounded-lg border p-2 transition-colors",
                            checked
                              ? "border-primary/40 bg-primary/10 dark:bg-primary/15"
                              : "border-border bg-muted/30",
                            !disabled &&
                              "cursor-pointer hover:border-primary/40"
                          )}
                          key={action}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onCheckedChange={
                              onToggleCell
                                ? (value) =>
                                    onToggleCell(permission, value === true)
                                : undefined
                            }
                          />
                          <span className="text-xs font-semibold text-foreground">
                            {getActionLabel(action)}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </div>
  )
}
