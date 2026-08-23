import { z } from "zod"

export const msgRoleSchema = z.enum(["USER", "ASSISTANT", "SYSTEM"])
export const msgStatusSchema = z.enum([
  "PENDING",
  "STREAMING",
  "COMPLETED",
  "ERROR",
])

export const conversationSchema = z.object({
  createdAt: z.string(),
  id: z.uuid(),
  title: z.string(),
  userId: z.uuid().nullable(),
})

export const messageSchema = z.object({
  chatModelId: z.uuid().nullable(),
  citations: z.unknown().nullable(),
  content: z.string(),
  conversationId: z.uuid(),
  createdAt: z.string(),
  id: z.uuid(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  retrievalScore: z.number().nullable(),
  role: msgRoleSchema,
  status: msgStatusSchema,
})

export const createConversationRequestSchema = z.object({
  title: z.string().trim().min(1).max(255),
})

export const sendMessageRequestSchema = z.object({
  content: z.string().trim().min(1),
  conversationId: z.uuid(),
  role: msgRoleSchema,
})

export type MsgRole = z.infer<typeof msgRoleSchema>
export type MsgStatus = z.infer<typeof msgStatusSchema>
export type Conversation = z.infer<typeof conversationSchema>
export type Message = z.infer<typeof messageSchema>
export type CreateConversationRequest = z.infer<
  typeof createConversationRequestSchema
>
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>
