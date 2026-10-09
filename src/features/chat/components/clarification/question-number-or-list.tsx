import { QuestionNumber } from "@/features/chat/components/clarification/question-number"
import { QuestionNumberList } from "@/features/chat/components/clarification/question-number-list"
import type { Question } from "@/features/chat/schemas/clarification-schemas"
import type { NumberOrListDraft } from "@/features/chat/utils/clarification-answers"

type QuestionNumberOrListProps = {
  disabled?: boolean
  draft: NumberOrListDraft
  error: string | null
  onChange: (draft: NumberOrListDraft) => void
  question: Question
}

/**
 * `number_or_list`: every column by default (sends `numbers`), or - through
 * the link under it - the already-averaged value (sends `number`). Both
 * inputs keep their text while switching; only the active mode is validated
 * and sent.
 */
export function QuestionNumberOrList({
  disabled = false,
  draft,
  error,
  onChange,
  question,
}: QuestionNumberOrListProps) {
  const isSingle = draft.mode === "single"

  return (
    <div className="space-y-2">
      {isSingle ? (
        <QuestionNumber
          disabled={disabled}
          draft={{ kind: "number", value: draft.value }}
          error={error}
          onChange={(next) => onChange({ ...draft, value: next.value })}
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
      <button
        className="cursor-pointer text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:cursor-not-allowed"
        disabled={disabled}
        onClick={() =>
          onChange({ ...draft, mode: isSingle ? "list" : "single" })
        }
        type="button"
      >
        {isSingle
          ? "Nhập từng cột thay vì điểm trung bình"
          : "Đã có điểm trung bình? Nhập trực tiếp"}
      </button>
    </div>
  )
}
