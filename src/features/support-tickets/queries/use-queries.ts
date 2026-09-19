import { useQuery } from "@tanstack/react-query"

import type {
  AdminTicketsParams,
  MyTicketsParams,
} from "@/features/support-tickets/api/ticket-api"
import { ticketOptions } from "@/features/support-tickets/queries/options"

export function useMyTicketsQuery(params: MyTicketsParams) {
  return useQuery(ticketOptions.mine(params))
}

export function useMyTicketQuery(ticketId: string) {
  return useQuery(ticketOptions.myDetail(ticketId))
}

export function useTicketsQuery(params: AdminTicketsParams) {
  return useQuery(ticketOptions.list(params))
}

export function useTicketQuery(ticketId: string) {
  return useQuery(ticketOptions.detail(ticketId))
}
