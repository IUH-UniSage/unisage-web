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
    <div className="space-y-2">
      <div className="relative w-full max-w-40">
        <Input
          aria-invalid={Boolean(error) || undefined}
          aria-label={question.prompt}
          className="h-10 w-full rounded-lg pr-10 text-sm font-medium"
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
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
            {spec.unit}
          </span>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
