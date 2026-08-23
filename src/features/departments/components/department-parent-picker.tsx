import { ChevronRight, ChevronsUpDown, Folder } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DepartmentNode } from "@/features/departments/schemas/department-schemas"
import { findDepartmentNode } from "@/features/departments/utils/tree"
import { cn } from "@/lib/utils"

const ROOT_LEVEL_LABEL = "Không có (cấp cao nhất)"

type DepartmentParentOptionProps = {
  depth: number
  excludedIds: Set<string>
  node: DepartmentNode
  onSelect: (id: string) => void
  value: string | null | undefined
}

function DepartmentParentOption({
  depth,
  excludedIds,
  node,
  onSelect,
  value,
}: DepartmentParentOptionProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (excludedIds.has(node.id)) return null

  const children = node.children ?? []
  const hasChildren = children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-1"
        style={{ paddingLeft: depth * 16 }}
      >
        {hasChildren ? (
          <button
            aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
            className="flex size-5 shrink-0 items-center justify-center text-muted-foreground"
            onClick={() => setIsOpen((open) => !open)}
            type="button"
          >
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "size-3.5 transition-transform",
                isOpen && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span aria-hidden="true" className="size-5 shrink-0" />
        )}
        <button
          className={cn(
            "flex flex-1 items-center gap-1.5 truncate rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
            value === node.id && "bg-accent font-medium"
          )}
          onClick={() => onSelect(node.id)}
          type="button"
        >
          <Folder
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground"
          />
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      {hasChildren && isOpen
        ? children.map((child) => (
            <DepartmentParentOption
              depth={depth + 1}
              excludedIds={excludedIds}
              key={child.id}
              node={child}
              onSelect={onSelect}
              value={value}
            />
          ))
        : null}
    </div>
  )
}

type DepartmentParentPickerProps = {
  excludedIds: Set<string>
  onChange: (id: string | null) => void
  tree: DepartmentNode[]
  value: string | null | undefined
}

export function DepartmentParentPicker({
  excludedIds,
  onChange,
  tree,
  value,
}: DepartmentParentPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedName = useMemo(() => {
    if (!value) return null
    return findDepartmentNode(tree, value)?.name ?? null
  }, [tree, value])

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="w-full justify-between font-normal"
          type="button"
          variant="outline"
        >
          <span className="truncate">{selectedName ?? ROOT_LEVEL_LABEL}</span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-1"
      >
        <ScrollArea className="max-h-64">
          <button
            className={cn(
              "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
              !value && "bg-accent font-medium"
            )}
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            type="button"
          >
            {ROOT_LEVEL_LABEL}
          </button>
          {tree.map((node) => (
            <DepartmentParentOption
              depth={0}
              excludedIds={excludedIds}
              key={node.id}
              node={node}
              onSelect={(id) => {
                onChange(id)
                setOpen(false)
              }}
              value={value}
            />
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
