import { describe, expect, it } from "vitest"

import {
  conversationSchema,
  createConversationRequestSchema,
  messageSchema,
  sendMessageRequestSchema,
} from "@/features/chat/schemas/chat-schemas"

describe("chat schemas", () => {
  it("parses the backend ConversationResponse contract", () => {
    const conversation = conversationSchema.parse({
      createdAt: "2026-07-28T08:00:00",
      id: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
      title: "Điều kiện tốt nghiệp",
      userId: "b76398bd-c8ac-4fa8-803e-0a91e207347c",
    })

    expect(conversation.title).toBe("Điều kiện tốt nghiệp")
  })

  it("parses the backend MessageResponse contract, including a pending assistant reply", () => {
    const message = messageSchema.parse({
      chatModelId: null,
      citations: null,
      content: "",
      conversationId: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
      createdAt: "2026-07-28T08:00:00",
      id: "c76398bd-c8ac-4fa8-803e-0a91e207347c",
      metadata: null,
      retrievalScore: null,
      role: "ASSISTANT",
      status: "PENDING",
    })

    expect(message.status).toBe("PENDING")
  })

  it("validates the create-conversation request payload", () => {
    expect(
      createConversationRequestSchema.parse({ title: "Cuộc trò chuyện mới" })
        .title
    ).toBe("Cuộc trò chuyện mới")
  })

  it("rejects an empty send-message content", () => {
    expect(() =>
      sendMessageRequestSchema.parse({
        content: "",
        conversationId: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
        role: "USER",
      })
    ).toThrow()
  })
})
