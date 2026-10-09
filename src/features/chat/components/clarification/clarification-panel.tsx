import { Check, ChevronDown, X } from "lucide-react"
import { useEffect, useEffectEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionChoice } from "@/features/chat/components/clarification/question-choice"
import { QuestionCourseTable } from "@/features/chat/components/clarification/question-course-table"
import { QuestionNumber } from "@/features/chat/components/clarification/question-number"
import { QuestionNumberList } from "@/features/chat/components/clarification/question-number-list"
import { QuestionNumberOrList } from "@/features/chat/components/clarification/question-number-or-list"
import { QuestionText } from "@/features/chat/components/clarification/question-text"
import type {
  ClarificationPanel as ClarificationPanelData,
  Question,
} from "@/features/chat/schemas/clarification-schemas"
import {
  buildSubmission,
  emptyQuestionDraft,
  hasDraftContent,
  initialPanelDraft,
  type PanelDraft,
  type QuestionDraft,
  type QuestionResult,
  validatePanel,
} from "@/features/chat/utils/clarification-answers"
import {
  readClarificationDraft,
  writeClarificationDraft,
} from "@/features/chat/utils/clarification-draft"
import { cn } from "@/lib/utils"

export type ClarificationSubmitPayload = NonNullable<
  ReturnType<typeof buildSubmission>
>

type ClarificationPanelProps = {
  // True while a submit/cancel request is in flight.
  busy?: boolean
  onCancel: () => void
  onSubmit: (payload: ClarificationSubmitPayload) => void
  panel: ClarificationPanelData
  // 4010 errors from the server, by question id.
  serverErrors: Record<string, string>
}

/**
 * The docked question panel above the composer (one tab per question). Its
 * state is only the draft; whether it is shown at all is derived from the
 * messages by the caller (deriveOpenPanel). Remount it per `panel_id`.
 */
