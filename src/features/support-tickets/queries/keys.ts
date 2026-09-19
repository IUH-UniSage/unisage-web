import type {
  AdminTicketsParams,
  MyTicketsParams,
} from "@/features/support-tickets/api/ticket-api"

export const ticketKeys = {
  all: ["tickets"] as const,
  detail: (ticketId: string) =>
    [...ticketKeys.all, "detail", ticketId] as const,
  list: (params: AdminTicketsParams) =>
    [...ticketKeys.all, "list", params] as const,
  mine: (params: MyTicketsParams) =>
    [...ticketKeys.all, "mine", params] as const,
  myDetail: (ticketId: string) =>
    [...ticketKeys.all, "my-detail", ticketId] as const,
}
