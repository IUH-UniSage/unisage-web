import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Question } from "@/features/chat/schemas/clarification-schemas"
import {
  NUMBER_LIST_MAX_ITEMS,
  type NumberListDraft,
  validateDecimal,
} from "@/features/chat/utils/clarification-answers"

type QuestionNumberListProps = {
  disabled?: boolean
  draft: NumberListDraft
  error: string | null
  onChange: (draft: NumberListDraft) => void
  question: Question
}

export function QuestionNumberList({
  disabled = false,
  draft,
  error,
  onChange,
  question,
}: QuestionNumberListProps) {
  const spec = question.number
  const maxItems = question.max_items ?? NUMBER_LIST_MAX_ITEMS
  const canAdd = draft.values.length < maxItems

  const setValue = (index: number, value: string) =>
    onChange({
      ...draft,
      values: draft.values.map((item, at) => (at === index ? value : item)),
    })

  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap items-center gap-2">
        {draft.values.map((value, index) => {
          const itemError =
            spec && value.trim() ? validateDecimal(value, spec) : null
          return (
            // Values have no identity of their own; the position is the key.
            <li className="group relative" key={index}>
              <Input
                aria-invalid={Boolean(itemError) || undefined}
                aria-label={`${question.tab_label} ${index + 1}`}
                className="h-10 w-20 rounded-lg text-center text-sm font-medium"
                disabled={disabled}
                inputMode="decimal"
                onChange={(event) => setValue(index, event.target.value)}
                placeholder={`${index + 1}`}
                title={itemError ?? undefined}
                type="text"
                value={value}
              />
              {draft.values.length > 1 ? (
                <button
                  aria-label={`Xoá giá trị ${index + 1}`}
                  className="absolute -top-1.5 -right-1.5 hidden size-4.5 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground group-focus-within:flex group-hover:flex hover:text-destructive"
                  disabled={disabled}
                  onClick={() =>
                    onChange({
                      ...draft,
                      values: draft.values.filter((_, at) => at !== index),
                    })
                  }
                  type="button"
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </li>
          )
        })}
        {canAdd ? (
          <li>
            <Button
              aria-label="Thêm cột"
              className="size-10 rounded-lg text-muted-foreground"
              disabled={disabled}
              onClick={() =>
                onChange({ ...draft, values: [...draft.values, ""] })
              }
              size="icon"
              type="button"
              variant="ghost"
            >
              <Plus className="size-4" />
            </Button>
          </li>
        ) : null}
      </ul>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
