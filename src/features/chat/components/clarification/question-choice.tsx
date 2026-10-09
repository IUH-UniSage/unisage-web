import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Question } from "@/features/chat/schemas/clarification-schemas"
import {
  type ChoiceDraft,
  OTHER_TEXT_MAX_LENGTH,
} from "@/features/chat/utils/clarification-answers"
import { cn } from "@/lib/utils"

const OTHER_VALUE = "__other__"

type QuestionChoiceProps = {
  disabled?: boolean
  draft: ChoiceDraft
  error: string | null
  onChange: (draft: ChoiceDraft) => void
  // Enter on an option: keep it and move on to the next unanswered tab.
  onCommit: () => void
  question: Question
}

export function QuestionChoice({
  disabled = false,
  draft,
  error,
  onChange,
  onCommit,
  question,
}: QuestionChoiceProps) {
  const value = draft.other ? OTHER_VALUE : (draft.optionId ?? "")
  const otherInputId = `${question.id}-other`

  return (
    <div className="space-y-2">
      <RadioGroup
        aria-label={question.prompt}
        className="gap-1"
        disabled={disabled}
        onValueChange={(next) =>
          onChange(
            next === OTHER_VALUE
              ? { ...draft, optionId: null, other: true }
              : { ...draft, optionId: next, other: false }
          )
        }
        value={value}
      >
        {question.options.map((option) => {
          const itemId = `${question.id}-${option.id}`
          return (
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60",
                value === option.id && "bg-muted/60"
              )}
              htmlFor={itemId}
              key={option.id}
            >
              <RadioGroupItem
                className="mt-0.5"
                id={itemId}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return
                  event.preventDefault()
                  onChange({ ...draft, optionId: option.id, other: false })
                  onCommit()
                }}
                value={option.id}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  {option.label}
                  {option.recommended ? (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      (Đề xuất)
                    </span>
                  ) : null}
                </span>
                {option.description ? (
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          )
        })}
        {question.allow_other ? (
          <div
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60",
              draft.other && "bg-muted/60"
            )}
          >
            <RadioGroupItem
              aria-label="Khác"
              id={`${question.id}-other-radio`}
              value={OTHER_VALUE}
            />
            <label
              className="cursor-pointer text-sm font-medium text-foreground"
              htmlFor={`${question.id}-other-radio`}
            >
              Khác
            </label>
            <Input
              aria-invalid={Boolean(error) || undefined}
              aria-label="Nội dung khác"
              className="h-8 min-w-0 flex-1 basis-40"
              disabled={disabled}
              id={otherInputId}
              maxLength={OTHER_TEXT_MAX_LENGTH}
              onChange={(event) =>
                onChange({
                  ...draft,
                  optionId: null,
                  other: true,
                  otherText: event.target.value,
                })
              }
              onFocus={() => {
                if (!draft.other)
                  onChange({ ...draft, optionId: null, other: true })
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return
                event.preventDefault()
                onCommit()
              }}
              placeholder="Nhập câu trả lời của bạn"
              value={draft.otherText}
            />
          </div>
        ) : null}
      </RadioGroup>
      {error ? <p className="px-3 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
