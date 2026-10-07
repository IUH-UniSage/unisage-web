import "@xyflow/react/dist/style.css"

import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Panel,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import {
  ArrowLeftRight,
  ArrowUpDown,
  Building,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  RotateCcw,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import type {
  Department,
  DepartmentNode,
} from "@/features/departments/schemas/department-schemas"
import {
  collectExpandableIds,
  layoutDepartmentGraph,
  type FlowDirection,
} from "@/features/departments/utils/flow-layout"
import { getDepthLevelStyle } from "@/features/departments/utils/tree"
import { cn } from "@/lib/utils"

type DepartmentFlowNodeData = {
  canCreate: boolean
  canDelete: boolean
  canUpdate: boolean
  childCount: number
  department: Department
  depth: number
  emphasis: "dim" | "match" | "normal"
  isCollapsed: boolean
  onAddChild: (parentId: string) => void
  onDetail: (department: Department) => void
  onEdit: (department: Department) => void
  onStatusRequest: (department: Department) => void
  onToggleCollapse: (id: string) => void
}

function DepartmentFlowNode({
  data,
  sourcePosition,
  targetPosition,
  width,
}: NodeProps<Node<DepartmentFlowNodeData>>) {
  const {
    canCreate,
    canDelete,
    canUpdate,
    childCount,
    department,
    depth,
    emphasis,
    isCollapsed,
    onAddChild,
    onDetail,
    onEdit,
    onStatusRequest,
    onToggleCollapse,
  } = data
  const isActive = department.isActive ?? true
  const canManage = canCreate || canUpdate || canDelete
  const palette = getDepthLevelStyle(depth)

  return (
    <div
      className={cn(
        "relative animate-in cursor-pointer rounded-lg border bg-card p-2.5 shadow-sm transition-all duration-200 ease-out fade-in-0 zoom-in-95 hover:shadow-md",
        palette.border,
        !isActive && "opacity-70",
        emphasis === "dim" && "opacity-30 grayscale-[0.4]",
        emphasis === "match" && "ring-2 ring-primary"
      )}
      onClick={() => onDetail(department)}
      style={{ width }}
    >
      <Handle
        className="size-2! border-0! bg-border!"
        position={targetPosition ?? Position.Left}
        type="target"
      />

      {canManage ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              {...tourAnchor(TOUR_ANCHORS.deptNodeActions)}
              aria-label={`Tùy chọn cho ${department.name}`}
              className="nodrag absolute top-1.5 right-1.5 size-5 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(event) => event.stopPropagation()}
              size="icon-sm"
              variant="ghost"
            >
              <MoreHorizontal aria-hidden="true" className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48"
            onClick={(event) => event.stopPropagation()}
          >
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation()
                onDetail(department)
              }}
            >
              <Eye aria-hidden="true" className="size-3.5" />
              Xem chi tiết
            </DropdownMenuItem>
            {canUpdate ? (
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(department)
                }}
              >
                <Pencil aria-hidden="true" className="size-3.5" />
                Chỉnh sửa
              </DropdownMenuItem>
            ) : null}
            {canCreate ? (
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  onAddChild(department.id)
                }}
              >
                <Plus aria-hidden="true" className="size-3.5" />
                Thêm đơn vị trực thuộc
              </DropdownMenuItem>
            ) : null}
            {canDelete ? <DropdownMenuSeparator /> : null}
            {canDelete ? (
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  onStatusRequest(department)
                }}
                variant={isActive ? "destructive" : "default"}
              >
                {isActive ? (
                  <Power aria-hidden="true" className="size-3.5" />
                ) : (
                  <RotateCcw aria-hidden="true" className="size-3.5" />
                )}
                {isActive ? "Ngừng hoạt động" : "Khôi phục"}
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <div className="flex items-center gap-1.5 pr-5">
        {childCount > 0 ? (
          <button
            aria-label={isCollapsed ? "Mở rộng" : "Thu gọn"}
            className="nodrag flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation()
              onToggleCollapse(department.id)
            }}
            type="button"
          >
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "size-3.5 transition-transform duration-200",
                !isCollapsed && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span aria-hidden="true" className="size-4 shrink-0" />
        )}

        <span
          aria-hidden="true"
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-md",
            palette.icon
          )}
        >
          <Building className="size-3.5" />
        </span>

        <div className="min-w-0 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <p
                className={cn(
                  "truncate text-[13px] font-semibold",
                  !isActive &&
                    "text-muted-foreground line-through decoration-muted-foreground/50"
                )}
              >
                {department.name}
              </p>
            </TooltipTrigger>
            <TooltipContent>{department.name}</TooltipContent>
          </Tooltip>
        </div>

        {isActive ? (
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-emerald-500"
          />
        ) : null}
      </div>

      <div className="mt-1 flex items-center gap-1.5 pl-6.5 text-[10px] text-muted-foreground">
        {department.description ? (
          <span className="truncate">{department.description}</span>
        ) : null}
        {department.description && childCount > 0 && isCollapsed ? (
          <span
            aria-hidden="true"
            className="shrink-0 text-muted-foreground/50"
          >
            ·
          </span>
        ) : null}
        {childCount > 0 && isCollapsed ? (
          <span className="shrink-0 font-medium tabular-nums">
            {childCount} trực thuộc
          </span>
        ) : null}
        {!isActive ? (
          <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 py-px font-medium text-destructive">
            Vô hiệu hóa
          </span>
        ) : null}
      </div>

      <Handle
        className="size-2! border-0! bg-border!"
        position={sourcePosition ?? Position.Right}
        type="source"
      />
    </div>
  )
}

