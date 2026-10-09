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
  question: Question
}

export function QuestionChoice({
  disabled = false,
  draft,
  error,
  onChange,
  question,
}: QuestionChoiceProps) {
  const value = draft.other ? OTHER_VALUE : (draft.optionId ?? "")
  const otherInputId = `${question.id}-other`

  return (
    <div className="space-y-2.5">
      <RadioGroup
        aria-label={question.prompt}
        className="gap-2.5"
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
          const isSelected = value === option.id
          return (
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/50 p-3.5 transition-all hover:border-primary/40 hover:bg-muted/40 sm:p-4",
                isSelected &&
                  "border-primary/60 bg-primary/5 shadow-2xs ring-1 ring-primary/20"
              )}
              htmlFor={itemId}
              key={option.id}
            >
              <RadioGroupItem
                className="mt-0.5"
                id={itemId}
                onKeyDown={(event) => {
                  // Enter picks the focused option; the panel then moves on.
                  if (event.key !== "Enter") return
                  onChange({ ...draft, optionId: option.id, other: false })
                }}
                value={option.id}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {option.label}
                  {option.recommended ? (
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/20 ring-inset">
                      (Đề xuất)
                    </span>
                  ) : null}
                </span>
                {option.description ? (
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
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
              "flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3.5 transition-all hover:border-primary/40 hover:bg-muted/40 sm:p-4",
              draft.other &&
                "border-primary/60 bg-primary/5 shadow-2xs ring-1 ring-primary/20"
            )}
          >
            <RadioGroupItem
              aria-label="Khác"
              id={`${question.id}-other-radio`}
              value={OTHER_VALUE}
            />
            <label
              className="cursor-pointer text-sm font-semibold text-foreground"
              htmlFor={`${question.id}-other-radio`}
            >
              Khác
            </label>
            <Input
              aria-invalid={Boolean(error) || undefined}
              aria-label="Nội dung khác"
              className="h-9 min-w-0 flex-1 basis-40 rounded-lg text-sm transition-all focus-visible:ring-1"
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
              placeholder="Nhập câu trả lời của bạn"
              value={draft.otherText}
            />
          </div>
        ) : null}
      </RadioGroup>
      {error ? (
        <p className="px-1 text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
