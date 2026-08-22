import { useState } from "react"

import {
  INITIAL_CONVERSATIONS,
  type Conversation,
} from "@/features/chat/chat-data"

export function useChatWorkspace() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [isSourcesOpen, setIsSourcesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    ...INITIAL_CONVERSATIONS,
  ])
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null)

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

  const renameConversation = (id: string, title: string) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, title } : conversation
      )
    )
  }

  const togglePinnedConversation = (id: string) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id
          ? { ...conversation, pinned: !conversation.pinned }
          : conversation
      )
    )
  }

  const deleteConversation = (id: string) => {
    setConversations((current) =>
      current.filter((conversation) => conversation.id !== id)
    )

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
          ? "xl:grid-cols-[minmax(0,1fr)_320px]"
          : "xl:grid-cols-[minmax(0,1fr)]"

  return {
    activeConversation,
    activeConversationId,
    conversations,
    deleteConversation,
    desktopGridClass,
    isHistoryOpen,
    isSourcesOpen,
    renameConversation,
    searchQuery,
    selectConversation,
    setIsHistoryOpen,
    setIsSourcesOpen,
    setSearchQuery,
    startNewConversation,
    togglePinnedConversation,
  }
}
