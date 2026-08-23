import type { DepartmentNode } from "@/features/departments/schemas/department-schemas"

export interface FlattenedDepartmentNode extends DepartmentNode {
  depth: number
  parentName?: string
  totalChildrenCount: number
}

export type DepartmentUnitType = "department" | "faculty" | "office"

export const UNIT_TYPE_LABELS: Record<DepartmentUnitType, string> = {
  department: "Cấp 3",
  faculty: "Cấp 2",
  office: "Cấp 1",
}

// One color per root category (Phòng ban, Khoa, Viện, ...), shared between
// the org-chart diagram and the table view so both stay visually in sync.
// Cycles if there are more root categories than colors.
export const CATEGORY_COLORS = [
  {
    border: "border-primary/25",
    dot: "bg-primary",
    icon: "bg-primary/10 text-primary",
  },
  {
    border: "border-knowledge/30",
    dot: "bg-knowledge",
    icon: "bg-knowledge/15 text-knowledge",
  },
  {
    border: "border-success/30",
    dot: "bg-success",
    icon: "bg-success/15 text-success",
  },
  {
    border: "border-secondary",
    dot: "bg-secondary-foreground",
    icon: "bg-secondary text-secondary-foreground",
  },
  {
    border: "border-accent",
    dot: "bg-accent-foreground",
    icon: "bg-accent text-accent-foreground",
  },
  {
    border: "border-destructive/25",
    dot: "bg-destructive",
    icon: "bg-destructive/10 text-destructive",
  },
] as const

export function getUnitTypeByDepth(depth: number): DepartmentUnitType {
  if (depth <= 0) return "office"
  if (depth === 1) return "faculty"
  return "department"
}

/**
 * Color/label by hierarchy depth, not by which root branch a node
 * descends from — siblings across different root categories (e.g. all
 * depth-1 nodes, whether under "Khoa", "Trung tâm", or elsewhere) share
 * one color since they represent the same rung of the hierarchy. Just
 * "Cấp N" — no "Phòng ban/Khoa/Bộ môn" naming, since a given depth no
 * longer maps to one fixed real-world unit type across every root branch.
 */
export function getDepthLevelStyle(depth: number) {
  const palette = CATEGORY_COLORS[depth % CATEGORY_COLORS.length]
  return {
    ...palette,
    badge: `${palette.border} ${palette.icon}`,
    label: `Cấp ${depth + 1}`,
  }
}

export function filterDepartmentTree(
  nodes: DepartmentNode[],
  predicate: (node: DepartmentNode, depth: number) => boolean,
  depth = 0
): DepartmentNode[] {
  const result: DepartmentNode[] = []

  for (const node of nodes) {
    const children = filterDepartmentTree(
      node.children ?? [],
      predicate,
      depth + 1
    )
    if (predicate(node, depth) || children.length > 0) {
      result.push({ ...node, children })
    }
  }
  return result
}

export function countDepartmentNodes(nodes: DepartmentNode[]): number {
  let count = 0
  for (const node of nodes) {
    count += 1 + countDepartmentNodes(node.children ?? [])
  }
  return count
}

export function countActiveDepartmentNodes(nodes: DepartmentNode[]): number {
  let count = 0
  for (const node of nodes) {
    if (node.isActive ?? true) {
      count += 1
    }
    count += countActiveDepartmentNodes(node.children ?? [])
  }
  return count
}

export function getDepartmentStats(nodes: DepartmentNode[]) {
  const total = countDepartmentNodes(nodes)
  const roots = nodes.length
  const subUnits = Math.max(0, total - roots)
  const active = countActiveDepartmentNodes(nodes)

  return {
    active,
    inactive: total - active,
    roots,
    subUnits,
    total,
  }
}

export function collectAllNodeIds(nodes: DepartmentNode[]): Set<string> {
  const ids = new Set<string>()
  for (const node of nodes) {
    ids.add(node.id)
    if (node.children?.length) {
      for (const childId of collectAllNodeIds(node.children)) {
        ids.add(childId)
      }
    }
  }
  return ids
}

export function findDepartmentNode(
  nodes: DepartmentNode[],
  id: string
): DepartmentNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findDepartmentNode(node.children ?? [], id)
    if (found) return found
  }
  return undefined
}

export function collectSubtreeIds(node: DepartmentNode): Set<string> {
  const ids = new Set<string>([node.id])
  for (const child of node.children ?? []) {
    for (const id of collectSubtreeIds(child)) ids.add(id)
  }
  return ids
}

export function flattenDepartmentTreeWithDepth(
  nodes: DepartmentNode[],
  depth = 0,
  parentName = ""
): FlattenedDepartmentNode[] {
  const result: FlattenedDepartmentNode[] = []

  for (const node of nodes) {
    const totalChildren = countDepartmentNodes(node.children ?? [])

    result.push({
      ...node,
      depth,
      parentName: parentName || undefined,
      totalChildrenCount: totalChildren,
    })

    if (node.children?.length) {
      result.push(
        ...flattenDepartmentTreeWithDepth(node.children, depth + 1, node.name)
      )
    }
  }

  return result
}
