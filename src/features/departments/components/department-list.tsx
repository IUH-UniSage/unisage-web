import { LayoutGrid, Table as TableIcon } from "lucide-react"

import { ListToolbar } from "@/components/shared/list/list-toolbar"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DepartmentFlowView } from "@/features/departments/components/department-flow-view"
import { DepartmentTableView } from "@/features/departments/components/department-table-view"
import type {
  DepartmentViewMode,
  StatusFilter,
  TypeFilter,
} from "@/features/departments/hooks/use-department-dashboard"
import type {
  Department,
  DepartmentNode,
} from "@/features/departments/schemas/department-schemas"
import type { FlattenedDepartmentNode } from "@/features/departments/utils/tree"
import { UNIT_TYPE_LABELS } from "@/features/departments/utils/tree"
import { cn } from "@/lib/utils"

type DepartmentListProps = {
  canCreate: boolean
  canDelete: boolean
  canUpdate: boolean
  departmentTree: DepartmentNode[]
  flattenedList: FlattenedDepartmentNode[]
  isFiltered: boolean
  matchedIds: Set<string> | null
  onAddChild: (parentId: string) => void
  onApplyFilters: () => void
  onDetail: (department: Department) => void
  onEdit: (department: Department) => void
  onResetFilters: () => void
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onStatusRequest: (department: Department) => void
  onTypeChange: (value: TypeFilter) => void
  onViewModeChange: (mode: DepartmentViewMode) => void
  relevantIds: Set<string> | null
  search: string
  status: StatusFilter
  type: TypeFilter
  viewMode: DepartmentViewMode
}

export function DepartmentList({
  canCreate,
  canDelete,
  canUpdate,
  departmentTree,
  flattenedList,
  isFiltered,
  matchedIds,
  onAddChild,
  onApplyFilters,
  onDetail,
  onEdit,
  onResetFilters,
  onSearchChange,
  onStatusChange,
  onStatusRequest,
  onTypeChange,
  onViewModeChange,
  relevantIds,
  search,
  status,
  type,
  viewMode,
}: DepartmentListProps) {
  const hasItems = flattenedList.length > 0

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      {/* Standard ListToolbar matching Users and RBAC */}
      <ListToolbar
        isFiltered={isFiltered}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        onSearchChange={onSearchChange}
        search={search}
        searchAriaLabel="Tìm phòng ban"
        searchPlaceholder="Tìm tên phòng ban hoặc mô tả..."
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Type filter dropdown */}
          <Select
            onValueChange={(value) => onTypeChange(value as TypeFilter)}
            value={type}
          >
            <SelectTrigger
              aria-label="Lọc loại đơn vị"
              className="w-full sm:w-40"
            >
              <SelectValue placeholder="Tất cả loại đơn vị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại đơn vị</SelectItem>
              <SelectItem value="office">{UNIT_TYPE_LABELS.office}</SelectItem>
              <SelectItem value="faculty">
                {UNIT_TYPE_LABELS.faculty}
              </SelectItem>
              <SelectItem value="department">
                {UNIT_TYPE_LABELS.department}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter dropdown */}
          <Select
            onValueChange={(value) => onStatusChange(value as StatusFilter)}
            value={status}
          >
            <SelectTrigger
              aria-label="Lọc trạng thái phòng ban"
              className="w-full sm:w-40"
            >
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Switcher Toggle */}
          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange("tree")}
              aria-label="Chế độ xem sơ đồ tổ chức"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
                viewMode === "tree"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-3.5" aria-hidden="true" />
              <span>Sơ đồ tổ chức</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              aria-label="Chế độ xem danh sách"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableIcon className="size-3.5" aria-hidden="true" />
              <span>Danh sách</span>
            </button>
          </div>
        </div>
      </ListToolbar>

      {/* Content Area */}
      {hasItems ? (
        viewMode === "tree" ? (
          <div className="p-3 sm:p-4">
            <DepartmentFlowView
              canCreate={canCreate}
              canDelete={canDelete}
              canUpdate={canUpdate}
              matchedIds={matchedIds}
              onAddChild={onAddChild}
              onDetail={onDetail}
              onEdit={onEdit}
              onStatusRequest={onStatusRequest}
              relevantIds={relevantIds}
              tree={departmentTree}
            />
          </div>
        ) : (
          <DepartmentTableView
            canCreate={canCreate}
            canDelete={canDelete}
            canUpdate={canUpdate}
            items={flattenedList}
            onAddChild={onAddChild}
            onDetail={onDetail}
            onEdit={onEdit}
            onStatusRequest={onStatusRequest}
          />
        )
      ) : (
        <SearchEmpty
          description="Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc đang áp dụng."
          title="Không tìm thấy phòng ban phù hợp"
        />
      )}
    </div>
  )
}
