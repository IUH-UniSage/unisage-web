import { Input } from "@/components/ui/input"
import type { Question } from "@/features/chat/schemas/clarification-schemas"
import type { NumberDraft } from "@/features/chat/utils/clarification-answers"

type QuestionNumberProps = {
  disabled?: boolean
  draft: NumberDraft
  error: string | null
  onChange: (draft: NumberDraft) => void
  onCommit: () => void
  question: Question
}

export function QuestionNumber({
  disabled = false,
  draft,
  error,
  onChange,
  onCommit,
  question,
}: QuestionNumberProps) {
  const spec = question.number

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex max-w-xs min-w-0 flex-1 items-center">
          <Input
            aria-invalid={Boolean(error) || undefined}
            aria-label={question.prompt}
            className="h-10 w-full rounded-lg pr-12 text-sm font-medium transition-all focus-visible:ring-1"
            disabled={disabled}
            inputMode="decimal"
            onChange={(event) =>
              onChange({ ...draft, value: event.target.value })
            }
            onKeyDown={(event) => {
              if (event.key !== "Enter") return
              event.preventDefault()
              onCommit()
            }}
            placeholder={spec ? `${spec.min} – ${spec.max}` : undefined}
            type="text"
            value={draft.value}
          />
          {spec?.unit ? (
            <span className="pointer-events-none absolute right-3 text-xs font-semibold text-muted-foreground">
              {spec.unit}
            </span>
          ) : null}
        </div>
        {spec ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-background/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs">
            Từ {spec.min} đến {spec.max}, bước {spec.step}
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
