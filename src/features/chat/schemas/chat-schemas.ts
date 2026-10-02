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

// One cited source of an assistant reply, written by unisage-agent. Never carries
// the storage object key (the history API is public) - a file is opened by
// `documentId` through the citation endpoint instead.
export const citationSchema = z.object({
  documentId: z.string().nullish(),
  index: z.number().int().positive(),
  pageEnd: z.number().nullish(),
  pageStart: z.number().nullish(),
  section: z.string().nullish(),
  sourceType: z.string().nullish(),
  title: z.string(),
})

export const citationDocumentSchema = z.object({
  fileName: z.string().nullish(),
  fileType: z.string().nullish(),
  fileUrl: z.string().nullish(),
  id: z.string(),
  title: z.string(),
})

export const messageSchema = z.object({
  chatModelId: z.uuid().nullable(),
  // Falls back to null on an unexpected shape so a bad row can't break the whole history.
  citations: z.array(citationSchema).nullable().catch(null),
  content: z.string(),
  conversationId: z.uuid(),
  createdAt: z.string(),
  id: z.uuid(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  retrievalScore: z.number().nullable(),
  role: msgRoleSchema,
  status: msgStatusSchema,
  // Set once the user has reported this answer as a support ticket.
  ticketId: z.uuid().nullish(),
  // Client-only: why this turn failed (the agent's message for this caller),
  // shown in the error bubble. Never sent by backend-java, so a reloaded
  // ERROR message falls back to the generic text.
  errorMessage: z.string().optional(),
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

export type Citation = z.infer<typeof citationSchema>
export type CitationDocument = z.infer<typeof citationDocumentSchema>
