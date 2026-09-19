import { Badge } from "@/components/ui/badge"
import {
  TICKET_STATUS_LABELS,
  type TicketStatus,
} from "@/features/support-tickets/schemas/ticket-schemas"
import { cn } from "@/lib/utils"

const STATUS_CLASSNAME: Record<TicketStatus, string> = {
  CLOSED: "border-transparent bg-muted text-muted-foreground",
  OPEN: "border-transparent bg-warning text-warning-foreground",
  PROCESSING: "border-transparent bg-sky/10 text-sky",
  RESOLVED: "border-transparent bg-success/10 text-success",
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge className={cn("px-2.5", STATUS_CLASSNAME[status])} variant="ghost">
      {TICKET_STATUS_LABELS[status]}
    </Badge>
  )
}
