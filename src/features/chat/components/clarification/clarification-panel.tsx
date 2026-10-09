import { Check, ChevronDown, X } from "lucide-react"
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react"

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

  // The latest draft, readable in the same event that changed it (Enter on an
  // option both picks it and moves on, before React re-renders).
  const draftRef = useRef(draft)
  const contentRef = useRef<HTMLDivElement>(null)
  // Bumped to focus the first input of `tab` once that tab has rendered.
  const [focusRequest, setFocusRequest] = useState<{ n: number; tab: string }>()

  useEffect(() => {
    writeClarificationDraft(panel.panel_id, draft)
  }, [draft, panel.panel_id])

  useEffect(() => {
    if (!focusRequest) return
    // Radix mounts the new tab's content a beat after it becomes active.
    const frame = requestAnimationFrame(() => {
      const content = contentRef.current?.querySelector<HTMLElement>(
        `[data-question-id="${focusRequest.tab}"]`
      )
      const target = content?.querySelector<HTMLElement>(
        '[role="radio"][data-state="checked"], input:not([disabled]), textarea:not([disabled]), [role="radio"]'
      )
      target?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [focusRequest])

  const results = validatePanel(panel, draft)
  const remaining = panel.questions.filter(
    (question) => results[question.id].state !== "valid"
  ).length

  const serverErrorOf = (questionId: string): string | null =>
    editedSinceError.has(questionId) ? null : (serverErrors[questionId] ?? null)

  const updateDraft = (questionId: string, next: QuestionDraft) => {
    draftRef.current = { ...draftRef.current, [questionId]: next }
    setDraft((current) => ({ ...current, [questionId]: next }))
    if (serverErrors[questionId]) {
      setEditedSinceError((current) => new Set(current).add(questionId))
    }
  }

  const goToTab = (tab: string) => {
    setActiveTab(tab)
    setIsCollapsed(false)
    setFocusRequest((current) => ({ n: (current?.n ?? 0) + 1, tab }))
  }

  // Enter: next tab; on the last tab, submit - or, if something is still
  // missing or wrong, go back to the first such tab.
  const advance = (fromId: string) => {
    const order = panel.questions.map((question) => question.id)
    const index = order.indexOf(fromId)
    if (index < order.length - 1) {
      goToTab(order[index + 1])
      return
    }
    const latest = validatePanel(panel, draftRef.current)
    const unanswered = order.find((id) => latest[id].state !== "valid")
    if (unanswered) goToTab(unanswered)
    else submit()
  }

  const onContentKeyDown = (
    questionId: string,
    event: ReactKeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key !== "Enter" || event.shiftKey) return
    // Vietnamese IME: Enter that confirms a composed word is not "next".
    if (event.nativeEvent.isComposing) return
    const target = event.target as HTMLElement
    // Radix radios swallow Enter (preventDefault) - for us it means "next".
    const isRadio = target.getAttribute("role") === "radio"
    if (event.defaultPrevented && !isRadio) return
    // A real button (+, ×, switch link) keeps its own Enter.
    if (target.tagName === "BUTTON" && !isRadio) return
    event.preventDefault()
    advance(questionId)
  }

  const requestCancel = () => {
    if (busy) return
    if (hasDraftContent(draft)) setIsConfirmingCancel(true)
    else onCancel()
  }

  const submit = () => {
    const payload = buildSubmission(panel, draftRef.current)
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
      <div className="flex max-h-[65vh] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-md transition-all">
        <Tabs
          className="min-h-0 gap-0"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <div className="flex items-center gap-1 border-b border-border/60 bg-muted/20 py-1 pr-1.5 pl-2">
            <TabsList
              aria-label="Các câu hỏi"
              className="h-10 min-w-0 flex-1 [scrollbar-width:none] justify-start overflow-x-auto [&::-webkit-scrollbar]:hidden"
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
              className="size-8 shrink-0 text-muted-foreground hover:bg-muted"
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
              className="size-8 shrink-0 text-muted-foreground hover:bg-muted"
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
            <div
              className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
              ref={contentRef}
            >
              {panel.questions.map((question) => {
                const result = results[question.id]
                const localError =
                  result.state === "invalid" ? result.message : null
                return (
                  <TabsContent
                    className="space-y-3.5 focus-visible:outline-hidden"
                    data-question-id={question.id}
                    key={question.id}
                    onKeyDown={(event) => onContentKeyDown(question.id, event)}
                    value={question.id}
                  >
                    <p className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                      {question.prompt}
                    </p>
                    <QuestionInput
                      disabled={busy}
                      draft={draft[question.id] ?? emptyQuestionDraft(question)}
                      error={serverErrorOf(question.id) ?? localError}
                      onChange={(next) => updateDraft(question.id, next)}
                      question={question}
                    />
                  </TabsContent>
                )
              })}
            </div>
          )}
        </Tabs>
        <div className="flex items-center justify-end gap-3 border-t border-border/60 bg-muted/10 px-4 py-2.5 sm:px-5">
          {remaining > 0 ? (
            <span className="text-xs font-medium text-muted-foreground">
              Còn {remaining} câu
            </span>
          ) : null}
          <Button
            className="px-4 font-medium shadow-2xs transition-all"
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
  question,
}: {
  disabled: boolean
  draft: QuestionDraft
  error: string | null
  onChange: (draft: QuestionDraft) => void
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