const nodeTypes = { department: DepartmentFlowNode }

type DepartmentFlowViewProps = {
  canCreate: boolean
  canDelete: boolean
  canUpdate: boolean
  matchedIds: Set<string> | null
  onAddChild: (parentId: string) => void
  onDetail: (department: Department) => void
  onEdit: (department: Department) => void
  onStatusRequest: (department: Department) => void
  relevantIds: Set<string> | null
  tree: DepartmentNode[]
}

export function DepartmentFlowView({
  canCreate,
  canDelete,
  canUpdate,
  matchedIds,
  onAddChild,
  onDetail,
  onEdit,
  onStatusRequest,
  relevantIds,
  tree,
}: DepartmentFlowViewProps) {
  const { resolvedTheme } = useTheme()
  // Start every branch collapsed so the diagram opens compact — expanding a
  // node only reveals its direct children, one level at a time, instead of
  // dumping the whole subtree at once.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() =>
    collectExpandableIds(tree)
  )
  const [direction, setDirection] = useState<FlowDirection>("LR")
  const isFiltering = relevantIds !== null

  const toggleCollapse = (id: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const legendItems = useMemo(() => {
    const maxDepth = (nodes: DepartmentNode[], depth = 0): number =>
      nodes.reduce(
        (max, node) =>
          Math.max(
            max,
            node.children?.length ? maxDepth(node.children, depth + 1) : depth
          ),
        depth
      )
    const depthCount = tree.length ? maxDepth(tree) + 1 : 0

    return Array.from({ length: depthCount }, (_, depth) => {
      const style = getDepthLevelStyle(depth)
      return { dotClass: style.dot, label: style.label }
    })
  }, [tree])

  const { edges, nodes } = useMemo(() => {
    const effectiveCollapsed = isFiltering ? new Set<string>() : collapsedIds
    const graph = layoutDepartmentGraph(tree, effectiveCollapsed, direction)

    const withData: Node<DepartmentFlowNodeData>[] = graph.nodes.map((node) => {
      const department = node.data.node as Department
      const emphasis: DepartmentFlowNodeData["emphasis"] = !isFiltering
        ? "normal"
        : matchedIds?.has(node.id)
          ? "match"
          : relevantIds?.has(node.id)
            ? "normal"
            : "dim"

      return {
        ...node,
        data: {
          canCreate,
          canDelete,
          canUpdate,
          childCount: node.data.childCount,
          department,
          depth: node.data.depth,
          emphasis,
          isCollapsed: node.data.isCollapsed,
          onAddChild,
          onDetail,
          onEdit,
          onStatusRequest,
          onToggleCollapse: toggleCollapse,
        },
      }
    })

    const styledEdges: Edge[] = graph.edges.map((edge) => ({
      ...edge,
      style: { stroke: "var(--muted-foreground)", strokeWidth: 1.25 },
    }))

    return { edges: styledEdges, nodes: withData }
  }, [
    canCreate,
    canDelete,
    canUpdate,
    collapsedIds,
    direction,
    isFiltering,
    matchedIds,
    onAddChild,
    onDetail,
    onEdit,
    onStatusRequest,
    relevantIds,
    tree,
  ])

  return (
    <div
      {...tourAnchor(TOUR_ANCHORS.deptOrgChart)}
      className="h-[75vh] min-h-140 overflow-hidden rounded-xl border bg-card shadow-xs [&_.react-flow__edge-path]:transition-all [&_.react-flow__edge-path]:duration-300 [&_.react-flow__edge-path]:ease-out [&_.react-flow__node]:transition-transform [&_.react-flow__node]:duration-300 [&_.react-flow__node]:ease-out"
    >
      <ReactFlow
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        edges={edges}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.25 }}
        key={direction}
        maxZoom={2}
        minZoom={0.15}
        nodeTypes={nodeTypes}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
      >
        <Background gap={18} size={1} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />

        <Panel position="top-left">
          <div
            {...tourAnchor(TOUR_ANCHORS.deptLayoutToggle)}
            className="flex items-center rounded-lg border bg-card/95 p-0.5 shadow-sm backdrop-blur"
          >
            <button
              aria-label="Bố cục ngang"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                direction === "LR"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setDirection("LR")}
              type="button"
            >
              <ArrowLeftRight aria-hidden="true" className="size-3.5" />
              Ngang
            </button>
            <button
              aria-label="Bố cục dọc"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                direction === "TB"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setDirection("TB")}
              type="button"
            >
              <ArrowUpDown aria-hidden="true" className="size-3.5" />
              Dọc
            </button>
          </div>
        </Panel>

        <Panel position="top-right">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-card/90 px-2.5 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
            {legendItems.map((item) => (
              <span className="flex items-center gap-1.5" key={item.label}>
                <span
                  aria-hidden="true"
                  className={cn("size-2 rounded-full", item.dotClass)}
                />
                {item.label}
              </span>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
