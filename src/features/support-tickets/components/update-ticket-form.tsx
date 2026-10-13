import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { useUpdateTicketMutation } from "@/features/support-tickets/queries/use-mutations"
import {
  TICKET_RESOLUTION_MAX_LENGTH,
  TICKET_STATUS_LABELS,
  ticketStatusSchema,
  type TicketDetail,
} from "@/features/support-tickets/schemas/ticket-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

const updateFormSchema = z.object({
  resolution: z
    .string()
    .max(
      TICKET_RESOLUTION_MAX_LENGTH,
      `Phản hồi không được vượt quá ${TICKET_RESOLUTION_MAX_LENGTH} ký tự.`
    ),
  status: ticketStatusSchema,
})

type UpdateFormValues = z.infer<typeof updateFormSchema>

export function UpdateTicketForm({ ticket }: { ticket: TicketDetail }) {
  const isClosed = ticket.status === "CLOSED"
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<UpdateFormValues>({
    defaultValues: {
      resolution: ticket.resolution ?? "",
      status: ticket.status,
    },
    resolver: zodResolver(updateFormSchema),
  })
  const updateTicket = useUpdateTicketMutation()

  const onSubmit = handleSubmit(async (values) => {
    // Same rule the backend enforces: a resolved ticket needs a reply.
    if (values.status === "RESOLVED" && !values.resolution.trim()) {
      setError("resolution", {
        message: "Cần nhập phản hồi khi đánh dấu đã giải quyết.",
      })
      return
    }

    try {
      await updateTicket.mutateAsync({ input: values, ticketId: ticket.id })
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  })

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div
        {...tourAnchor(TOUR_ANCHORS.ticketFormStatus)}
        className="space-y-1.5"
      >
        <Label htmlFor="ticket-status">Trạng thái xử lý</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              disabled={isClosed}
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger className="w-full sm:w-60" id="ticket-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ticketStatusSchema.options.map((status) => (
                  <SelectItem key={status} value={status}>
                    {TICKET_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div
        {...tourAnchor(TOUR_ANCHORS.ticketFormResolution)}
        className="space-y-1.5"
      >
        <Label htmlFor="ticket-resolution">Phản hồi cho người dùng</Label>
        <Textarea
          disabled={isClosed}
          id="ticket-resolution"
          maxLength={TICKET_RESOLUTION_MAX_LENGTH}
          placeholder="Nội dung giải đáp hoặc kết quả xử lý..."
          rows={4}
          {...register("resolution")}
        />
        {errors.resolution ? (
          <p className="text-xs text-destructive">
            {errors.resolution.message}
          </p>
        ) : null}
      </div>

      {isClosed ? (
        <p className="text-xs text-muted-foreground">
          Yêu cầu đã đóng, không thể thay đổi nữa.
        </p>
      ) : null}
      {errors.root ? (
        <p
          className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
          role="alert"
        >
          {errors.root.message}
        </p>
      ) : null}

      <div className="flex justify-end pt-2">
        {isClosed ? null : (
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <Loader2
                aria-hidden="true"
                className="mr-2 size-4 animate-spin"
              />
            ) : null}
            Lưu thay đổi
          </Button>
        )}
      </div>
    </form>
  )
}
