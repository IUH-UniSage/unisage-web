import { Edit2, Plus } from "lucide-react"
import { useMemo } from "react"

import { AuditInfo } from "@/components/shared/audit-info"
import { EntityStatusBadge } from "@/components/shared/list/entity-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type {
  Department,
  DepartmentNode,
} from "@/features/departments/schemas/department-schemas"
import {
  findDepartmentNode,
  getDepthLevelStyle,
} from "@/features/departments/utils/tree"

function findDepth(nodes: DepartmentNode[], id: string, depth = 0): number {
  for (const node of nodes) {
    if (node.id === id) return depth
    const found = findDepth(node.children ?? [], id, depth + 1)
    if (found >= 0) return found
  }
  return -1
}

type DepartmentDetailDialogProps = {
  canCreate: boolean
  canUpdate: boolean
  department?: Department
  onAddChild: (parentId: string) => void
  onEdit: (department: Department) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  tree: DepartmentNode[]
}

export function DepartmentDetailDialog({
  canCreate,
  canUpdate,
  department,
  onAddChild,
  onEdit,
  onOpenChange,
  open,
  tree,
}: DepartmentDetailDialogProps) {
  const depth = useMemo(
    () => (department ? findDepth(tree, department.id) : -1),
    [tree, department]
  )

  const parentName = useMemo(() => {
    if (!department?.parentId) return undefined
    return findDepartmentNode(tree, department.parentId)?.name
  }, [tree, department])

  if (!department) return null

  const depthStyle = getDepthLevelStyle(Math.max(depth, 0))
  const isActive = department.isActive ?? true
  const children = department.children ?? []

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="truncate text-lg">
              {department.name}
            </DialogTitle>
            <EntityStatusBadge isActive={isActive} />
          </div>
          <DialogDescription className="mt-0.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={depthStyle.badge}>
              {depthStyle.label}
            </Badge>
            {parentName ? (
              <span className="truncate text-xs text-muted-foreground">
                Trực thuộc:{" "}
                <strong className="text-foreground">{parentName}</strong>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Đơn vị gốc</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Function / Description */}
          {department.description ? (
            <div className="rounded-lg border bg-muted/30 p-3.5">
              <p className="text-xs font-semibold text-muted-foreground">
                Mô tả chức năng
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {department.description}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
              Chưa có mô tả chức năng cho đơn vị này.
            </div>
          )}

          {/* Sub-departments / Direct Children list */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Đơn vị trực thuộc ({children.length})
            </span>
            {children.length > 0 ? (
              <div className="max-h-36 divide-y overflow-y-auto rounded-lg border bg-card">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between px-3 py-2 text-xs"
                  >
                    <span className="truncate font-medium text-foreground">
                      {child.name}
                    </span>
                    <EntityStatusBadge isActive={child.isActive ?? true} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Không có đơn vị trực thuộc cấp dưới.
              </p>
            )}
          </div>

          {/* Audit metadata */}
          <AuditInfo
            createdAt={department.createdAt}
            createdByName={department.createdByName}
            updatedAt={department.updatedAt}
            updatedByName={department.updatedByName}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Đóng
            </Button>
          </DialogClose>
          {canCreate ? (
            <Button
              onClick={() => {
                onOpenChange(false)
                onAddChild(department.id)
              }}
              type="button"
              variant="outline"
            >
              <Plus aria-hidden="true" className="size-4" />
              Thêm trực thuộc
            </Button>
          ) : null}
          {canUpdate ? (
            <Button
              onClick={() => {
                onOpenChange(false)
                onEdit(department)
              }}
              type="button"
            >
              <Edit2 aria-hidden="true" className="size-4" />
              Chỉnh sửa
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
