import { Plus, X } from "lucide-react"

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

  const updateRow = (id: string, patch: Partial<CourseRowDraft>) =>
    onChange({
      ...draft,
      rows: draft.rows.map((row) =>
        row.id === id ? { ...row, ...patch } : row
      ),
    })

  return (
    <div className="space-y-2">
      <div
        aria-hidden="true"
        className={cn(
          "hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid",
          ROW_GRID
        )}
      >
        <span>Tên môn</span>
        <span>Tín chỉ</span>
        <span>Điểm</span>
        <span />
      </div>
      <ul className="space-y-2">
        {draft.rows.map((row, index) => {
          const errors = validateCourseRow(row)
          const label = `Môn ${index + 1}`
          return (
            <li
              aria-label={label}
              className={cn(
                "grid grid-cols-2 gap-2 rounded-xl border border-border p-3 sm:border-0 sm:p-0",
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
                  className="size-8 text-muted-foreground"
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
                  className="h-9"
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
                  className="h-9"
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
                  className="h-9"
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
                <p className="col-span-2 text-xs text-destructive sm:order-last sm:col-span-4">
                  {[errors.name, errors.credits, errors.score]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={disabled || !canAdd}
          onClick={() =>
            onChange({ ...draft, rows: [...draft.rows, emptyCourseRow()] })
          }
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="size-3.5" />
          Thêm môn
        </Button>
        <span className="text-xs text-muted-foreground">
          {draft.rows.length}/{maxRows} môn
        </span>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
