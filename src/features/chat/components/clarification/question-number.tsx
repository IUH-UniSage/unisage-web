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
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Input
          aria-invalid={Boolean(error) || undefined}
          aria-label={question.prompt}
          className="h-9 w-full max-w-40"
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
          <span className="text-sm text-muted-foreground">{spec.unit}</span>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : spec ? (
        <p className="text-xs text-muted-foreground">
          Từ {spec.min} đến {spec.max}, bước {spec.step}
        </p>
      ) : null}
    </div>
  )
}
