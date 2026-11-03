import { z } from "zod"

import {
  citationSchema,
  msgRoleSchema,
} from "@/features/chat/schemas/chat-schemas"

// Conversation sharing (UNISAGE-107). Mirrors the backend `/shares` contract:
// unisage-backend/changes/02-11-2026-Conversation-Sharing/spec.md §5.2.

export const createShareRequestSchema = z.object({
  conversationId: z.uuid(),
})

export type CreateShareRequest = z.infer<typeof createShareRequestSchema>

// POST /shares
export const createdShareSchema = z.object({
  createdAt: z.string(),
  id: z.uuid(),
  messageCount: z.number().int().nonnegative(),
  title: z.string().nullish(),
  token: z.string().min(1),
})

export type CreatedShare = z.infer<typeof createdShareSchema>

// One row of GET /shares ("Liên kết đã chia sẻ").
export const shareSchema = createdShareSchema.extend({
  conversationId: z.uuid(),
})

export type Share = z.infer<typeof shareSchema>

export const sharePageSchema = z.object({
  data: z.array(shareSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export type SharePage = z.infer<typeof sharePageSchema>

// DELETE /shares returns how many links were revoked.
export const revokedCountSchema = z.number().int().nonnegative()

export const sharedMessageSchema = z.object({
  // Falls back to null on an unexpected shape so a bad row can't break the snapshot.
  citations: z.array(citationSchema).nullable().catch(null),
  content: z.string(),
  createdAt: z.string(),
  id: z.uuid(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  role: msgRoleSchema,
})

export type SharedMessage = z.infer<typeof sharedMessageSchema>

// GET /shares/view/{token}. `conversationId` (the original conversation) is only
// sent to the link's owner, for the "Mở hội thoại gốc" button.
export const sharedConversationSchema = z.object({
  conversationId: z.uuid().nullish(),
  createdAt: z.string(),
  isOwner: z.boolean(),
  messages: z.array(sharedMessageSchema),
  title: z.string().nullish(),
})

export type SharedConversation = z.infer<typeof sharedConversationSchema>

// POST /shares/view/{token}/continue
export const continuedShareSchema = z.object({
  conversationId: z.uuid(),
})

export type ContinuedShare = z.infer<typeof continuedShareSchema>
