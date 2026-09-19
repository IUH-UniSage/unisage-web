import { useMutation, useQueryClient } from "@tanstack/react-query"

import { chatKeys } from "@/features/chat/queries/keys"
import type { Message } from "@/features/chat/schemas/chat-schemas"
import { ticketApi } from "@/features/support-tickets/api/ticket-api"
import { ticketKeys } from "@/features/support-tickets/queries/keys"
import type {
  CreateTicketRequest,
  UpdateTicketRequest,
} from "@/features/support-tickets/schemas/ticket-schemas"

export function useCreateTicketMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      invalidatesQuery: ticketKeys.all,
      successMessage: "Đã gửi yêu cầu hỗ trợ.",
      // The dialog shows the backend message (e.g. already reported) inline.
      suppressGlobalError: true,
    },
    mutationFn: (input: CreateTicketRequest) => ticketApi.createTicket(input),
    // Mark the reported reply in every cached conversation right away, so its
    // report button locks without waiting for a refetch.
    onSuccess: (ticket) => {
      queryClient.setQueriesData<Message[]>(
        { queryKey: [...chatKeys.all, "messages"] },
        (current) =>
          current?.map((message) =>
            message.id === ticket.messageId
              ? { ...message, ticketId: ticket.id }
              : message
          )
      )
    },
  })
}

type UpdateTicketVariables = {
  input: UpdateTicketRequest
  ticketId: string
}

export function useUpdateTicketMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      invalidatesQuery: ticketKeys.all,
      successMessage: "Đã cập nhật yêu cầu hỗ trợ.",
      suppressGlobalError: true,
    },
    mutationFn: ({ input, ticketId }: UpdateTicketVariables) =>
      ticketApi.updateTicket(ticketId, input),
    // Show the saved values right away instead of waiting for the refetch.
    onSuccess: (updatedTicket) => {
      queryClient.setQueryData(
        ticketKeys.detail(updatedTicket.id),
        updatedTicket
      )
    },
  })
}
