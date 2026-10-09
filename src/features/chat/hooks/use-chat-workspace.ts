import { useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { useAuth } from "@/features/auth/hooks/use-auth"
import {
  ChatStreamHttpError,
  type ChatStreamInput,
  useChatStream,
} from "@/features/chat/hooks/use-chat-stream"
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
import type {
  Answer,
  ClarificationAnswers,
  ClarificationPanel,
} from "@/features/chat/schemas/clarification-schemas"
import { clearClarificationDraft } from "@/features/chat/utils/clarification-draft"
import {
  deriveOpenPanel,
  readClarification,
} from "@/features/chat/utils/clarification-state"
import { usageLimitKeys } from "@/features/usage-limits/queries/keys"
import { describeUsageLimitExceeded } from "@/features/usage-limits/utils/usage-format"
import { ApiResponseError } from "@/utils/api-response"
import { getErrorMessage } from "@/utils/error-handler"

// Backend ErrorCode.USAGE_LIMIT_EXCEEDED
const USAGE_LIMIT_EXCEEDED_CODE = 2130
const STREAM_FAILED_FALLBACK = "Không thể tạo câu trả lời. Vui lòng thử lại."

// unisage-agent contract chat-sse.md §4.
const CLARIFICATION_INVALID_CODE = 4010
const CLARIFICATION_STALE_CODE = 4091
const CLARIFICATION_PENDING_CODE = 4092
const CLARIFICATION_PROCESSING_CODE = 4093
const SERVICE_UNAVAILABLE_STATUS = 503

export type ClarificationSubmission = {
  answers: Answer[]
  // Built client-side in the same shape the agent stores, so the bordered
  // card shows right away instead of after the refetch.
  card: ClarificationAnswers
  panel: ClarificationPanel
  summary: string
}

export type ClarificationErrors = {
  byQuestion: Record<string, string>
  panelId: string
}

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
  const [isCancellingClarification, setIsCancellingClarification] =
    useState(false)
  // Server-side (4010) errors of the last submit, shown under their tabs.
  const [clarificationErrors, setClarificationErrors] =
    useState<ClarificationErrors | null>(null)
  // 4093: an earlier answer is still being processed - the composer stays
  // locked until the refetched history says otherwise.
  const [isAwaitingPreviousAnswer, setIsAwaitingPreviousAnswer] =
    useState(false)
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

  // Content that already streamed is kept; the bubble shows `errorMessage`
  // (the backend's message for this caller) below it.
  const markFailed = (
    conversationId: string,
    assistantMessageId: string,
    errorMessage: string
  ) => {
    setMessages(conversationId, (current) =>
      current.map((message) =>
        message.id === assistantMessageId
          ? { ...message, errorMessage, status: "ERROR" }
          : message
      )
    )
  }

  const refetchMessages = (conversationId: string) =>
    queryClient.invalidateQueries({
      queryKey: chatKeys.messages(conversationId),
    })

  const setClarificationStatus = (
    conversationId: string,
    assistantMessageId: string,
    status: "open" | "cancelled",
    panel?: ClarificationPanel
  ) => {
    setMessages(conversationId, (current) =>
      current.map((message) => {
        if (message.id !== assistantMessageId) return message
        const resolvedPanel = panel ?? readClarification(message)?.panel
        if (!resolvedPanel) return message
        return {
          ...message,
          metadata: {
            ...message.metadata,
            clarification: { panel: resolvedPanel, schema_version: 1, status },
          },
        }
      })
    )
  }

  const removeMessages = (conversationId: string, ids: string[]) => {
    setMessages(conversationId, (current) =>
      current.filter((message) => !ids.includes(message.id))
    )
  }

  /**
   * Handles the clarification-specific HTTP errors of contract §4 for a turn
   * that already added its optimistic USER + assistant messages. Returns
   * false for any other error, which then takes the generic path.
   */
  const handleClarificationHttpError = (
    error: Error,
    conversationId: string,
    optimisticIds: string[],
    submittedPanel: { assistantMessageId: string; panelId: string } | null
  ): boolean => {
    if (!(error instanceof ChatStreamHttpError)) return false

    switch (error.code) {
      case CLARIFICATION_INVALID_CODE: {
        if (!submittedPanel) return false
        removeMessages(conversationId, optimisticIds)
        setClarificationErrors({
          byQuestion: Object.fromEntries(
            error.questionErrors.map((item) => [item.question_id, item.reason])
          ),
          panelId: submittedPanel.panelId,
        })
        toast.error(error.message || "Câu trả lời chưa hợp lệ.")
        return true
      }
      case CLARIFICATION_STALE_CODE: {
        removeMessages(conversationId, optimisticIds)
        if (submittedPanel) {
          clearClarificationDraft(submittedPanel.panelId)
          setClarificationStatus(
            conversationId,
            submittedPanel.assistantMessageId,
            "cancelled"
          )
        }
        toast.error("Câu hỏi đã được trả lời hoặc huỷ")
        void refetchMessages(conversationId)
        return true
      }
      case CLARIFICATION_PENDING_CODE: {
        // A panel opened elsewhere (another tab) - the refetch brings it here.
        removeMessages(conversationId, optimisticIds)
        void refetchMessages(conversationId)
        return true
      }
      case CLARIFICATION_PROCESSING_CODE: {
        removeMessages(conversationId, optimisticIds)
        toast.info("Mình đang xử lý câu trả lời trước")
        setIsAwaitingPreviousAnswer(true)
        void refetchMessages(conversationId).finally(() =>
          setIsAwaitingPreviousAnswer(false)
        )
        return true
      }
      default:
        return false
    }
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

    await runTurn(conversationId, {
      content,
      metadata: null,
      request: { conversationId, message: content },
      submittedPanel: null,
    })
  }

  const submitClarification = async (submission: ClarificationSubmission) => {
    const conversationId = activeConversationId
    const open = deriveOpenPanel(messages)
    if (!conversationId || open?.panel.panel_id !== submission.panel.panel_id) {
      return
    }

    setClarificationErrors(null)
    await runTurn(conversationId, {
      content: submission.summary,
      metadata: { clarification_answers: submission.card },
      request: {
        clarification: {
          action: "submit",
          answers: submission.answers,
          panel_id: submission.panel.panel_id,
        },
        conversationId,
      },
      submittedPanel: {
        assistantMessageId: open.assistantMessageId,
        panelId: open.panel.panel_id,
      },
    })
  }

  // A cancel turn adds no message: the response is just
  // `clarification_closed` + `done` (contract §2).
  const cancelClarification = async () => {
    const conversationId = activeConversationId
    const open = deriveOpenPanel(messages)
    if (!conversationId || !open) return

    const panelId = open.panel.panel_id
    setIsCancellingClarification(true)
    await chatStream.stream(
      {
        clarification: { action: "cancel", panel_id: panelId },
        conversationId,
      },
      {
        onClarificationClosed: () => {
          clearClarificationDraft(panelId)
          setClarificationErrors(null)
          setClarificationStatus(
            conversationId,
            open.assistantMessageId,
            "cancelled"
          )
        },
        onDone: () => {
          setIsCancellingClarification(false)
          void refetchMessages(conversationId)
        },
        onStreamError: (payload) => {
          setIsCancellingClarification(false)
          toast.error(payload.message)
        },
        onError: (error) => {
          setIsCancellingClarification(false)
          if (
            error instanceof ChatStreamHttpError &&
            error.code === CLARIFICATION_STALE_CODE
          ) {
            clearClarificationDraft(panelId)
            setClarificationStatus(
              conversationId,
              open.assistantMessageId,
              "cancelled"
            )
            toast.error("Câu hỏi đã được trả lời hoặc huỷ")
            void refetchMessages(conversationId)
            return
          }
          if (
            error instanceof ChatStreamHttpError &&
            error.status === SERVICE_UNAVAILABLE_STATUS
          ) {
            toast.error("Chưa huỷ được, thử lại nhé")
            return
          }
          toast.error(getErrorMessage(error, "Chưa huỷ được, thử lại nhé"))
        },
      }
    )
  }

  const runTurn = async (
    conversationId: string,
    turn: {
      content: string
      metadata: Message["metadata"]
      request: ChatStreamInput
      submittedPanel: { assistantMessageId: string; panelId: string } | null
    }
  ) => {
    const userMessage: Message = {
      chatModelId: null,
      citations: null,
      content: turn.content,
      conversationId,
      createdAt: nowIso(),
      id: crypto.randomUUID(),
      metadata: turn.metadata,
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
    await chatStream.stream(turn.request, {
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
      onClarification: (panel) => {
        // Lets deriveOpenPanel show the panel before the refetch lands;
        // the server has already stored the same metadata (contract §2).
        setClarificationStatus(
          conversationIdForStream,
          assistantMessageId,
          "open",
          panel
        )
      },
      onDone: () => {
        setIsStreaming(false)
        inFlightRef.current = null
        if (turn.submittedPanel) {
          clearClarificationDraft(turn.submittedPanel.panelId)
        }
        setMessages(conversationIdForStream, (current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? { ...message, status: "COMPLETED" }
              : message
          )
        )
        void refetchMessages(conversationIdForStream)
        // What is left of the quota changed with this turn.
        void queryClient.invalidateQueries({
          queryKey: usageLimitKeys.mine(),
        })
      },
      onWarning: (payload) => {
        // The answer itself is fine - only an AI admin is told what to fix.
        toast.warning(payload.message, { duration: 10_000 })
      },
      onStreamError: (payload) => {
        // Content up to this point already landed via `onChunk` above -
        // kept as-is, never discarded. `event: done` (already suppressed
        // by useChatStream once an error was seen) also means Java has
        // already PATCHed this message ERROR server-side, so - same as
        // `onError` below - refetching now would add nothing but risk a
        // race with that PATCH; the next natural refetch reconciles.
        toast.error(payload.message)
        setIsStreaming(false)
        inFlightRef.current = null
        markFailed(conversationIdForStream, assistantMessageId, payload.message)
      },
      onError: (error) => {
        setIsStreaming(false)
        inFlightRef.current = null
        if (
          handleClarificationHttpError(
            error,
            conversationIdForStream,
            [userMessage.id, assistantMessageId],
            turn.submittedPanel
          )
        ) {
          return
        }
        void queryClient.invalidateQueries({
          queryKey: usageLimitKeys.mine(),
        })
        const errorMessage =
          error instanceof ApiResponseError &&
          error.code === USAGE_LIMIT_EXCEEDED_CODE
            ? describeUsageLimitExceeded(error.errors)
            : getErrorMessage(error, STREAM_FAILED_FALLBACK)
        toast.error(errorMessage)
        // Deliberately not invalidating here: backend-java may not have
        // persisted anything past the USER message (or may be left
        // holding an orphaned STREAMING placeholder) for a failed stream,
        // so refetching now would just replace this clear error bubble
        // with a phantom "still thinking" row. The next natural refetch
        // (reopening the conversation) reconciles with the server as
        // usual.
        setIsStreaming(false)
        inFlightRef.current = null
        markFailed(conversationIdForStream, assistantMessageId, errorMessage)
      },
    })
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

  const openPanel = deriveOpenPanel(messages)

  return {
    activeConversation,
    activeConversationId,
    cancelClarification,
    clarificationErrors:
      clarificationErrors &&
      clarificationErrors.panelId === openPanel?.panel.panel_id
        ? clarificationErrors.byQuestion
        : {},
    isAwaitingPreviousAnswer,
    isCancellingClarification,
    openPanel,
    submitClarification,
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
