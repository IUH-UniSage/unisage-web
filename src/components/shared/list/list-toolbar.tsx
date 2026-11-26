import { Filter, RotateCcw, Search } from "lucide-react"
import { useEffect, useEffectEvent, useRef, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

type ListToolbarProps = {
  /**
   * The dropdown filters' current values, joined into one string. When it
   * changes the filters apply straight away, so picking "Vô hiệu hóa" doesn't
   * also need a click on "Lọc" (still there for the search text).
   */
  autoApplyKey?: string
  children?: ReactNode
  isFiltered: boolean
  onApplyFilters: () => void
  onResetFilters: () => void
  onSearchChange: (value: string) => void
  search: string
  searchAriaLabel: string
  searchPlaceholder: string
}

export function ListToolbar({
  autoApplyKey,
  children,
  isFiltered,
  onApplyFilters,
  onResetFilters,
  onSearchChange,
  search,
  searchAriaLabel,
  searchPlaceholder,
}: ListToolbarProps) {
  const appliedKey = useRef(autoApplyKey)
  const applyFilters = useEffectEvent(onApplyFilters)

  useEffect(() => {
    if (autoApplyKey === undefined || appliedKey.current === autoApplyKey) {
      return
    }
    appliedKey.current = autoApplyKey
    applyFilters()
  }, [autoApplyKey])

  return (
    <div
      {...tourAnchor(TOUR_ANCHORS.listToolbar)}
      className="flex flex-wrap items-center gap-2 border-b p-3"
    >
      <div
        {...tourAnchor(TOUR_ANCHORS.listSearch)}
        className="relative min-w-56 flex-1"
      >
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label={searchAriaLabel}
          className="pl-9"
          enterKeyHint="search"
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            // Skip Enter while a Vietnamese IME (Telex/VNI) is still composing.
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault()
              onApplyFilters()
            }
          }}
          placeholder={searchPlaceholder}
          value={search}
        />
      </div>
      {children}
      <div
        {...tourAnchor(TOUR_ANCHORS.listFilterActions)}
        className="flex gap-2"
      >
        <Button onClick={onApplyFilters}>
          <Filter aria-hidden="true" />
          Lọc
        </Button>
        {isFiltered ? (
          <Button onClick={onResetFilters} variant="ghost">
            <RotateCcw aria-hidden="true" />
            Đặt lại
          </Button>
        ) : null}
      </div>
    </div>
  )
}
