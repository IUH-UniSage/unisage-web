import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { useAuth } from "@/features/auth/hooks/use-auth"
import { useChatStream } from "@/features/chat/hooks/use-chat-stream"
import { chatKeys } from "@/features/chat/queries/keys"
import {
  useCreateConversationMutation,
  useDeleteConversationMutation,
} from "@/features/chat/queries/use-mutations"
import {
  useConversationsQuery,
  useMessagesQuery,
} from "@/features/chat/queries/use-queries"
import type { Message } from "@/features/chat/schemas/chat-schemas"

const CONVERSATION_TITLE_MAX_LENGTH = 80

function nowIso(): string {
  return new Date().toISOString()
}

export function useChatWorkspace() {
  const { session } = useAuth()
  const userId = session?.userId ?? ""
  const queryClient = useQueryClient()
  const chatStream = useChatStream()

  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [isSourcesOpen, setIsSourcesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null)
  const [isStreaming, setIsStreaming] = useState(false)

  const conversationsQuery = useConversationsQuery(userId)
  const messagesQuery = useMessagesQuery(activeConversationId ?? "")
  const createConversationMutation = useCreateConversationMutation(userId)
  const deleteConversationMutation = useDeleteConversationMutation(userId)

  const conversations = conversationsQuery.data ?? []
  const messages = messagesQuery.data ?? []
  const activeConversation =
    conversations.find(
      (conversation) => conversation.id === activeConversationId
    ) ?? null

  const startNewConversation = () => {
    chatStream.abort()
    setIsStreaming(false)
    setActiveConversationId(null)
    setIsSourcesOpen(false)
    setSearchQuery("")
  }

  const selectConversation = (id: string) => {
    chatStream.abort()
    setIsStreaming(false)
    setActiveConversationId(id)
    setIsSourcesOpen(true)
  }

  const setMessages = (
    conversationId: string,
    updater: (current: Message[]) => Message[]
  ) => {
    queryClient.setQueryData(
      chatKeys.messages(conversationId),
      (current: Message[] | undefined) => updater(current ?? [])
    )
  }

  const sendMessage = async (content: string) => {
    let conversationId = activeConversationId

    if (!conversationId) {
      const created = await createConversationMutation.mutateAsync({
        title: content.slice(0, CONVERSATION_TITLE_MAX_LENGTH),
      })
      conversationId = created.id
      setActiveConversationId(created.id)
      setIsSourcesOpen(true)
    }

    const userMessage: Message = {
      chatModelId: null,
      citations: null,
      content,
      conversationId,
      createdAt: nowIso(),
      id: crypto.randomUUID(),
      metadata: null,
      retrievalScore: null,
      role: "USER",
      status: "COMPLETED",
    }
    const assistantMessageId = crypto.randomUUID()
    const assistantMessage: Message = {
      chatModelId: null,
      citations: null,
      content: "",
      conversationId,
      createdAt: nowIso(),
      id: assistantMessageId,
      metadata: null,
      retrievalScore: null,
      role: "ASSISTANT",
      status: "STREAMING",
    }
    setMessages(conversationId, (current) => [
      ...current,
      userMessage,
      assistantMessage,
    ])

    setIsStreaming(true)
    const conversationIdForStream = conversationId
    await chatStream.stream(
      { conversationId: conversationIdForStream, message: content },
      {
        onChunk: (_token, fullText) => {
          setMessages(conversationIdForStream, (current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? { ...message, content: fullText }
                : message
            )
          )
        },
        onDone: () => {
          setIsStreaming(false)
          void queryClient.invalidateQueries({
            queryKey: chatKeys.messages(conversationIdForStream),
          })
        },
        onError: () => {
          // Deliberately not invalidating here: backend-java may not have
          // persisted anything past the USER message (or may be left
          // holding an orphaned STREAMING placeholder) for a failed stream,
          // so refetching now would just replace this clear error bubble
          // with a phantom "still thinking" row. The next natural refetch
          // (reopening the conversation) reconciles with the server as
          // usual.
          setIsStreaming(false)
          setMessages(conversationIdForStream, (current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? { ...message, status: "ERROR" }
                : message
            )
          )
        },
      }
    )
  }

  const stopGenerating = () => {
    chatStream.abort()
    setIsStreaming(false)
    if (activeConversationId) {
      void queryClient.invalidateQueries({
        queryKey: chatKeys.messages(activeConversationId),
      })
    }
  }

  const deleteConversation = (id: string) => {
    deleteConversationMutation.mutate(id)

    if (activeConversationId === id) {
      setActiveConversationId(null)
      setIsSourcesOpen(false)
    }
  }

  return {
    activeConversation,
    activeConversationId,
    conversations,
    deleteConversation,
    isHistoryOpen,
    isSendingMessage: createConversationMutation.isPending || isStreaming,
    isSourcesOpen,
    isStreaming,
    messages,
    searchQuery,
    selectConversation,
    sendMessage,
    setIsHistoryOpen,
    setIsSourcesOpen,
    setSearchQuery,
    startNewConversation,
    stopGenerating,
  }
}
