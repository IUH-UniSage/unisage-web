import { Check, Plus, Search, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAccessLevelsQuery } from "@/features/access-level/queries/use-queries"
import type { AccessLevel } from "@/features/access-level/schemas/access-level-schemas"
import type { DepartmentNode } from "@/features/departments/schemas/department-schemas"
import {
  flattenDepartmentTreeWithDepth,
  getDepthLevelStyle,
  type FlattenedDepartmentNode,
} from "@/features/departments/utils/tree"
import { cn } from "@/lib/utils"

export type DepartmentAccessValue = {
  accessLevel: number
  departmentId: string
}

type RowSource = "auto" | "manual"

type DraftRow = {
  accessLevel: number | null
  departmentId: string
  source: RowSource
}

type ConflictChild = {
  accessLevel: number | null
  departmentId: string
  departmentName: string
}

type NodeInfo = { depth: number; name: string; parentId: string | null }

function buildNodeIndex(tree: DepartmentNode[]): Map<string, NodeInfo> {
  const index = new Map<string, NodeInfo>()
  for (const node of flattenDepartmentTreeWithDepth(tree)) {
    index.set(node.id, {
      depth: node.depth,
      name: node.name,
      parentId: node.parentId ?? null,
    })
  }
  return index
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

// Every time a department with a parent is added to the list, its parent
// (grandparent, etc.) is auto-added too — climbing the tree from every
// manually-picked department up to the root. An ancestor's level is
// inferred from its direct children already present in the list: a single
// child (or several agreeing children) sets the level automatically;
// disagreeing children leave the ancestor's level blank and surface a
// conflict banner instead of guessing. This is pure client-side derivation
// over `tree` — no suggestion API involved (UNISAGE-56 was dropped).
function computeDisplayRows(
  manualRows: Map<string, number>,
  nodeIndex: Map<string, NodeInfo>
): {
  conflictsByDepartmentId: Map<string, ConflictChild[]>
  rows: Map<string, DraftRow>
} {
  const manualIds = new Set(manualRows.keys())
  const resolvedLevel = new Map<string, number | null>(manualRows)

  const ancestorIds = new Set<string>()
  for (const id of manualIds) {
    let currentParentId = nodeIndex.get(id)?.parentId ?? null
    while (currentParentId) {
      ancestorIds.add(currentParentId)
      currentParentId = nodeIndex.get(currentParentId)?.parentId ?? null
    }
  }

  // Deepest ancestor first, so a grandparent sees its parent's already
  // resolved level (bottom-up).
  const orderedAncestorIds = Array.from(ancestorIds).sort(
    (a, b) => (nodeIndex.get(b)?.depth ?? 0) - (nodeIndex.get(a)?.depth ?? 0)
  )

  const conflictsByDepartmentId = new Map<string, ConflictChild[]>()

  for (const ancestorId of orderedAncestorIds) {
    // An ancestor the admin already manages manually keeps its own value —
    // it's never auto-computed or overwritten, but it still feeds the level
    // used to resolve its own parent above it.
    if (manualIds.has(ancestorId)) continue

    const directChildIds = Array.from(resolvedLevel.keys()).filter(
      (id) => nodeIndex.get(id)?.parentId === ancestorId
    )
    if (directChildIds.length === 0) continue

    const levels = directChildIds.map((id) => resolvedLevel.get(id) ?? null)
    const distinctLevels = new Set(
      levels.filter((level): level is number => level != null)
    )

    if (distinctLevels.size === 1 && levels.every((level) => level != null)) {
      resolvedLevel.set(ancestorId, [...distinctLevels][0])
    } else if (distinctLevels.size >= 2) {
      resolvedLevel.set(ancestorId, null)
      conflictsByDepartmentId.set(
        ancestorId,
        directChildIds.map((id, index) => ({
          accessLevel: levels[index],
          departmentId: id,
          departmentName: nodeIndex.get(id)?.name ?? id,
        }))
      )
    } else {
      // Not enough resolved data yet (e.g. a deeper conflict cascaded up) —
      // leave blank without flagging it as its own conflict.
      resolvedLevel.set(ancestorId, null)
    }
  }

  const rows = new Map<string, DraftRow>()
  for (const [departmentId, accessLevel] of manualRows) {
    rows.set(departmentId, { accessLevel, departmentId, source: "manual" })
  }
  for (const ancestorId of orderedAncestorIds) {
    if (manualIds.has(ancestorId)) continue
    rows.set(ancestorId, {
      accessLevel: resolvedLevel.get(ancestorId) ?? null,
      departmentId: ancestorId,
      source: "auto",
    })
  }

  return { conflictsByDepartmentId, rows }
}

type DepartmentAccessSectionProps = {
  onChange: (value: DepartmentAccessValue[]) => void
  tree: DepartmentNode[]
  value: DepartmentAccessValue[]
}

export function DepartmentAccessSection({
  onChange,
  tree,
  value,
}: DepartmentAccessSectionProps) {
  // Seeded once from the form's committed value — after that, this map of
  // manually-added departments is the source of truth for what the admin is
  // actively editing. Every change immediately recomputes the full set
  // (manual + auto-derived ancestors) and pushes it up via onChange, exactly
  // like every other field in this form.
  const [manualLevelByDepartmentId, setManualLevelByDepartmentId] = useState<
    Map<string, number>
  >(() => new Map(value.map((item) => [item.departmentId, item.accessLevel])))

  const nodeIndex = useMemo(() => buildNodeIndex(tree), [tree])
  const accessLevelsQuery = useAccessLevelsQuery()
  const accessLevels = useMemo(
    () =>
      (accessLevelsQuery.data ?? [])
        .filter((accessLevel) => accessLevel.isActive)
        .sort((a, b) => a.level - b.level),
    [accessLevelsQuery.data]
  )

  const { conflictsByDepartmentId, rows } = useMemo(
    () => computeDisplayRows(manualLevelByDepartmentId, nodeIndex),
    [manualLevelByDepartmentId, nodeIndex]
  )
  const orderedRows = useMemo(
    () =>
      Array.from(rows.values()).sort(
        (a, b) =>
          (nodeIndex.get(a.departmentId)?.depth ?? 0) -
          (nodeIndex.get(b.departmentId)?.depth ?? 0)
      ),
    [rows, nodeIndex]
  )

  const commit = (nextManualLevelByDepartmentId: Map<string, number>) => {
    setManualLevelByDepartmentId(nextManualLevelByDepartmentId)
    const { rows: nextRows } = computeDisplayRows(
      nextManualLevelByDepartmentId,
      nodeIndex
    )
    onChange(
      Array.from(nextRows.values()).map((row) => ({
        accessLevel: row.accessLevel ?? 0,
        departmentId: row.departmentId,
      }))
    )
  }

  // Replaces the whole manual selection with exactly what's ticked in the
  // picker — keeps each still-ticked department's existing level, defaults
  // newly-ticked ones to 0, and drops anything unticked.
  const applySelection = (departmentIds: string[]) => {
    const next = new Map<string, number>()
    for (const id of departmentIds) {
      next.set(id, manualLevelByDepartmentId.get(id) ?? 0)
    }
    commit(next)
  }

  const removeDepartment = (departmentId: string) => {
    const next = new Map(manualLevelByDepartmentId)
    next.delete(departmentId)
    commit(next)
  }

  const handleAccessLevelChange = (
    departmentId: string,
    accessLevel: number
  ) => {
    const next = new Map(manualLevelByDepartmentId)
    next.set(departmentId, accessLevel)
    commit(next)
  }

  return (
    <div className="space-y-3">
      {orderedRows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          Chưa gán phòng ban nào cho người dùng này.
        </p>
      ) : (
        <div className="divide-y rounded-lg border">
          {orderedRows.map((row) => (
            <DepartmentAccessRow
              accessLevels={accessLevels}
              conflictChildren={conflictsByDepartmentId.get(row.departmentId)}
              depth={nodeIndex.get(row.departmentId)?.depth ?? 0}
              key={row.departmentId}
              name={nodeIndex.get(row.departmentId)?.name ?? row.departmentId}
              onAccessLevelChange={(accessLevel) =>
                handleAccessLevelChange(row.departmentId, accessLevel)
              }
              onRemove={() => removeDepartment(row.departmentId)}
              row={row}
            />
          ))}
        </div>
      )}

      <DepartmentMultiSelectAdd
        onApply={applySelection}
        selectedIds={new Set(manualLevelByDepartmentId.keys())}
        tree={tree}
      />
    </div>
  )
}

