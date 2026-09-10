import { useState } from "react"

import { SearchableSelect } from "@/components/shared/searchable-select"
import { Button } from "@/components/ui/button"
import {
  formatAskUserFormAnswer,
  resolveAnsweredSelections,
  type AskUserForm,
} from "@/features/chat/utils/ask-user-form"
import { cn } from "@/lib/utils"

// Chips read faster than a dropdown for a handful of options; beyond that a
// searchable dropdown keeps the form usable as an option list grows (e.g.
// "Ngành học" - a handful of placeholder majors today, dozens of real ones
// later). Matches the "≤3 nên dùng chip" guidance from the design reference
// this was built against. Free text is never an option here by design - a
// field the agent expects free text for (options: null) has nothing to
// render and is dropped before this component ever sees it.
const CHIP_THRESHOLD = 3

type AskUserFormCardProps = {
  /**
   * The student's reply that followed this form, or null while it's still the
   * open question. A selection only ever lives in this component's state, so
   * without this a form would come back fully blank and clickable after a
   * reload - re-answering a question the agent already has an answer for.
   */
  answerText: string | null
  disabled?: boolean
  form: AskUserForm
  onSubmit: (message: string) => void
}

export function AskUserFormCard({
  answerText,
  disabled,
  form,
  onSubmit,
}: AskUserFormCardProps) {
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    answerText ? resolveAnsweredSelections(form, answerText) : {}
  )
  const [submitted, setSubmitted] = useState(false)

  // A field with no options came from the agent's `options: null` (it wanted
  // free text) - nothing to render for it, so it's left out of the form
  // entirely rather than shown as an empty control.
  const renderableFields = form.fields.filter(
    (field) => field.options.length > 0
  )
  if (renderableFields.length === 0) return null

  // Matches the reference design: a single-field form submits the moment a
  // value is picked (no separate confirmation step needed), while a
  // multi-field form needs an explicit "Gửi" click since more than one
  // answer is being committed at once.
  const isSingleField = renderableFields.length === 1
  const hasAnyAnswer = renderableFields.some((field) => selections[field.field])
  // A form the student has already replied to is settled for good, whether or
  // not the reply was parseable back into selections - if they answered in
  // their own words instead of using the controls, the agent has moved on and
  // re-submitting this form would only re-answer a stale question.
  const isAnswered = answerText !== null
  const isLocked = disabled || submitted || isAnswered

  const submitSelections = (current: Record<string, string>) => {
    setSubmitted(true)
    onSubmit(formatAskUserFormAnswer(form, current))
  }

  const setSelected = (fieldKey: string, optionId: string) => {
    if (isLocked) return
    const next = { ...selections, [fieldKey]: optionId }
    setSelections(next)
    if (isSingleField) submitSelections(next)
  }

  return (
    <div className="mt-2 space-y-4 rounded-2xl border border-border/60 bg-muted/30 p-4">
      {renderableFields.map((field) => {
        const selectedId = selections[field.field]
        const useChips = field.options.length <= CHIP_THRESHOLD

        return (
          <div className="space-y-2" key={field.field}>
            <p className="text-sm font-medium text-foreground">{field.label}</p>
            {useChips ? (
              <div className="flex flex-wrap gap-2">
                {field.options.map((option) => (
                  <button
                    className={cn(
                      "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                      selectedId === option.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/60 bg-background text-foreground hover:border-primary/50",
                      // An answered form keeps its chosen chip at full
                      // strength and fades only the roads not taken, so it
                      // reads as a recorded answer rather than as the
                      // uniformly greyed-out "still sending" state.
                      isAnswered
                        ? selectedId === option.id
                          ? "cursor-default"
                          : "cursor-default opacity-40"
                        : isLocked && "cursor-not-allowed opacity-60"
                    )}
                    disabled={isLocked}
                    key={option.id}
                    onClick={() => setSelected(field.field, option.id)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <SearchableSelect
                ariaLabel={field.label}
                disabled={isLocked}
                onValueChange={(optionId) => setSelected(field.field, optionId)}
                options={field.options}
                value={selectedId}
              />
            )}
          </div>
        )
      })}

      {isAnswered ? (
        // Without this an answered form the student replied to in their own
        // words would render as nothing but faded chips with no selection -
        // indistinguishable from a broken card.
        <p className="text-xs text-muted-foreground">Đã trả lời</p>
      ) : isSingleField ? null : (
        <Button
          disabled={!hasAnyAnswer || isLocked}
          onClick={() => submitSelections(selections)}
          size="sm"
        >
          Gửi
        </Button>
      )}
    </div>
  )
}
