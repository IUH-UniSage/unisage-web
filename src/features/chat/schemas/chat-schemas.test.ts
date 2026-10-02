import { describe, expect, it } from "vitest"

import {
  citationSchema,
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
  it("parses agent citations on a message and never expects an object key", () => {
    const base = {
      chatModelId: null,
      content: "Học phí là 35 triệu [1].",
      conversationId: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
      createdAt: "2026-07-28T08:00:00",
      id: "c76398bd-c8ac-4fa8-803e-0a91e207347c",
      metadata: null,
      retrievalScore: null,
      role: "ASSISTANT",
      status: "COMPLETED",
    }
    const citation = {
      documentId: "d76398bd-c8ac-4fa8-803e-0a91e207347c",
      index: 1,
      pageEnd: 4,
      pageStart: 3,
      section: "Mục 3",
      sourceType: "PDF",
      title: "Quyet dinh 1035",
    }

    expect(citationSchema.parse(citation)).not.toHaveProperty("objectKey")
    expect(
      messageSchema.parse({ ...base, citations: [citation] }).citations
    ).toEqual([citation])
    // A malformed value must not break the whole message history.
    expect(
      messageSchema.parse({ ...base, citations: "oops" }).citations
    ).toBeNull()
  })

  it("keeps the url of a web-search citation", () => {
    const citation = citationSchema.parse({
      documentId: null,
      index: 3,
      pageEnd: null,
      pageStart: null,
      section: null,
      sourceType: "WEB",
      title: "Lịch thi HK1",
      url: "https://pdt.iuh.edu.vn/lich-thi",
    })

    expect(citation.url).toBe("https://pdt.iuh.edu.vn/lich-thi")
  })

  it("drops a non-http url instead of the whole citation", () => {
    const citation = citationSchema.parse({
      index: 1,
      sourceType: "WEB",
      title: "x",
      url: "javascript:alert(1)",
    })

    expect(citation.title).toBe("x")
    expect(citation.url).toBeNull()
  })
})
