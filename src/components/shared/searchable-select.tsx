import { Check, ChevronsUpDown, Search } from "lucide-react"
import { useState } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type SearchableSelectOption = {
  id: string
  label: string
}

type SearchableSelectProps = {
  ariaLabel?: string
  disabled?: boolean
  emptyText?: string
  onValueChange: (id: string) => void
  options: SearchableSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  value?: string
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
}

/**
 * A dropdown that scrolls and can be searched, for fields whose option list
 * can grow past a handful of items (majors, departments...) where plain
 * chips or a native <select> stop being usable - built here (not
 * feature-scoped) so anything with the same "N options, could be 100" shape
 * can reuse it instead of reinventing chips/select each time.
 */
export function SearchableSelect({
  ariaLabel,
  disabled,
  emptyText = "Không tìm thấy kết quả.",
  onValueChange,
  options,
  placeholder = "— Chọn —",
  searchPlaceholder = "Tìm kiếm...",
  value,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selected = options.find((option) => option.id === value)
  const normalizedQuery = normalize(query.trim())
  const filteredOptions = normalizedQuery
    ? options.filter((option) =>
        normalize(option.label).includes(normalizedQuery)
      )
    : options

  return (
    <Popover
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <button
          aria-label={ariaLabel}
          className="flex h-9 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          disabled={disabled}
          type="button"
        >
          <span
            className={cn(
              "truncate text-left",
              !selected && "text-muted-foreground"
            )}
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popper-anchor-width) p-0"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <input
            autoFocus
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            value={query}
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              {emptyText}
            </p>
          ) : (
            filteredOptions.map((option) => (
              <button
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  option.id === value && "bg-accent/60"
                )}
                key={option.id}
                onClick={() => {
                  onValueChange(option.id)
                  setOpen(false)
                }}
                type="button"
              >
                <Check
                  className={cn(
                    "size-4 shrink-0 text-primary",
                    option.id === value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate">{option.label}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
