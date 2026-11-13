import type { DepartmentNode } from "@/features/departments/schemas/department-schemas"

export type DepartmentIndex = {
  /** Every child shown in the picker, active or not. */
  childrenById: Map<string, string[]>
  nameById: Map<string, string>
  parentById: Map<string, string | null>
  /** Active children only: what makes a unit a leaf (same rule as the backend). */
  activeChildrenById: Map<string, string[]>
}

export function buildDepartmentIndex(tree: DepartmentNode[]): DepartmentIndex {
  const index: DepartmentIndex = {
    activeChildrenById: new Map(),
    childrenById: new Map(),
    nameById: new Map(),
    parentById: new Map(),
  }

  const visit = (node: DepartmentNode, parentId: string | null) => {
    index.nameById.set(node.id, node.name)
    index.parentById.set(node.id, parentId)
    const children = node.children ?? []
    index.childrenById.set(
      node.id,
      children.map((child) => child.id)
    )
    index.activeChildrenById.set(
      node.id,
      children
        .filter((child) => child.isActive !== false)
        .map((child) => child.id)
    )
    children.forEach((child) => visit(child, node.id))
  }
  tree.forEach((node) => visit(node, null))

  return index
}

function descendantsOf(id: string, index: DepartmentIndex): string[] {
  const result: string[] = []
  const stack = [...(index.childrenById.get(id) ?? [])]
  while (stack.length) {
    const current = stack.pop()!
    result.push(current)
    stack.push(...(index.childrenById.get(current) ?? []))
  }
  return result
}

/**
 * Ticking a unit ticks its whole subtree, and a parent whose children are now all ticked is
 * ticked too (up to the root). Unticking a unit unticks its subtree and every ancestor, since
 * the ancestor no longer has all its children.
 */
export function toggleDepartmentCascade(
  selected: ReadonlySet<string>,
  id: string,
  index: DepartmentIndex
): Set<string> {
  const next = new Set(selected)
  const subtree = [id, ...descendantsOf(id, index)]
  let parentId = index.parentById.get(id) ?? null

  if (selected.has(id)) {
    subtree.forEach((nodeId) => next.delete(nodeId))
    while (parentId) {
      next.delete(parentId)
      parentId = index.parentById.get(parentId) ?? null
    }
    return next
  }

  subtree.forEach((nodeId) => next.add(nodeId))
  while (parentId) {
    const siblings = index.childrenById.get(parentId) ?? []
    if (!siblings.every((siblingId) => next.has(siblingId))) break
    next.add(parentId)
    parentId = index.parentById.get(parentId) ?? null
  }
  return next
}

/**
 * Names of assigned units that have active child units but none of their leaves assigned. Empty
 * when the selection is valid; `null` when nothing is assigned at all.
 */
export function findBranchesWithoutLeaf(
  departmentIds: Iterable<string>,
  index: DepartmentIndex
): string[] | null {
  const assigned = new Set(departmentIds)
  if (assigned.size === 0) return null

  const isLeaf = (id: string) =>
    (index.activeChildrenById.get(id) ?? []).length === 0

  const hasAssignedLeafBelow = (id: string): boolean =>
    (index.activeChildrenById.get(id) ?? []).some(
      (childId) =>
        (assigned.has(childId) && isLeaf(childId)) ||
        hasAssignedLeafBelow(childId)
    )

  return [...assigned]
    .filter((id) => !isLeaf(id) && !hasAssignedLeafBelow(id))
    .map((id) => index.nameById.get(id) ?? id)
    .sort((a, b) => a.localeCompare(b, "vi"))
}

/**
 * What the picker hands to the access list: drop every unit that has a ticked unit below it.
 * Those parents are re-added by the list as "Tự động (cha)" rows whose level comes from their
 * children, instead of becoming manual rows with no level.
 */
export function withoutTickedAncestors(
  departmentIds: Iterable<string>,
  index: DepartmentIndex
): string[] {
  const ids = new Set(departmentIds)
  const ancestorsOfTicked = new Set<string>()
  for (const id of ids) {
    let parentId = index.parentById.get(id) ?? null
    while (parentId) {
      ancestorsOfTicked.add(parentId)
      parentId = index.parentById.get(parentId) ?? null
    }
  }
  return [...ids].filter((id) => !ancestorsOfTicked.has(id))
}

/** The reverse when the picker reopens: tick every parent whose children are all ticked. */
export function withCompletedAncestors(
  departmentIds: Iterable<string>,
  index: DepartmentIndex
): Set<string> {
  const ids = new Set(departmentIds)
  let changed = true
  while (changed) {
    changed = false
    for (const [parentId, childIds] of index.childrenById) {
      if (
        !ids.has(parentId) &&
        childIds.length > 0 &&
        childIds.every((childId) => ids.has(childId))
      ) {
        ids.add(parentId)
        changed = true
      }
    }
  }
  return ids
}