export function ClarificationPanel({
  busy = false,
  onCancel,
  onSubmit,
  panel,
  serverErrors,
}: ClarificationPanelProps) {
  const [draft, setDraft] = useState<PanelDraft>(() =>
    initialPanelDraft(panel, readClarificationDraft(panel.panel_id))
  )
  const [activeTab, setActiveTab] = useState(panel.questions[0].id)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  // A server error stays on its tab until that answer is edited.
  const [editedSinceError, setEditedSinceError] = useState<Set<string>>(
    () => new Set()
  )

  useEffect(() => {
    writeClarificationDraft(panel.panel_id, draft)
  }, [draft, panel.panel_id])

  const results = validatePanel(panel, draft)
  const remaining = panel.questions.filter(
    (question) => results[question.id].state !== "valid"
  ).length

  const serverErrorOf = (questionId: string): string | null =>
    editedSinceError.has(questionId) ? null : (serverErrors[questionId] ?? null)

  const updateDraft = (questionId: string, next: QuestionDraft) => {
    setDraft((current) => ({ ...current, [questionId]: next }))
    if (serverErrors[questionId]) {
      setEditedSinceError((current) => new Set(current).add(questionId))
    }
  }

  const goToNextUnanswered = (fromId: string, answeredId?: string) => {
    const order = panel.questions.map((question) => question.id)
    const start = order.indexOf(fromId)
    const next = [...order.slice(start + 1), ...order.slice(0, start)].find(
      (id) => id !== answeredId && results[id].state !== "valid"
    )
    if (next) setActiveTab(next)
  }

  const requestCancel = () => {
    if (busy) return
    if (hasDraftContent(draft)) setIsConfirmingCancel(true)
    else onCancel()
  }

  const submit = () => {
    const payload = buildSubmission(panel, draft)
    if (payload && !busy) onSubmit(payload)
  }

  // Esc anywhere on the page asks to cancel, unless another dialog or
  // popover is open (Esc belongs to that one).
  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return
    if (isConfirmingCancel) return
    if (
      document.querySelector(
        '[role="dialog"], [data-radix-popper-content-wrapper]'
      )
    ) {
      return
    }
    event.preventDefault()
    requestCancel()
  })

  useEffect(() => {
    window.addEventListener("keydown", onEscape)
    return () => window.removeEventListener("keydown", onEscape)
  }, [])

  return (
    <section aria-label="Câu hỏi bổ sung" className="mx-auto w-full max-w-3xl">
      <div className="flex max-h-[60vh] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
        <Tabs
          className="min-h-0 gap-0"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <div className="flex items-center gap-1 border-b border-border/60 py-1 pr-1.5 pl-2">
            <TabsList
              aria-label="Các câu hỏi"
              className="h-10 min-w-0 flex-1 justify-start overflow-x-auto"
              variant="line"
            >
              {panel.questions.map((question) => (
                <QuestionTab
                  hasServerError={Boolean(serverErrorOf(question.id))}
                  key={question.id}
                  onActivate={() => setIsCollapsed(false)}
                  question={question}
                  result={results[question.id]}
                />
              ))}
            </TabsList>
            <Button
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? "Mở rộng câu hỏi" : "Thu gọn câu hỏi"}
              className="size-8 shrink-0 text-muted-foreground"
              onClick={() => setIsCollapsed((current) => !current)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
            <Button
              aria-label="Huỷ câu hỏi"
              className="size-8 shrink-0 text-muted-foreground"
              disabled={busy}
              onClick={requestCancel}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>
          {isCollapsed ? null : (
            <div className="min-h-0 overflow-y-auto px-3 py-3 sm:px-4">
              {panel.questions.map((question) => {
                const result = results[question.id]
                const localError =
                  result.state === "invalid" ? result.message : null
                return (
                  <TabsContent
                    className="space-y-3"
                    key={question.id}
                    value={question.id}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {question.prompt}
                    </p>
                    <QuestionInput
                      disabled={busy}
                      draft={draft[question.id] ?? emptyQuestionDraft(question)}
                      error={serverErrorOf(question.id) ?? localError}
                      onChange={(next) => updateDraft(question.id, next)}
                      onCommit={(answered) =>
                        goToNextUnanswered(
                          question.id,
                          answered ? question.id : undefined
                        )
                      }
                      question={question}
                    />
                  </TabsContent>
                )
              })}
            </div>
          )}
        </Tabs>
        <div className="flex items-center justify-end gap-3 border-t border-border/60 px-3 py-2 sm:px-4">
          {remaining > 0 ? (
            <span className="text-xs text-muted-foreground">
              Còn {remaining} câu
            </span>
          ) : null}
          <Button
            disabled={busy || remaining > 0}
            onClick={submit}
            size="sm"
            type="button"
          >
            Gửi câu trả lời
          </Button>
        </div>
      </div>
      <Dialog onOpenChange={setIsConfirmingCancel} open={isConfirmingCancel}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Huỷ câu hỏi?</DialogTitle>
            <DialogDescription>
              Các câu trả lời bạn đã nhập sẽ không được gửi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setIsConfirmingCancel(false)}
              type="button"
              variant="outline"
            >
              Tiếp tục trả lời
            </Button>
            <Button
              onClick={() => {
                setIsConfirmingCancel(false)
                onCancel()
              }}
              type="button"
              variant="destructive"
            >
              Huỷ câu hỏi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function QuestionTab({
  hasServerError,
  onActivate,
  question,
  result,
}: {
  hasServerError: boolean
  onActivate: () => void
  question: Question
  result: QuestionResult
}) {
  const isAnswered = result.state === "valid" && !hasServerError
  return (
    <TabsTrigger
      className="flex-none px-2.5"
      onClick={onActivate}
      value={question.id}
    >
      {isAnswered ? (
        <Check aria-hidden="true" className="size-3.5 text-success" />
      ) : null}
      {question.tab_label}
      {hasServerError ? (
        <span
          aria-label="Có lỗi"
          className="size-1.5 rounded-full bg-destructive"
          role="img"
        />
      ) : null}
      {isAnswered ? <span className="sr-only">(đã trả lời)</span> : null}
    </TabsTrigger>
  )
}

function QuestionInput({
  disabled,
  draft,
  error,
  onChange,
  onCommit,
  question,
}: {
  disabled: boolean
  draft: QuestionDraft
  error: string | null
  onChange: (draft: QuestionDraft) => void
  // `answered`: the commit itself answered this question (a just-picked
  // option), even though the draft state has not re-rendered yet.
  onCommit: (answered: boolean) => void
  question: Question
}) {
  switch (draft.kind) {
    case "choice":
      return (
        <QuestionChoice
          disabled={disabled}
          draft={draft}
          error={error}
          onChange={onChange}
          onCommit={() =>
            onCommit(!draft.other || Boolean(draft.otherText.trim()))
          }
          question={question}
        />
      )
    case "number":
      return (
        <QuestionNumber
          disabled={disabled}
          draft={draft}
          error={error}
          onChange={onChange}
          onCommit={() => onCommit(false)}
          question={question}
        />
      )
    case "number_list":
      return (
        <QuestionNumberList
          disabled={disabled}
          draft={draft}
          error={error}
          onChange={onChange}
          question={question}
        />
      )
    case "number_or_list":
      return (
        <QuestionNumberOrList
          disabled={disabled}
          draft={draft}
          error={error}
          onChange={onChange}
          onCommit={() => onCommit(false)}
          question={question}
        />
      )
    case "text":
      return (
        <QuestionText
          disabled={disabled}
          draft={draft}
          error={error}
          onChange={onChange}
          question={question}
        />
      )
    case "course_table":
      return (
        <QuestionCourseTable
          disabled={disabled}
          draft={draft}
          error={error}
          onChange={onChange}
          question={question}
        />
      )
  }
}
