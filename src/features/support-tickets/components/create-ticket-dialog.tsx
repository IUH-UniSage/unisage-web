import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTicketMutation } from "@/features/support-tickets/queries/use-mutations"
import {
  createTicketFormSchema,
  TICKET_DESCRIPTION_MAX_LENGTH,
  TICKET_TITLE_MAX_LENGTH,
  TICKET_TYPE_LABELS,
  ticketTypeSchema,
  type CreateTicketFormValues,
} from "@/features/support-tickets/schemas/ticket-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type CreateTicketDialogProps = {
  defaultTitle: string
  messageId: string
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function CreateTicketDialog({
  defaultTitle,
  messageId,
  onOpenChange,
  open,
}: CreateTicketDialogProps) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CreateTicketFormValues>({
    defaultValues: {
      description: "",
      title: defaultTitle.slice(0, TICKET_TITLE_MAX_LENGTH),
      type: "AI_SYSTEM_ERROR",
    },
    resolver: zodResolver(createTicketFormSchema),
  })
  const createTicket = useCreateTicketMutation()

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createTicket.mutateAsync({ ...values, messageId })
      handleOpenChange(false)
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  })

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Báo cáo câu trả lời này</DialogTitle>
            <DialogDescription>
              Gửi yêu cầu hỗ trợ để cán bộ xem xét câu trả lời của trợ lý. Mỗi
              câu trả lời chỉ báo cáo được một lần.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="ticket-type">Loại vấn đề</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full" id="ticket-type">
                    <SelectValue placeholder="Chọn loại vấn đề" />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketTypeSchema.options.map((type) => (
                      <SelectItem key={type} value={type}>
                        {TICKET_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type ? (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticket-title">Tiêu đề</Label>
            <Input
              id="ticket-title"
              maxLength={TICKET_TITLE_MAX_LENGTH}
              {...register("title")}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticket-description">Mô tả vấn đề</Label>
            <Textarea
              id="ticket-description"
              maxLength={TICKET_DESCRIPTION_MAX_LENGTH}
              placeholder="Câu trả lời sai ở đâu, bạn mong đợi điều gì?"
              rows={5}
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          {errors.root ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
              {errors.root.message}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              Hủy
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2
                  aria-hidden="true"
                  className="mr-2 size-4 animate-spin"
                />
              ) : null}
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
