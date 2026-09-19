import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { QUERY_POLICIES } from "@/constants/query-policies"
import {
  ticketApi,
  type AdminTicketsParams,
  type MyTicketsParams,
} from "@/features/support-tickets/api/ticket-api"
import { ticketKeys } from "@/features/support-tickets/queries/keys"

export const ticketOptions = {
  detail: (ticketId: string) =>
    queryOptions({
      ...QUERY_POLICIES.detail,
      enabled: Boolean(ticketId),
      queryFn: () => ticketApi.getTicket(ticketId),
      queryKey: ticketKeys.detail(ticketId),
    }),
  list: (params: AdminTicketsParams) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      placeholderData: keepPreviousData,
      queryFn: () => ticketApi.getTickets(params),
      queryKey: ticketKeys.list(params),
    }),
  mine: (params: MyTicketsParams) =>
    queryOptions({
      ...QUERY_POLICIES.list,
      placeholderData: keepPreviousData,
      queryFn: () => ticketApi.getMyTickets(params),
      queryKey: ticketKeys.mine(params),
    }),
  myDetail: (ticketId: string) =>
    queryOptions({
      ...QUERY_POLICIES.detail,
      enabled: Boolean(ticketId),
      queryFn: () => ticketApi.getMyTicket(ticketId),
      queryKey: ticketKeys.myDetail(ticketId),
    }),
}
