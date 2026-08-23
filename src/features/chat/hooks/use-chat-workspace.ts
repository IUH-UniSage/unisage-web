import { useState } from "react"

import { useAuth } from "@/features/auth/hooks/use-auth"
import {
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useSendMessageMutation,
} from "@/features/chat/queries/use-mutations"
import {
  useConversationsQuery,
  useMessagesQuery,
} from "@/features/chat/queries/use-queries"

const CONVERSATION_TITLE_MAX_LENGTH = 80

export function useChatWorkspace() {
  const { session } = useAuth()
  const userId = session?.userId ?? ""

  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [isSourcesOpen, setIsSourcesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null)

  const conversationsQuery = useConversationsQuery(userId)
  const messagesQuery = useMessagesQuery(activeConversationId ?? "")
  const createConversationMutation = useCreateConversationMutation(userId)
  const sendMessageMutation = useSendMessageMutation()
  const deleteConversationMutation = useDeleteConversationMutation(userId)

  const conversations = conversationsQuery.data ?? []
  const messages = messagesQuery.data ?? []
  const activeConversation =
    conversations.find(
      (conversation) => conversation.id === activeConversationId
    ) ?? null

  const startNewConversation = () => {
    setActiveConversationId(null)
    setIsSourcesOpen(false)
    setSearchQuery("")
  }

  const selectConversation = (id: string) => {
    setActiveConversationId(id)
    setIsSourcesOpen(true)
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

    await sendMessageMutation.mutateAsync({
      content,
      conversationId,
      role: "USER",
    })
  }

  const deleteConversation = (id: string) => {
    deleteConversationMutation.mutate(id)

    if (activeConversationId === id) {
      setActiveConversationId(null)
      setIsSourcesOpen(false)
    }
  }

  const desktopGridClass =
    isHistoryOpen && isSourcesOpen
      ? "xl:grid-cols-[280px_minmax(0,1fr)_320px]"
      : isHistoryOpen
        ? "xl:grid-cols-[280px_minmax(0,1fr)]"
        : isSourcesOpen
          ? "xl:grid-cols-[64px_minmax(0,1fr)_320px]"
          : "xl:grid-cols-[64px_minmax(0,1fr)]"

  return {
    activeConversation,
    activeConversationId,
    conversations,
    deleteConversation,
    desktopGridClass,
    isHistoryOpen,
    isSendingMessage:
      createConversationMutation.isPending || sendMessageMutation.isPending,
    isSourcesOpen,
    messages,
    searchQuery,
    selectConversation,
    sendMessage,
    setIsHistoryOpen,
    setIsSourcesOpen,
    setSearchQuery,
    startNewConversation,
  }
}
