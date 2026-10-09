import { Textarea } from "@/components/ui/textarea"
import type { Question } from "@/features/chat/schemas/clarification-schemas"
import {
  TEXT_MAX_LENGTH,
  type TextDraft,
} from "@/features/chat/utils/clarification-answers"

type QuestionTextProps = {
  disabled?: boolean
  draft: TextDraft
  error: string | null
  onChange: (draft: TextDraft) => void
  question: Question
}

export function QuestionText({
  disabled = false,
  draft,
  error,
  onChange,
  question,
}: QuestionTextProps) {
  const maxLength = question.max_length ?? TEXT_MAX_LENGTH

  return (
    <div className="space-y-1.5">
      <Textarea
        aria-invalid={Boolean(error) || undefined}
        aria-label={question.prompt}
        className="max-h-24 min-h-10 resize-none"
        disabled={disabled}
        maxLength={maxLength}
        onChange={(event) => onChange({ ...draft, value: event.target.value })}
        rows={2}
        value={draft.value}
      />
      <div className="flex justify-between gap-2 text-xs">
        <span className="text-destructive">{error}</span>
        <span className="text-muted-foreground">
          {draft.value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}
