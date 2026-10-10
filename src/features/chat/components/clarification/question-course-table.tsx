import { Plus, X } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Question } from "@/features/chat/schemas/clarification-schemas"
import {
  COURSE_TABLE_MAX_ROWS,
  type CourseRowDraft,
  type CourseTableDraft,
  emptyCourseRow,
  validateCourseRow,
} from "@/features/chat/utils/clarification-answers"
import { cn } from "@/lib/utils"

type QuestionCourseTableProps = {
  disabled?: boolean
  draft: CourseTableDraft
  error: string | null
  onChange: (draft: CourseTableDraft) => void
  question: Question
}

// Columns are fixed by the contract: name | credits (1..10) | score (0..10 or
// A+..F). A grid on desktop, one card per course on mobile.
const ROW_GRID =
  "sm:grid-cols-[minmax(0,1fr)_5.5rem_6.5rem_2rem] sm:items-start"

export function QuestionCourseTable({
  disabled = false,
  draft,
  error,
  onChange,
  question,
}: QuestionCourseTableProps) {
  const maxRows = Math.min(
    question.max_items ?? COURSE_TABLE_MAX_ROWS,
    COURSE_TABLE_MAX_ROWS
  )
  const canAdd = draft.rows.length < maxRows
  const listRef = useRef<HTMLUListElement>(null)
  // Row "Thêm môn" just added - its first cell is focused once rendered.
  const focusRowIdRef = useRef<string | null>(null)

  useEffect(() => {
    const rowId = focusRowIdRef.current
    if (!rowId) return
    listRef.current
      ?.querySelector<HTMLInputElement>(`[data-row-id="${rowId}"] input`)
      ?.focus()
    focusRowIdRef.current = null
  }, [draft.rows.length])

  const updateRow = (id: string, patch: Partial<CourseRowDraft>) =>
    onChange({
      ...draft,
      rows: draft.rows.map((row) =>
        row.id === id ? { ...row, ...patch } : row
      ),
    })

  return (
    <div className="space-y-3">
      <div
        aria-hidden="true"
        className={cn(
          "hidden gap-2 px-1 text-xs font-semibold text-muted-foreground sm:grid",
          ROW_GRID
        )}
      >
        <span>Tên môn</span>
        <span>Tín chỉ</span>
        <span>Điểm</span>
        <span />
      </div>
      <ul className="space-y-2" ref={listRef}>
        {draft.rows.map((row, index) => {
          const errors = validateCourseRow(row)
          const label = `Môn ${index + 1}`
          return (
            <li
              aria-label={label}
              data-row-id={row.id}
              className={cn(
                "grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 sm:border-border/40 sm:bg-transparent sm:p-0.5",
                ROW_GRID
              )}
              key={row.id}
            >
              <div className="col-span-2 -mt-1 -mr-1 flex items-center justify-between sm:order-last sm:col-span-1 sm:m-0 sm:justify-end">
                <span className="text-xs font-medium text-muted-foreground sm:sr-only">
                  {label}
                </span>
                <Button
                  aria-label={`Xoá ${label.toLowerCase()}`}
                  className="size-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
                  disabled={disabled || draft.rows.length === 1}
                  onClick={() =>
                    onChange({
                      ...draft,
                      rows: draft.rows.filter((item) => item.id !== row.id),
                    })
                  }
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="col-span-2 space-y-1 sm:col-span-1">
                <span className="text-xs text-muted-foreground sm:sr-only">
                  Tên môn
                </span>
                <Input
                  aria-invalid={Boolean(errors.name) || undefined}
                  aria-label={`${label}: tên môn`}
                  className="h-9 rounded-lg transition-all focus-visible:ring-1"
                  disabled={disabled}
                  maxLength={80}
                  onChange={(event) =>
                    updateRow(row.id, { name: event.target.value })
                  }
                  placeholder="Không bắt buộc"
                  value={row.name}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground sm:sr-only">
                  Tín chỉ
                </span>
                <Input
                  aria-invalid={Boolean(errors.credits) || undefined}
                  aria-label={`${label}: tín chỉ`}
                  className="h-9 rounded-lg transition-all focus-visible:ring-1"
                  disabled={disabled}
                  inputMode="numeric"
                  onChange={(event) =>
                    updateRow(row.id, { credits: event.target.value })
                  }
                  placeholder="1–10"
                  title={errors.credits}
                  value={row.credits}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground sm:sr-only">
                  Điểm
                </span>
                <Input
                  aria-invalid={Boolean(errors.score) || undefined}
                  aria-label={`${label}: điểm`}
                  className="h-9 rounded-lg transition-all focus-visible:ring-1"
                  disabled={disabled}
                  onChange={(event) =>
                    updateRow(row.id, { score: event.target.value })
                  }
                  placeholder="8.5 / B+"
                  title={errors.score}
                  value={row.score}
                />
              </div>
              {errors.name || errors.credits || errors.score ? (
                <p className="col-span-2 text-xs font-medium text-destructive sm:order-last sm:col-span-4">
                  {[errors.name, errors.credits, errors.score]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button
          className="h-8.5 rounded-lg px-3 text-xs font-medium shadow-2xs"
          disabled={disabled || !canAdd}
          onClick={() => {
            const row = emptyCourseRow()
            onChange({ ...draft, rows: [...draft.rows, row] })
            focusRowIdRef.current = row.id
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="mr-1 size-3.5" />
          Thêm môn
        </Button>
        <span className="text-xs font-medium text-muted-foreground">
          {draft.rows.length}/{maxRows} môn
        </span>
      </div>
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
