import { z } from "zod"

// Mirror backend TicketType / TicketStatus (name + displayName). Update both
// together when the backend enums change.
export const ticketTypeSchema = z.enum([
  "AI_SYSTEM_ERROR",
  "AI_UNANSWERED",
  "AI_SECURITY_BREACH",
  "AI_INAPPROPRIATE",
  "OTHER",
])
export const ticketStatusSchema = z.enum([
  "OPEN",
  "PROCESSING",
  "RESOLVED",
  "CLOSED",
])

export type TicketType = z.infer<typeof ticketTypeSchema>
export type TicketStatus = z.infer<typeof ticketStatusSchema>

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  AI_INAPPROPRIATE: "Nội dung không phù hợp",
  AI_SECURITY_BREACH: "Nghi ngờ lộ thông tin bảo mật",
  AI_SYSTEM_ERROR: "AI trả lời sai hoặc lỗi hệ thống",
  AI_UNANSWERED: "AI không trả lời được",
  OTHER: "Khác",
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  CLOSED: "Đã đóng",
  OPEN: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  RESOLVED: "Đã giải quyết",
}

export const TICKET_TITLE_MAX_LENGTH = 200
export const TICKET_DESCRIPTION_MAX_LENGTH = 2000

export const ticketSchema = z.object({
  createdAt: z.string().nullish(),
  description: z.string(),
  id: z.uuid(),
  messageId: z.uuid(),
  resolution: z.string().nullish(),
  status: ticketStatusSchema,
  title: z.string(),
  type: ticketTypeSchema,
  updatedAt: z.string().nullish(),
  userEmail: z.string().nullish(),
  userId: z.uuid(),
  userName: z.string().nullish(),
})

export type Ticket = z.infer<typeof ticketSchema>

// Detail adds the conversation context the backend resolves at read time.
export const ticketDetailSchema = ticketSchema.extend({
  conversationId: z.uuid(),
  messageContent: z.string().nullish(),
  questionContent: z.string().nullish(),
})

export type TicketDetail = z.infer<typeof ticketDetailSchema>

export const ticketPageSchema = z.object({
  data: z.array(ticketSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export type TicketPage = z.infer<typeof ticketPageSchema>

export const TICKET_RESOLUTION_MAX_LENGTH = 2000

export const updateTicketRequestSchema = z.object({
  resolution: z.string().trim().max(TICKET_RESOLUTION_MAX_LENGTH).nullish(),
  status: ticketStatusSchema,
})

export type UpdateTicketRequest = z.infer<typeof updateTicketRequestSchema>

export const createTicketRequestSchema = z.object({
  description: z.string(),
  messageId: z.uuid(),
  title: z.string(),
  type: ticketTypeSchema,
})

export type CreateTicketRequest = z.infer<typeof createTicketRequestSchema>

// The report dialog's own fields; the message id is supplied by the caller.
export const createTicketFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Vui lòng mô tả vấn đề bạn gặp phải.")
    .max(
      TICKET_DESCRIPTION_MAX_LENGTH,
      `Mô tả không được vượt quá ${TICKET_DESCRIPTION_MAX_LENGTH} ký tự.`
    ),
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tiêu đề.")
    .max(
      TICKET_TITLE_MAX_LENGTH,
      `Tiêu đề không được vượt quá ${TICKET_TITLE_MAX_LENGTH} ký tự.`
    ),
  type: ticketTypeSchema,
})

export type CreateTicketFormValues = z.infer<typeof createTicketFormSchema>
