import axios from "axios"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { type ReactNode, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCalculationFeedbackMutation } from "@/features/chat/queries/use-mutations"
import {
  CALCULATION_FEEDBACK_NOTE_MAX_LENGTH,
  type CalculationFeedbackEntry,
  type CalculationFeedbackRequest,
  type CalculationItem,
  type CalculationWrongReason,
} from "@/features/chat/schemas/calculation-schemas"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/utils/error-handler"

const WRONG_REASONS: { label: string; value: CalculationWrongReason }[] = [
  { label: "Sai công thức", value: "WRONG_FORMULA" },
  { label: "Sai kết quả", value: "WRONG_RESULT" },
  { label: "Sai nguồn/quy chế", value: "WRONG_SOURCE" },
  { label: "Thiếu thông tin", value: "MISSING_INFO" },
  { label: "Khác", value: "OTHER" },
]

const LOCKED_HINT =
  "Phản hồi này đã được bộ phận hỗ trợ xử lý xong nên không đổi được nữa."
const CONFLICT_STATUS = 409

type CalculationFeedbackProps = {
  conversationId: string
  current: CalculationFeedbackEntry | undefined
  // While the reply streams, its ids are not the server's yet.
  disabled?: boolean
  item: CalculationItem
  messageId: string
}

/** Đúng / Sai under one "Kết quả tham khảo theo quy chế" result. */
export function CalculationFeedback({
  conversationId,
  current,
  disabled = false,
  item,
  messageId,
}: CalculationFeedbackProps) {
  const mutation = useCalculationFeedbackMutation(conversationId, messageId)
  const [isLocked, setIsLocked] = useState(false)
  const [isWrongOpen, setIsWrongOpen] = useState(false)
  const isDisabled = disabled || isLocked || mutation.isPending

  const send = (input: CalculationFeedbackRequest, onSent?: () => void) => {
    mutation.mutate(input, {
      onError: (error) => {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === CONFLICT_STATUS
        ) {
          setIsLocked(true)
          setIsWrongOpen(false)
          toast.error(LOCKED_HINT)
          return
        }
        toast.error(getErrorMessage(error))
      },
      onSuccess: (result) => {
        onSent?.()
        toast.success(
          result.ticketCreated
            ? "Đã gửi cho bộ phận hỗ trợ"
            : "Cảm ơn bạn đã phản hồi"
        )
      },
    })
  }

  return (
    <div
      aria-label={`Phản hồi kết quả: ${item.result_summary}`}
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-border/60 px-3 py-2 text-sm"
      role="group"
    >
      <span className="min-w-0 flex-1 basis-48 text-muted-foreground">
        {item.result_summary}
      </span>
      <LockedHint isLocked={isLocked}>
        <div className="flex items-center gap-1">
          <Button
            aria-pressed={current?.verdict === "CORRECT"}
            className={cn(
              "h-8 gap-1.5 text-muted-foreground",
              current?.verdict === "CORRECT" && "bg-success/10 text-success"
            )}
            disabled={isDisabled}
            onClick={() => {
              if (current?.verdict === "CORRECT") return
              send({
                itemId: item.item_id,
                note: null,
                reason: null,
                verdict: "CORRECT",
              })
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <ThumbsUp className="size-4" />
            Đúng
          </Button>
          <Popover onOpenChange={setIsWrongOpen} open={isWrongOpen}>
            <PopoverTrigger asChild>
              <Button
                aria-pressed={current?.verdict === "WRONG"}
                className={cn(
                  "h-8 gap-1.5 text-muted-foreground",
                  current?.verdict === "WRONG" &&
                    "bg-destructive/10 text-destructive"
                )}
                disabled={isDisabled}
                size="sm"
                type="button"
                variant="ghost"
              >
                <ThumbsDown className="size-4" />
                Sai
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 max-w-[calc(100vw-2rem)]"
            >
              <WrongReasonForm
                initialReason={current?.reason ?? null}
                isPending={mutation.isPending}
                onSubmit={(reason, note) =>
                  send(
                    {
                      itemId: item.item_id,
                      note,
                      reason,
                      verdict: "WRONG",
                    },
                    () => setIsWrongOpen(false)
                  )
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </LockedHint>
    </div>
  )
}

function LockedHint({
  children,
  isLocked,
}: {
  children: ReactNode
  isLocked: boolean
}) {
  if (!isLocked) return children
  // Disabled buttons get no pointer events; the wrapper carries the tooltip.
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span aria-label={LOCKED_HINT} tabIndex={0}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{LOCKED_HINT}</TooltipContent>
    </Tooltip>
  )
}

export function WrongReasonForm({
  initialReason,
  isPending,
  onSubmit,
}: {
  initialReason: CalculationWrongReason | null
  isPending: boolean
  onSubmit: (reason: CalculationWrongReason, note: string | null) => void
}) {
  const [reason, setReason] = useState<CalculationWrongReason | null>(
    initialReason
  )
  const [note, setNote] = useState("")
  const trimmedNote = note.trim()
  const needsNote = reason === "OTHER" && !trimmedNote
  const canSubmit = reason !== null && !needsNote && !isPending

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (reason && canSubmit) onSubmit(reason, trimmedNote || null)
      }}
    >
      <p className="text-sm font-medium">Kết quả sai ở đâu?</p>
      <RadioGroup
        aria-label="Lý do"
        className="gap-2"
        onValueChange={(value) => setReason(value as CalculationWrongReason)}
        value={reason ?? ""}
      >
        {WRONG_REASONS.map((option) => (
          <div className="flex items-center gap-2" key={option.value}>
            <RadioGroupItem
              id={`wrong-reason-${option.value}`}
              value={option.value}
            />
            <Label
              className="cursor-pointer font-normal"
              htmlFor={`wrong-reason-${option.value}`}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <div className="space-y-1">
        <Label className="font-normal" htmlFor="wrong-reason-note">
          Ghi chú{reason === "OTHER" ? " (bắt buộc)" : ""}
        </Label>
        <Textarea
          aria-invalid={needsNote || undefined}
          className="min-h-16 resize-none"
          id="wrong-reason-note"
          maxLength={CALCULATION_FEEDBACK_NOTE_MAX_LENGTH}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          value={note}
        />
        <p className="text-right text-xs text-muted-foreground">
          {note.length}/{CALCULATION_FEEDBACK_NOTE_MAX_LENGTH}
        </p>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Câu hỏi và các số bạn đã nhập sẽ được gửi cho bộ phận hỗ trợ để kiểm
        tra.
      </p>
      <div className="flex justify-end">
        <Button disabled={!canSubmit} size="sm" type="submit">
          Gửi
        </Button>
      </div>
    </form>
  )
}
