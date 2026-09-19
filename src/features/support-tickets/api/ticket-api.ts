import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { httpClient } from "@/lib/axios-client"
import {
  createTicketRequestSchema,
  ticketDetailSchema,
  ticketPageSchema,
  ticketSchema,
  updateTicketRequestSchema,
  type CreateTicketRequest,
  type Ticket,
  type TicketDetail,
  type TicketPage,
  type TicketStatus,
  type TicketType,
  type UpdateTicketRequest,
} from "@/features/support-tickets/schemas/ticket-schemas"
import { readSuccessData } from "@/utils/api-response"
import type { ApiResponse } from "@/utils/api-response"

export type MyTicketsParams = {
  // 1-based, like the rest of the UI; the backend page index is 0-based.
  page: number
  size: number
  status?: TicketStatus
}

export type AdminTicketsParams = MyTicketsParams & {
  q?: string
  type?: TicketType
}

export const ticketApi = {
  async createTicket(input: CreateTicketRequest): Promise<Ticket> {
    const request = createTicketRequestSchema.parse(input)
    const response = await httpClient.post<ApiResponse<Ticket>>(
      API_ENDPOINTS.tickets.tickets,
      request
    )

    return readSuccessData(response.data, ticketSchema)
  },

  async getMyTicket(ticketId: string): Promise<TicketDetail> {
    const response = await httpClient.get<ApiResponse<TicketDetail>>(
      API_ENDPOINTS.tickets.myTicket(ticketId)
    )

    return readSuccessData(response.data, ticketDetailSchema)
  },

  async getMyTickets({
    page,
    size,
    status,
  }: MyTicketsParams): Promise<TicketPage> {
    const response = await httpClient.get<ApiResponse<TicketPage>>(
      API_ENDPOINTS.tickets.myTickets,
      { params: { page: page - 1, size, status } }
    )

    return readSuccessData(response.data, ticketPageSchema)
  },

  async getTicket(ticketId: string): Promise<TicketDetail> {
    const response = await httpClient.get<ApiResponse<TicketDetail>>(
      API_ENDPOINTS.tickets.ticket(ticketId)
    )

    return readSuccessData(response.data, ticketDetailSchema)
  },

  async getTickets({
    page,
    q,
    size,
    status,
    type,
  }: AdminTicketsParams): Promise<TicketPage> {
    const response = await httpClient.get<ApiResponse<TicketPage>>(
      API_ENDPOINTS.tickets.tickets,
      { params: { page: page - 1, q: q || undefined, size, status, type } }
    )

    return readSuccessData(response.data, ticketPageSchema)
  },

  async updateTicket(
    ticketId: string,
    input: UpdateTicketRequest
  ): Promise<TicketDetail> {
    const request = updateTicketRequestSchema.parse(input)
    const response = await httpClient.patch<ApiResponse<TicketDetail>>(
      API_ENDPOINTS.tickets.ticket(ticketId),
      request
    )

    return readSuccessData(response.data, ticketDetailSchema)
  },
}
