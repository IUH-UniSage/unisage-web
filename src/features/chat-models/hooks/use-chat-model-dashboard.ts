import { useMemo, useState } from "react"

import { usePermissions } from "@/features/auth/hooks/use-permissions"
import {
  useCreateChatModelMutation,
  useDeleteChatModelMutation,
  useRecoverChatModelMutation,
  useUpdateChatModelMutation,
} from "@/features/chat-models/queries/use-mutations"
import { useChatModelsQuery } from "@/features/chat-models/queries/use-queries"
import type {
  ChatModel,
  ChatModelSourceType,
  CreateChatModelRequest,
} from "@/features/chat-models/schemas/chat-model-schemas"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { PERMISSIONS } from "@/utils/permissions"

export const CHAT_MODEL_PAGE_SIZE = 12
// The backend paginates server-side, but search/status/source filtering here
// is client-side - fetch every model in one request (matches the rbac
// feature's approach) so filtering and pagination both operate on the full
// set instead of whatever one server page happens to be loaded.
const CHAT_MODEL_FETCH_LIMIT = 500

export type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE"
export type SourceFilter = "ALL" | ChatModelSourceType

const EMPTY_CHAT_MODELS: ChatModel[] = []

function paginate<T>(items: T[], page: number) {
  const start = (page - 1) * CHAT_MODEL_PAGE_SIZE
  return items.slice(start, start + CHAT_MODEL_PAGE_SIZE)
}

export function useChatModelDashboard() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("ALL")

  const chatModelsQuery = useChatModelsQuery(1, CHAT_MODEL_FETCH_LIMIT)
  const createChatModel = useCreateChatModelMutation()
  const updateChatModel = useUpdateChatModelMutation()
  const deleteChatModel = useDeleteChatModelMutation()
  const recoverChatModel = useRecoverChatModelMutation()

  const { canCreate, canDelete, canRead, canUpdate } =
    useResourcePermissions("chat_model")
  const { can } = usePermissions()
  const canRecover = can(PERMISSIONS.chatModelAll)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChatModel, setEditingChatModel] = useState<ChatModel>()
  const [viewingChatModel, setViewingChatModel] = useState<ChatModel>()
  const [statusChatModel, setStatusChatModel] = useState<ChatModel>()

  const rawChatModels = chatModelsQuery.data?.data ?? EMPTY_CHAT_MODELS

  // Filter models based on search & filter criteria
  const filteredChatModels = useMemo(() => {
    return rawChatModels.filter((model) => {
      // Search matching
      const query = search.trim().toLowerCase()
      const matchesSearch =
        !query ||
        model.llmModelName.toLowerCase().includes(query) ||
        (model.llmProvider?.toLowerCase().includes(query) ?? false) ||
        (model.modelSourceRef?.toLowerCase().includes(query) ?? false) ||
        model.apiBaseUrl.toLowerCase().includes(query)

      // Status matching
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && model.isActive) ||
        (statusFilter === "INACTIVE" && !model.isActive)

      // Source matching
      const matchesSource =
        sourceFilter === "ALL" || model.sourceType === sourceFilter

      return matchesSearch && matchesStatus && matchesSource
    })
  }, [rawChatModels, search, statusFilter, sourceFilter])

  const totalItems = filteredChatModels.length
  const totalPages = Math.max(
    1,
    Math.ceil(filteredChatModels.length / CHAT_MODEL_PAGE_SIZE)
  )
  const currentPage = Math.min(page, totalPages)
  const pagedChatModels = paginate(filteredChatModels, currentPage)

  // Summary KPI Metrics
  const stats = useMemo(() => {
    const total = rawChatModels.length
    const active = rawChatModels.filter((m) => m.isActive).length
    const cloud = rawChatModels.filter(
      (m) => m.sourceType === "CLOUD_API"
    ).length
    const selfHosted = rawChatModels.filter(
      (m) => m.sourceType === "SELF_HOSTED"
    ).length
    const totalRpm = rawChatModels
      .filter((m) => m.isActive)
      .reduce((sum, m) => sum + (m.maxRpm || 0), 0)

    return {
      active,
      cloud,
      selfHosted,
      total,
      totalRpm,
    }
  }, [rawChatModels])

  const openCreate = () => {
    setViewingChatModel(undefined)
    setEditingChatModel(undefined)
    setIsDialogOpen(true)
  }

  const openEdit = (chatModel: ChatModel) => {
    setViewingChatModel(undefined)
    setEditingChatModel(chatModel)
    setIsDialogOpen(true)
  }

  const closeDialog = () => setIsDialogOpen(false)

  const openChatModelDetail = (chatModel: ChatModel) =>
    setViewingChatModel(chatModel)

  const closeChatModelDetail = () => setViewingChatModel(undefined)

  const save = async (input: CreateChatModelRequest) => {
    if (editingChatModel) {
      await updateChatModel.mutateAsync({
        chatModelId: editingChatModel.id,
        input,
      })
    } else {
      await createChatModel.mutateAsync(input)
    }

    setIsDialogOpen(false)
  }

  const requestStatusChange = (chatModel: ChatModel) =>
    setStatusChatModel(chatModel)

  const closeStatusDialog = () => setStatusChatModel(undefined)

  const confirmStatusChange = async () => {
    if (!statusChatModel) return

    if (statusChatModel.isActive) {
      await deleteChatModel.mutateAsync(statusChatModel.id)
    } else {
      await recoverChatModel.mutateAsync(statusChatModel.id)
    }

    setStatusChatModel(undefined)
  }

  // Any filter change can shrink totalPages below the page the user was on -
  // jump back to page 1 rather than leaving them stranded past the new end.
  const updateSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const updateStatusFilter = (value: StatusFilter) => {
    setStatusFilter(value)
    setPage(1)
  }

  const updateSourceFilter = (value: SourceFilter) => {
    setSourceFilter(value)
    setPage(1)
  }

  const resetFilters = () => {
    setSearch("")
    setStatusFilter("ALL")
    setSourceFilter("ALL")
    setPage(1)
  }

  const isFiltered =
    Boolean(search.trim()) || statusFilter !== "ALL" || sourceFilter !== "ALL"

  return {
    canCreate,
    canDelete,
    canRead,
    canRecover,
    canUpdate,
    chatModels: pagedChatModels,
    closeChatModelDetail,
    closeDialog,
    closeStatusDialog,
    confirmStatusChange,
    editingChatModel,
    isDialogOpen,
    isFiltered,
    isPending: chatModelsQuery.isPending,
    isSaving: createChatModel.isPending || updateChatModel.isPending,
    isUpdatingStatus: deleteChatModel.isPending || recoverChatModel.isPending,
    openChatModelDetail,
    openCreate,
    openEdit,
    page: currentPage,
    requestStatusChange,
    resetFilters,
    save,
    search,
    setPage,
    setSearch: updateSearch,
    setSourceFilter: updateSourceFilter,
    setStatusFilter: updateStatusFilter,
    sourceFilter,
    stats,
    statusChatModel,
    statusFilter,
    totalItems,
    totalPages,
    viewingChatModel,
  }
}
