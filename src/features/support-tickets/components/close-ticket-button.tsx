import { Loader2, XCircle } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUpdateTicketMutation } from "@/features/support-tickets/queries/use-mutations"
import type { TicketDetail } from "@/features/support-tickets/schemas/ticket-schemas"
import { getErrorMessage } from "@/utils/error-handler"

type CloseTicketButtonProps = {
  onClosed: () => void
  ticket: TicketDetail
}

// CLOSED is terminal on the backend, so closing always asks first. Keeps the current reply.
export function CloseTicketButton({
  onClosed,
  ticket,
}: CloseTicketButtonProps) {
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const updateTicket = useUpdateTicketMutation()

  const confirm = async () => {
    setErrorMessage(null)
    try {
      await updateTicket.mutateAsync({
        input: { resolution: ticket.resolution ?? "", status: "CLOSED" },
        ticketId: ticket.id,
      })
      setOpen(false)
      onClosed()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    }
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setErrorMessage(null)
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button className="shrink-0" variant="outline">
          <XCircle aria-hidden="true" />
          Đóng yêu cầu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đóng yêu cầu hỗ trợ?</DialogTitle>
          <DialogDescription>
            Sau khi đóng, yêu cầu không thể đổi trạng thái hay phản hồi thêm.
          </DialogDescription>
        </DialogHeader>
        {errorMessage ? (
          <p
            className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={updateTicket.isPending} variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button
            disabled={updateTicket.isPending}
            onClick={() => void confirm()}
            variant="destructive"
          >
            {updateTicket.isPending ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : (
              <XCircle aria-hidden="true" />
            )}
            Đóng yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
