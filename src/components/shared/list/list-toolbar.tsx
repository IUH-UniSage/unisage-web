import { Filter, RotateCcw, Search } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

type ListToolbarProps = {
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
  children,
  isFiltered,
  onApplyFilters,
  onResetFilters,
  onSearchChange,
  search,
  searchAriaLabel,
  searchPlaceholder,
}: ListToolbarProps) {
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
          onChange={(event) => onSearchChange(event.target.value)}
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
