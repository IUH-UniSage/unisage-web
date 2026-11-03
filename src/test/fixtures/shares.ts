import type {
  Share,
  SharedConversation,
} from "@/features/conversations/schemas/share-schemas"

export const SHARE_TOKEN = "Zm9vYmFyLXRva2VuLXVybC1zYWZlXzEyMzQ1Njc4OTA"
export const ORIGINAL_CONVERSATION_ID = "0f8fad5b-d9cb-469f-a165-70867728950e"
export const COPY_CONVERSATION_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7"

export function apiOk<T>(data: T) {
  return { code: 1000, data, message: "Successful" }
}

// The backend's own message must never reach the screen (spec R12).
export function apiError(code: number) {
  return { code, data: null, message: `RAW BACKEND MESSAGE ${code}` }
}

export function buildSharedConversation(
  overrides: Partial<SharedConversation> = {}
): SharedConversation {
  return {
    createdAt: "2026-11-02T03:00:00Z",
    isOwner: false,
    messages: [
      {
        citations: null,
        content: "Học phí học kỳ này là bao nhiêu?",
        createdAt: "2026-11-02T02:59:00Z",
        id: "1b4e28ba-2fa1-41d2-883f-0016d3cca427",
        metadata: null,
        role: "USER",
      },
      {
        citations: [
          {
            documentId: "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b",
            index: 1,
            pageEnd: null,
            pageStart: 3,
            section: null,
            sourceType: null,
            title: "Quy định học phí 2026",
            url: null,
          },
        ],
        content: "Học phí là 450.000đ một tín chỉ [1].",
        createdAt: "2026-11-02T02:59:30Z",
        id: "9a1c7c3e-4e7c-4d4b-8c39-3a1f0e5c2b11",
        metadata: null,
        role: "ASSISTANT",
      },
    ],
    title: "Hỏi về học phí",
    ...overrides,
  }
}

export function buildShare(overrides: Partial<Share> = {}): Share {
  return {
    conversationId: ORIGINAL_CONVERSATION_ID,
    createdAt: "2026-11-02T03:00:00Z",
    id: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
    messageCount: 4,
    title: "Hỏi về học phí",
    token: SHARE_TOKEN,
    ...overrides,
  }
}
