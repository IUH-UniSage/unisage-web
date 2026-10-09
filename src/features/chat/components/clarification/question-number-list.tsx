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
      <ul className="flex flex-wrap gap-2">
        {draft.values.map((value, index) => {
          const itemError =
            spec && value.trim() ? validateDecimal(value, spec) : null
          return (
            // Values have no identity of their own; the position is the key.
            <li className="flex items-center gap-1" key={index}>
              <Input
                aria-invalid={Boolean(itemError) || undefined}
                aria-label={`${question.tab_label} ${index + 1}`}
                className="h-9 w-24"
                disabled={disabled}
                inputMode="decimal"
                onChange={(event) => setValue(index, event.target.value)}
                title={itemError ?? undefined}
                type="text"
                value={value}
              />
              {draft.values.length > 1 ? (
                <Button
                  aria-label={`Xoá giá trị ${index + 1}`}
                  className="size-7 text-muted-foreground"
                  disabled={disabled}
                  onClick={() =>
                    onChange({
                      ...draft,
                      values: draft.values.filter((_, at) => at !== index),
                    })
                  }
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-3.5" />
                </Button>
              ) : null}
            </li>
          )
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={disabled || !canAdd}
          onClick={() => onChange({ ...draft, values: [...draft.values, ""] })}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="size-3.5" />
          Thêm
        </Button>
        <span className="text-xs text-muted-foreground">
          {draft.values.length}/{maxItems}
          {spec?.unit ? ` · ${spec.unit}` : ""}
        </span>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
