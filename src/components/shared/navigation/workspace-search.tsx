import { CornerDownLeft, Search, SearchX } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { useNavigate } from "react-router-dom"

import { useVisibleNavItems } from "@/components/shared/navigation/use-visible-nav-items"
import { Input } from "@/components/ui/input"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { cn } from "@/lib/utils"
import type { StaffWorkspace } from "@/routes/feature-registry"
import { searchWorkspace } from "@/routes/workspace-search"
import type { WorkspaceSearchResult } from "@/routes/workspace-search"

type WorkspaceSearchProps = {
  autoFocus?: boolean
  className?: string
  onNavigate?: () => void
  workspace: StaffWorkspace
}

const PLACEHOLDER = "Tìm trong không gian làm việc"

// Header combobox that jumps to a sidebar page, or straight to a tab inside
// one, by Vietnamese/English keyword (see workspace-search-keywords.ts).
// Ctrl/⌘+K focuses it from anywhere in the workspace.
export function WorkspaceSearch({
  autoFocus,
  className,
  onNavigate,
  workspace,
}: WorkspaceSearchProps) {
  const navigate = useNavigate()
  const navItems = useVisibleNavItems(workspace)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(
    () => searchWorkspace(navItems, query),
    [navItems, query]
  )
  const hasQuery = query.trim().length > 0
  const showPanel = isOpen && hasQuery

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [])

  const selectResult = (result: WorkspaceSearchResult) => {
    navigate(result.to)
    setQuery("")
    setIsOpen(false)
    inputRef.current?.blur()
    onNavigate?.()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (hasQuery) {
        setQuery("")
      } else {
        inputRef.current?.blur()
      }
      return
    }

    if (!results.length) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((index) => (index + 1) % results.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === "Enter") {
      event.preventDefault()
      const result = results[activeIndex] ?? results[0]
      if (result) selectResult(result)
    }
  }

  const activeOptionId =
    showPanel && results[activeIndex]
      ? `${listboxId}-${results[activeIndex].id}`
      : undefined

  return (
    <div
      {...tourAnchor(TOUR_ANCHORS.workspaceSearch)}
      className={cn("group relative", className)}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
      />
      <Input
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={showPanel}
        aria-label={PLACEHOLDER}
        autoComplete="off"
        autoFocus={autoFocus}
        className="h-10 bg-background pr-14 pl-9"
        onBlur={() => setIsOpen(false)}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(0)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER}
        ref={inputRef}
        role="combobox"
        type="text"
        value={query}
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground lg:inline-block">
        Ctrl K
      </kbd>

      {showPanel ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          {results.length ? (
            <ul
              aria-label="Kết quả tìm kiếm"
              className="max-h-80 overflow-y-auto p-1"
              id={listboxId}
              role="listbox"
            >
              {results.map((result, index) => {
                const Icon = result.icon
                const isActive = index === activeIndex

                return (
                  <li
                    aria-selected={isActive}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                    id={`${listboxId}-${result.id}`}
                    key={result.id}
                    // mousedown, not click: keeps focus in the input so its
                    // onBlur doesn't close the panel before selection lands.
                    onMouseDown={(event) => {
                      event.preventDefault()
                      selectResult(result)
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    role="option"
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {result.parentLabel ? (
                        <span className="text-muted-foreground">
                          {result.parentLabel} ›{" "}
                        </span>
                      ) : null}
                      <span className="font-medium">{result.label}</span>
                    </span>
                    {isActive ? (
                      <CornerDownLeft
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-muted-foreground"
                      />
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div
              className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground"
              id={listboxId}
              role="status"
            >
              <SearchX aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">
                Không tìm thấy mục nào khớp với “{query.trim()}”
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
