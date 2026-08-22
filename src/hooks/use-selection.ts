import { useState } from "react"

export function useSelection<T extends string>() {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(() => new Set())

  const toggle = (id: T) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = (ids: T[]) => {
    setSelectedIds((current) => {
      const allSelected = ids.every((id) => current.has(id))
      if (allSelected) {
        const next = new Set(current)
        ids.forEach((id) => next.delete(id))
        return next
      }
      return new Set([...current, ...ids])
    })
  }

  const clear = () => setSelectedIds(new Set())

  return { clear, selectedIds, toggle, toggleAll }
}