type DepartmentAccessRowProps = {
  accessLevels: AccessLevel[]
  conflictChildren?: ConflictChild[]
  depth: number
  name: string
  onAccessLevelChange: (accessLevel: number) => void
  onRemove: () => void
  row: DraftRow
}

function DepartmentAccessRow({
  accessLevels,
  conflictChildren,
  depth,
  name,
  onAccessLevelChange,
  onRemove,
  row,
}: DepartmentAccessRowProps) {
  const isAuto = row.source === "auto"

  return (
    <div className="space-y-2 px-3 py-2.5">
      <div
        className="flex items-center gap-2"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {depth > 0 ? (
            <span
              aria-hidden="true"
              className="text-xs text-muted-foreground/50 select-none"
            >
              └─
            </span>
          ) : null}
          <p className="truncate text-sm font-medium">{name}</p>
          {isAuto ? (
            <Badge
              className="h-4 shrink-0 px-1.5 text-[10px] font-normal"
              variant="secondary"
            >
              Tự động (cha)
            </Badge>
          ) : null}
        </div>

        <div className="w-32 shrink-0 space-y-1.5">
          <Select
            onValueChange={(nextValue) =>
              onAccessLevelChange(Number(nextValue))
            }
            value={row.accessLevel != null ? String(row.accessLevel) : ""}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue
                className="min-w-0 flex-1 truncate text-left"
                placeholder={
                  isAuto && row.accessLevel == null ? "—" : "Chọn cấp độ..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {accessLevels.map((accessLevel) => (
                <SelectItem
                  key={accessLevel.id}
                  value={String(accessLevel.level)}
                >
                  Cấp {accessLevel.level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isAuto ? (
          <div className="size-9 shrink-0" aria-hidden="true" />
        ) : (
          <Button
            aria-label="Xóa phòng ban"
            className="shrink-0"
            onClick={onRemove}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 className="size-4 text-destructive" aria-hidden="true" />
          </Button>
        )}
      </div>

      {conflictChildren?.length ? (
        <div
          className="space-y-1 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-xs text-destructive"
          role="alert"
        >
          <p className="font-medium">
            Các phòng ban con của phòng ban này đang có cấp độ khác nhau. Vui
            lòng chọn cấp độ phù hợp thủ công:
          </p>
          <ul className="list-disc space-y-0.5 pl-4">
            {conflictChildren.map((child) => (
              <li key={child.departmentId}>
                {child.departmentName}: {child.accessLevel ?? "chưa xác định"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

type DepartmentMultiSelectAddProps = {
  onApply: (departmentIds: string[]) => void
  selectedIds: Set<string>
  tree: DepartmentNode[]
}

function DepartmentMultiSelectAdd({
  onApply,
  selectedIds,
  tree,
}: DepartmentMultiSelectAddProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const options = useMemo(() => flattenDepartmentTreeWithDepth(tree), [tree])

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalize(query.trim())
    if (!normalizedQuery) return options
    return options.filter((option) =>
      normalize(option.name).includes(normalizedQuery)
    )
  }, [options, query])

  const togglePending = (id: string) => {
    setPendingIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleConfirm = () => {
    onApply(Array.from(pendingIds))
    setQuery("")
    setOpen(false)
  }

  return (
    <Popover
      onOpenChange={(next) => {
        setOpen(next)
        // Re-seed from the current selection every time it opens, so
        // departments added in a previous round still show up ticked
        // instead of disappearing from the list.
        setPendingIds(next ? new Set(selectedIds) : new Set())
        if (!next) setQuery("")
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <Button className="w-full" type="button" variant="outline">
          <Plus className="mr-2 size-4" />
          Thêm phòng ban
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <Input
            autoFocus
            className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm phòng ban theo tên..."
            value={query}
          />
        </div>

        <div className="max-h-64 overflow-y-auto overscroll-contain">
          <div className="space-y-0.5 p-1">
            {filteredOptions.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                Không tìm thấy phòng ban phù hợp.
              </p>
            ) : (
              filteredOptions.map((option) => (
                <DepartmentMultiSelectOption
                  checked={pendingIds.has(option.id)}
                  key={option.id}
                  onToggle={() => togglePending(option.id)}
                  option={option}
                />
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t p-2">
          <span className="px-1 text-xs text-muted-foreground">
            {pendingIds.size > 0
              ? `Đã chọn ${pendingIds.size}`
              : "Chưa chọn gì"}
          </span>
          <Button onClick={handleConfirm} size="sm" type="button">
            <Check className="mr-1.5 size-3.5" />
            Cập nhật danh sách
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type DepartmentMultiSelectOptionProps = {
  checked: boolean
  onToggle: () => void
  option: FlattenedDepartmentNode
}

function DepartmentMultiSelectOption({
  checked,
  onToggle,
  option,
}: DepartmentMultiSelectOptionProps) {
  const palette = getDepthLevelStyle(option.depth)

  return (
    <div
      className="flex items-center gap-2 rounded-md py-1.5 pr-2 hover:bg-accent"
      style={{ paddingLeft: `${option.depth * 16 + 8}px` }}
    >
      {option.depth > 0 ? (
        <span
          aria-hidden="true"
          className="text-xs text-muted-foreground/60 select-none"
        >
          └─
        </span>
      ) : null}
      <Checkbox
        checked={checked}
        id={`multiselect-${option.id}`}
        onCheckedChange={onToggle}
      />
      <span
        className={cn("size-1.5 shrink-0 rounded-full", palette.dot)}
        aria-hidden="true"
      />
      <Label
        className="min-w-0 flex-1 cursor-pointer truncate text-sm font-normal"
        htmlFor={`multiselect-${option.id}`}
      >
        {option.name}
      </Label>
    </div>
  )
}
