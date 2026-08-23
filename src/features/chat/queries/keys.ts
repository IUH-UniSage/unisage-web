export const chatKeys = {
  all: ["chat"] as const,
  conversations: (userId: string) =>
    [...chatKeys.all, "conversations", userId] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, "messages", conversationId] as const,
}
