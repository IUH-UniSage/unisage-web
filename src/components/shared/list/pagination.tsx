import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaginationProps = {
  className?: string
  currentPage: number
  onPageChange: (page: number) => void
  pageSize: number
  totalItems: number
  totalPages: number
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages] as const
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const
  }

  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ] as const
}

export function Pagination({
  className,
  currentPage,
  onPageChange,
  pageSize,
  totalItems,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)
  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 rounded-xl border bg-card p-4 sm:flex-row",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">
        Hiển thị <span className="text-foreground">{startIndex}</span> đến{" "}
        <span className="text-foreground">{endIndex}</span> trong{" "}
        <span className="text-foreground">{totalItems}</span> kết quả
      </p>

      <nav aria-label="Phân trang" className="flex items-center gap-1">
        <Button
          aria-label="Trang trước"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          size="icon-sm"
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>

        {visiblePages.map((page) =>
          typeof page === "string" ? (
            <span
              aria-hidden="true"
              className="px-1.5 text-muted-foreground"
              key={page}
            >
              ...
            </span>
          ) : (
            <Button
              aria-current={currentPage === page ? "page" : undefined}
              aria-label={`Trang ${page}`}
              className="font-semibold"
              key={page}
              onClick={() => onPageChange(page)}
              size="icon-sm"
              variant={currentPage === page ? "default" : "ghost"}
            >
              {page}
            </Button>
          )
        )}

        <Button
          aria-label="Trang sau"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          size="icon-sm"
          variant="outline"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </nav>
    </div>
  )
}
