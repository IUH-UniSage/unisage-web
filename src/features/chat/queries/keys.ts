export const chatKeys = {
  all: ["chat"] as const,
  // Guests pass userId === "" - normalized to a stable "guest" key so every
  // caller (the list query and its create/claim/delete mutations) lands on
  // the same cache entry without each one remembering the fallback.
  conversations: (userId: string) =>
    [...chatKeys.all, "conversations", userId || "guest"] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, "messages", conversationId] as const,
}
