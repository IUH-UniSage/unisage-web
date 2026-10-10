import { ChevronDown } from "lucide-react"
import { type ReactNode, useId, useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  AnsweredItem,
  ChoiceOption,
  ClarificationAnswers,
  ClarificationPanel,
  CourseRow,
  Question,
} from "@/features/chat/schemas/clarification-schemas"
import { cn } from "@/lib/utils"

// Read-only views of a clarification round, laid out like Claude Code's
// answered-questions view (contract chat-sse.md §5 "Cách hiển thị card").

type AnsweredClarificationCardProps = {
  answers: ClarificationAnswers
  // The panel of the ASSISTANT message right before this USER message, when
  // it matches `answers.panel_id` - gives choice questions all their options.
  panel: ClarificationPanel | null
}

/** Replaces the USER bubble of a submit turn. Open by default. */
export function AnsweredClarificationCard({
  answers,
  panel,
}: AnsweredClarificationCardProps) {
  const questions =
    panel && panel.panel_id === answers.panel_id ? panel.questions : []

  return (
    <CollapsibleCard
      defaultOpen
      title={`Đã trả lời · ${answers.items.length} câu hỏi`}
    >
      {answers.items.map((item) => (
        <AnsweredItemView
          item={item}
          key={item.question_id}
          question={questions.find((it) => it.id === item.question_id) ?? null}
        />
      ))}
    </CollapsibleCard>
  )
}

/** Under an ASSISTANT reply whose panel was cancelled. Closed by default. */
export function CancelledClarificationCard({
  panel,
}: {
  panel: ClarificationPanel
}) {
  return (
    <CollapsibleCard title={`Đã huỷ · ${panel.questions.length} câu hỏi`}>
      {panel.questions.map((question) => (
        <div className="space-y-1.5" key={question.id}>
          <p className="text-sm text-foreground">{question.prompt}</p>
          {question.kind === "choice" ? (
            <OptionList options={question.options} selectedId={null} />
          ) : null}
        </div>
      ))}
    </CollapsibleCard>
  )
}

function CollapsibleCard({
  children,
  defaultOpen = false,
  title,
}: {
  children: ReactNode
  defaultOpen?: boolean
  title: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const bodyId = useId()

  return (
    <div className="w-full rounded-2xl border border-border bg-card text-card-foreground">
      <button
        aria-controls={bodyId}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {title}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen ? (
        <div
          className="space-y-4 border-t border-border/60 px-4 py-3"
          id={bodyId}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

function AnsweredItemView({
  item,
  question,
}: {
  item: AnsweredItem
  question: Question | null
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{item.tab_label}</p>
      <p className="text-sm text-foreground">{item.prompt}</p>
      <AnswerValue item={item} question={question} />
    </div>
  )
}

function AnswerValue({
  item,
  question,
}: {
  item: AnsweredItem
  question: Question | null
}) {
  if (item.kind === "course_table") {
    return <CourseRowsTable rows={item.rows ?? []} />
  }

  if (item.kind === "choice" && question?.options.length) {
    // Older payloads without `option_id` are matched by their label.
    const selectedId =
      item.option_id !== undefined
        ? item.option_id
        : (question.options.find((option) => option.label === item.display)
            ?.id ?? null)
    return (
      <OptionList
        options={question.options}
        otherText={selectedId === null ? item.display : null}
        selectedId={selectedId}
      />
    )
  }

  return (
    <p className="text-sm font-medium whitespace-pre-wrap text-foreground">
      {item.display}
    </p>
  )
}

function OptionList({
  options,
  otherText = null,
  selectedId,
}: {
  options: ChoiceOption[]
  otherText?: string | null
  selectedId: string | null
}) {
  return (
    <ul className="space-y-1">
      {options.map((option) => {
        const isSelected = option.id === selectedId
        return (
          <li
            aria-current={isSelected || undefined}
            className={cn(
              "flex items-start gap-2.5",
              !isSelected && "opacity-50"
            )}
            key={option.id}
          >
            <RadioMark selected={isSelected} />
            <span className="min-w-0 text-sm">
              <span
                className={cn("text-foreground", isSelected && "font-medium")}
              >
                {option.label}
              </span>
              {option.recommended ? (
                <span className="ml-1.5 text-muted-foreground">(Đề xuất)</span>
              ) : null}
              {option.description ? (
                <span className="block text-xs text-muted-foreground">
                  {option.description}
                </span>
              ) : null}
            </span>
          </li>
        )
      })}
      {otherText ? (
        <li aria-current className="flex items-start gap-2.5">
          <RadioMark selected />
          <span className="min-w-0 text-sm font-medium break-words text-foreground">
            Khác: {otherText}
          </span>
        </li>
      ) : null}
    </ul>
  )
}

function RadioMark({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
        selected ? "border-primary bg-primary" : "border-input"
      )}
    >
      {selected ? (
        <span className="size-1.5 rounded-full bg-primary-foreground" />
      ) : null}
    </span>
  )
}

function CourseRowsTable({ rows }: { rows: CourseRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên môn</TableHead>
          <TableHead className="text-right">Tín chỉ</TableHead>
          <TableHead className="text-right">Điểm</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={`${row.name ?? ""}-${index}`}>
            <TableCell className="whitespace-normal">
              {row.name ?? <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className="text-right">{row.credits}</TableCell>
            <TableCell className="text-right">{row.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
