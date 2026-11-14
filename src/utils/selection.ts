export type SelectionStatusCounts = {
  active: number
  inactive: number
}

/**
 * Splits the selected rows into active / inactive counts so bulk actions only offer what applies:
 * all active → deactivate, all inactive → recover, mixed → both. Ids not in `items` (e.g. rows
 * removed by a refetch) are ignored.
 */
export function countSelectedByStatus<T extends { id: string }>(
  items: readonly T[],
  selectedIds: ReadonlySet<string>,
  isActive: (item: T) => boolean
): SelectionStatusCounts {
  const counts: SelectionStatusCounts = { active: 0, inactive: 0 }
  if (selectedIds.size === 0) return counts

  for (const item of items) {
    if (!selectedIds.has(item.id)) continue
    if (isActive(item)) {
      counts.active += 1
    } else {
      counts.inactive += 1
    }
  }
  return counts
}
