import { useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"

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
  // Tracks the in-flight assistant bubble so `stopGenerating` can freeze it
  // in place: the agent has no real cancel-generation endpoint, so aborting
  // the fetch only stops *reading* the stream - the reply keeps generating
  // server-side. Without this, the bubble is stuck showing "Đang suy
  // nghĩ..." forever (its status/content never changes again).
  const inFlightRef = useRef<{
    assistantMessageId: string
    conversationId: string
    fullText: string
  } | null>(null)

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
      ticketId: null,
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
      ticketId: null,
    }
    setMessages(conversationId, (current) => [
      ...current,
      userMessage,
      assistantMessage,
    ])

    setIsStreaming(true)
    const conversationIdForStream = conversationId
    inFlightRef.current = {
      assistantMessageId,
      conversationId: conversationIdForStream,
      fullText: "",
    }
    await chatStream.stream(
      { conversationId: conversationIdForStream, message: content },
      {
        onChunk: (_token, fullText) => {
          if (inFlightRef.current?.assistantMessageId === assistantMessageId) {
            inFlightRef.current.fullText = fullText
          }
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
          inFlightRef.current = null
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
          inFlightRef.current = null
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

    const inFlight = inFlightRef.current
    inFlightRef.current = null
    if (!inFlight) return

    // Freeze the bubble at whatever text arrived before the user stopped
    // watching - the agent keeps generating server-side regardless, so
    // there's nothing further to reconcile against right now. Deliberately
    // not invalidating: the server-side row is likely still STREAMING with
    // less text than what we already have, and a refetch would replace this
    // frozen bubble with that stale one. The next natural refetch (opening
    // this conversation again) reconciles with the server as usual.
    setMessages(inFlight.conversationId, (current) =>
      current.map((message) =>
        message.id === inFlight.assistantMessageId
          ? { ...message, content: inFlight.fullText, status: "COMPLETED" }
          : message
      )
    )
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
