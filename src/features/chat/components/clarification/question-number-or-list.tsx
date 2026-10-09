import { QuestionNumber } from "@/features/chat/components/clarification/question-number"
import { QuestionNumberList } from "@/features/chat/components/clarification/question-number-list"
import type { Question } from "@/features/chat/schemas/clarification-schemas"
import type {
  NumberOrListDraft,
  NumberOrListMode,
} from "@/features/chat/utils/clarification-answers"
import { cn } from "@/lib/utils"

const MODES: { label: string; value: NumberOrListMode }[] = [
  { label: "Nhập sẵn", value: "single" },
  { label: "Nhập từng cột", value: "list" },
]

type QuestionNumberOrListProps = {
  disabled?: boolean
  draft: NumberOrListDraft
  error: string | null
  onChange: (draft: NumberOrListDraft) => void
  onCommit: () => void
  question: Question
}

/**
 * `number_or_list`: the student either types the already-aggregated value
 * ("Nhập sẵn", sends `number`) or every column ("Nhập từng cột", sends
 * `numbers`). Both inputs keep their text while switching; only the active
 * mode is validated and sent.
 */
export function QuestionNumberOrList({
  disabled = false,
  draft,
  error,
  onChange,
  onCommit,
  question,
}: QuestionNumberOrListProps) {
  return (
    <div className="space-y-3">
      <div
        aria-label="Cách nhập"
        className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
        role="group"
      >
        {MODES.map((mode) => {
          const isActive = draft.mode === mode.value
          return (
            <button
              aria-pressed={isActive}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed",
                isActive
                  ? "bg-background font-medium text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              disabled={disabled}
              key={mode.value}
              onClick={() => onChange({ ...draft, mode: mode.value })}
              type="button"
            >
              {mode.label}
            </button>
          )
        })}
      </div>
      {draft.mode === "single" ? (
        <QuestionNumber
          disabled={disabled}
          draft={{ kind: "number", value: draft.value }}
          error={error}
          onChange={(next) => onChange({ ...draft, value: next.value })}
          onCommit={onCommit}
          question={question}
        />
      ) : (
        <QuestionNumberList
          disabled={disabled}
          draft={{ kind: "number_list", values: draft.values }}
          error={error}
          onChange={(next) => onChange({ ...draft, values: next.values })}
          question={question}
        />
      )}
    </div>
  )
}
