import { Position, type Edge, type Node } from "@xyflow/react"

import type { DepartmentNode } from "@/features/departments/schemas/department-schemas"

export type FlowDirection = "LR" | "TB"

// Every node shares one width so columns stay perfectly aligned. The width
// itself is computed from the longest name in the current tree (see
// computeNodeWidth) instead of a hard constant, so long names still fit
// without truncating.
export const FLOW_NODE_HEIGHT = 56
const MIN_NODE_WIDTH = 220
const MAX_NODE_WIDTH = 340
// Non-text chrome inside a node: chevron + icon + gaps + status dot + the
// padding reserved for the "..." menu button (see department-flow-view.tsx).
const NODE_CHROME_WIDTH = 112
const CHAR_WIDTH = 7.5

function collectNames(tree: DepartmentNode[], names: string[] = []) {
  for (const node of tree) {
    names.push(node.name)
    if (node.children?.length) collectNames(node.children, names)
  }
  return names
}

/** All node ids that have children — i.e. every id that can be collapsed. */
export function collectExpandableIds(
  tree: DepartmentNode[],
  ids: Set<string> = new Set()
): Set<string> {
  for (const node of tree) {
    if (node.children?.length) {
      ids.add(node.id)
      collectExpandableIds(node.children, ids)
    }
  }
  return ids
}

export function computeNodeWidth(tree: DepartmentNode[]): number {
  const longest = collectNames(tree).reduce(
    (max, name) => Math.max(max, name.length),
    0
  )
  return Math.min(
    MAX_NODE_WIDTH,
    Math.max(
      MIN_NODE_WIDTH,
      Math.round(NODE_CHROME_WIDTH + longest * CHAR_WIDTH)
    )
  )
}

export type DepartmentFlowNodeBaseData = {
  childCount: number
  depth: number
  isCollapsed: boolean
  node: DepartmentNode
}

/**
 * Deterministic tidy-tree layout: every leaf (or collapsed node) gets the
 * next sequential slot in traversal order, so same-depth siblings with no
 * children (e.g. standalone root categories) stack tightly instead of being
 * pulled apart by a sibling's large subtree. A parent's position is the
 * midpoint of its children. Depth maps 1:1 to a fixed column/row band;
 * `direction` swaps which axis is the depth axis vs. the sibling axis.
 */
export function layoutDepartmentGraph(
  tree: DepartmentNode[],
  collapsedIds: Set<string>,
  direction: FlowDirection = "LR"
): {
  edges: Edge[]
  nodes: Node<DepartmentFlowNodeBaseData>[]
} {
  const nodeWidth = computeNodeWidth(tree)
  const slotPitch = direction === "LR" ? FLOW_NODE_HEIGHT + 14 : nodeWidth + 32
  const depthGap = direction === "LR" ? nodeWidth + 90 : FLOW_NODE_HEIGHT + 90

  const nodes: Node<DepartmentFlowNodeBaseData>[] = []
  const edges: Edge[] = []
  let slotCursor = 0

  function visit(
    node: DepartmentNode,
    depth: number,
    parentId?: string
  ): number {
    const childCount = node.children?.length ?? 0
    const isCollapsed = childCount > 0 && collapsedIds.has(node.id)

    let slot: number
    if (isCollapsed || childCount === 0) {
      slot = slotCursor
      slotCursor += 1
    } else {
      const childSlots = node.children!.map((child) =>
        visit(child, depth + 1, node.id)
      )
      slot = (Math.min(...childSlots) + Math.max(...childSlots)) / 2
      // Breathing room after this whole subtree, so the next sibling group
      // (which may belong to a different parent) doesn't sit flush against it.
      slotCursor += 1
    }

    const position =
      direction === "LR"
        ? { x: depth * depthGap, y: slot * slotPitch }
        : { x: slot * slotPitch, y: depth * depthGap }

    nodes.push({
      data: { childCount, depth, isCollapsed, node },
      id: node.id,
      position,
      sourcePosition: direction === "LR" ? Position.Right : Position.Bottom,
      targetPosition: direction === "LR" ? Position.Left : Position.Top,
      type: "department",
      width: nodeWidth,
    })

    if (parentId) {
      edges.push({
        id: `${parentId}->${node.id}`,
        source: parentId,
        target: node.id,
        type: "smoothstep",
      })
    }

    return slot
  }

  for (const root of tree) visit(root, 0)

  return { edges, nodes }
}
