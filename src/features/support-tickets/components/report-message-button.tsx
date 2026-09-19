import { Flag } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/paths"
import { useAuth } from "@/features/auth/hooks/use-auth"
import type { Message } from "@/features/chat/schemas/chat-schemas"
import { CreateTicketDialog } from "@/features/support-tickets/components/create-ticket-dialog"
import { cn } from "@/lib/utils"

type ReportMessageButtonProps = {
  // True while the reply is still streaming or its ids are not the server's yet.
  disabled?: boolean
  message: Message
  questionText: string | null
}

// Sits beside the copy button under an assistant reply. Guests are sent to
// sign in; a reply that already has a ticket stays disabled (the ticket id
// comes back on the message, so this survives a reload).
export function ReportMessageButton({
  disabled = false,
  message,
  questionText,
}: ReportMessageButtonProps) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const isReported = Boolean(message.ticketId)
  const label = isReported ? "Đã báo cáo" : "Báo cáo câu trả lời này"

  const handleClick = () => {
    if (!session) {
      void navigate(ROUTES.signIn, { state: { from: location.pathname } })
      return
    }
    setIsOpen(true)
  }

  return (
    <>
      <Button
        aria-label={label}
        className="size-7 text-muted-foreground hover:text-foreground"
        disabled={isReported || disabled}
        onClick={handleClick}
        size="icon"
        title={label}
        variant="ghost"
      >
        <Flag
          className={cn("size-4", isReported && "fill-current text-amber-500")}
        />
      </Button>
      {session ? (
        <CreateTicketDialog
          defaultTitle={(questionText ?? "").trim()}
          messageId={message.id}
          onOpenChange={setIsOpen}
          open={isOpen}
        />
      ) : null}
    </>
  )
}
