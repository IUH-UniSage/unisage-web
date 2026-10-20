import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { usePermissions } from "@/features/auth/hooks/use-permissions"
import {
  useCancelEmbeddingReindexMutation,
  useCreateChatModelMutation,
  useDeleteChatModelMutation,
  useRecoverChatModelMutation,
  useStartEmbeddingReindexMutation,
  useUpdateChatModelMutation,
  useUpdateChatModelStatusMutation,
  useVerifyChatModelMutation,
} from "@/features/chat-models/queries/use-mutations"
import { useChatModelsQuery } from "@/features/chat-models/queries/use-queries"
import type {
  ChatModel,
  ChatModelPurpose,
  ChatModelStatus,
  CreateChatModelRequest,
} from "@/features/chat-models/schemas/chat-model-schemas"
import {
  EMBEDDING_REINDEX_REQUIRED_CODE,
  type EmbeddingReindexRun,
} from "@/features/chat-models/schemas/embedding-index-schemas"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { getErrorCode, getErrorMessage } from "@/utils/error-handler"
import { PERMISSIONS } from "@/utils/permissions"

export const CHAT_MODEL_PAGE_SIZE = 12

// Soft-delete axis (BaseEntity.isActive) - "ACTIVE" (the default) sends
// isActive=true to the backend so a fresh page load only shows
// non-soft-deleted rows, separate from the ChatModelStatus state machine below.
export type ActiveFilter = "ALL" | "ACTIVE" | "INACTIVE"
export type PurposeFilter = "ALL" | ChatModelPurpose
export type ModelStatusFilter = "ALL" | ChatModelStatus
export type PrioritySort = "asc" | "desc"

const EMPTY_CHAT_MODELS: ChatModel[] = []

const PARAM_DEFAULTS = {
  active: "ACTIVE",
  modelStatus: "ALL",
  page: "1",
  purpose: "ALL",
  q: "",
  sort: "asc",
} as const

type Param = keyof typeof PARAM_DEFAULTS

// Short keys keep the URL readable; only this map needs to change if a param
// is renamed - the rest of the hook keeps using the descriptive Param names.
const URL_PARAM_KEYS = {
  active: "active",
  modelStatus: "status",
  page: "page",
  purpose: "purpose",
  q: "q",
  sort: "sort",
} as const satisfies Record<Param, string>

// Admin list: filters are drafted in the toolbar and only applied (and only
// then sent to the backend) when the SA clicks "Lọc" - and applied filters
// live in the URL so a refresh never loses them.
export function useChatModelDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()

  const getParam = (key: Param) =>
    searchParams.get(URL_PARAM_KEYS[key]) ?? PARAM_DEFAULTS[key]

  const setParams = (updates: Partial<Record<Param, string>>) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const key of Object.keys(updates) as Param[]) {
          const value = updates[key]
          const urlKey = URL_PARAM_KEYS[key]
          if (value === undefined || value === PARAM_DEFAULTS[key]) {
            next.delete(urlKey)
          } else {
            next.set(urlKey, value)
          }
        }
        return next
      },
      { replace: true }
    )
  }

  const getPage = () => {
    const page = Number.parseInt(getParam("page"), 10)
    return Number.isFinite(page) && page > 0 ? page : 1
  }

  const appliedQ = getParam("q")
  const appliedPurpose = getParam("purpose") as PurposeFilter
  const appliedModelStatus = getParam("modelStatus") as ModelStatusFilter
  const appliedActive = getParam("active") as ActiveFilter
  const appliedSort = getParam("sort") as PrioritySort
  const page = getPage()

  const [draftQ, setDraftQ] = useState(appliedQ)
  const [draftPurpose, setDraftPurpose] =
    useState<PurposeFilter>(appliedPurpose)
  const [draftModelStatus, setDraftModelStatus] =
    useState<ModelStatusFilter>(appliedModelStatus)
  const [draftActive, setDraftActive] = useState<ActiveFilter>(appliedActive)
  const [draftSort, setDraftSort] = useState<PrioritySort>(appliedSort)

  const chatModelsQuery = useChatModelsQuery({
    isActive: appliedActive === "ALL" ? undefined : appliedActive === "ACTIVE",
    modelPurpose: appliedPurpose === "ALL" ? undefined : appliedPurpose,
    page,
    q: appliedQ,
    size: CHAT_MODEL_PAGE_SIZE,
    sort: appliedSort,
    status: appliedModelStatus === "ALL" ? undefined : appliedModelStatus,
  })
  const createChatModel = useCreateChatModelMutation()
  const updateChatModel = useUpdateChatModelMutation()
  const deleteChatModel = useDeleteChatModelMutation()
  const recoverChatModel = useRecoverChatModelMutation()
  const updateChatModelStatus = useUpdateChatModelStatusMutation()
  const verifyChatModel = useVerifyChatModelMutation()
  const startEmbeddingReindex = useStartEmbeddingReindexMutation()
  const cancelEmbeddingReindex = useCancelEmbeddingReindexMutation()

  const { canCreate, canDelete, canRead, canUpdate } =
    useResourcePermissions("chat_model")
  const { can, canAny } = usePermissions()
  const canRecover = can(PERMISSIONS.chatModelAll)
  const canReindex = canAny([
    PERMISSIONS.chatModelReindex,
    PERMISSIONS.chatModelAll,
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChatModel, setEditingChatModel] = useState<ChatModel>()
  const [viewingChatModel, setViewingChatModel] = useState<ChatModel>()
  const [statusChatModel, setStatusChatModel] = useState<ChatModel>()
  // Open re-index dialog; `modelId` is the model whose activation needed it.
  const [reindexDialog, setReindexDialog] = useState<{ modelId?: string }>()
  const [cancellingRun, setCancellingRun] = useState<EmbeddingReindexRun>()

  const chatModels = chatModelsQuery.data?.data ?? EMPTY_CHAT_MODELS

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

  // "status" here is the ACTIVE/INACTIVE/PENDING/DISABLED state machine, a
  // separate axis from the isActive soft-delete toggle above.
  // An EMBEDDING model whose vectors differ from the live index cannot be
  // activated directly: offer to re-index into it instead (UNISAGE-103).
  const activateChatModel = async (chatModel: ChatModel) => {
    try {
      await updateChatModelStatus.mutateAsync({
        chatModelId: chatModel.id,
        status: "ACTIVE",
      })
    } catch (error) {
      if (
        canReindex &&
        chatModel.modelPurpose === "EMBEDDING" &&
        getErrorCode(error) === EMBEDDING_REINDEX_REQUIRED_CODE
      ) {
        setReindexDialog({ modelId: chatModel.id })
        return
      }
      toast.error(getErrorMessage(error))
    }
  }

  const deactivateChatModel = async (chatModel: ChatModel) => {
    try {
      await updateChatModelStatus.mutateAsync({
        chatModelId: chatModel.id,
        status: "INACTIVE",
      })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const openReindexDialog = () => setReindexDialog({})
  const closeReindexDialog = () => setReindexDialog(undefined)

  const confirmReindex = async (chatModelId: string) => {
    await startEmbeddingReindex.mutateAsync(chatModelId)
    setReindexDialog(undefined)
  }

  const requestReindexCancel = (run: EmbeddingReindexRun) =>
    setCancellingRun(run)
  const closeReindexCancel = () => setCancellingRun(undefined)

  const confirmReindexCancel = async () => {
    if (!cancellingRun) return
    await cancelEmbeddingReindex.mutateAsync(cancellingRun.id)
    setCancellingRun(undefined)
  }

  const reverifyChatModel = (chatModel: ChatModel) =>
    verifyChatModel.mutateAsync(chatModel.id)

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

  const applyFilters = () => {
    setParams({
      active: draftActive,
      modelStatus: draftModelStatus,
      page: PARAM_DEFAULTS.page,
      purpose: draftPurpose,
      q: draftQ.trim(),
      sort: draftSort,
    })
  }

  const resetFilters = () => {
    setDraftQ(PARAM_DEFAULTS.q)
    setDraftPurpose(PARAM_DEFAULTS.purpose)
    setDraftModelStatus(PARAM_DEFAULTS.modelStatus)
    setDraftActive(PARAM_DEFAULTS.active)
    setDraftSort(PARAM_DEFAULTS.sort)
    setParams({
      active: PARAM_DEFAULTS.active,
      modelStatus: PARAM_DEFAULTS.modelStatus,
      page: PARAM_DEFAULTS.page,
      purpose: PARAM_DEFAULTS.purpose,
      q: PARAM_DEFAULTS.q,
      sort: PARAM_DEFAULTS.sort,
    })
  }

  const isFiltered =
    Boolean(appliedQ.trim()) ||
    appliedPurpose !== "ALL" ||
    appliedModelStatus !== "ALL" ||
    appliedActive !== "ACTIVE" ||
    appliedSort !== "asc"

  return {
    activateChatModel,
    activeFilter: draftActive,
    applyFilters,
    canCreate,
    canDelete,
    canRead,
    canRecover,
    canReindex,
    canUpdate,
    cancellingRun,
    chatModels,
    closeChatModelDetail,
    closeDialog,
    closeReindexCancel,
    closeReindexDialog,
    closeStatusDialog,
    confirmReindex,
    confirmReindexCancel,
    confirmStatusChange,
    deactivateChatModel,
    editingChatModel,
    isDialogOpen,
    isFiltered,
    isPending: chatModelsQuery.isPending,
    isSaving: createChatModel.isPending || updateChatModel.isPending,
    isUpdatingChatModelStatus: updateChatModelStatus.isPending,
    isCancellingReindex: cancelEmbeddingReindex.isPending,
    isStartingReindex: startEmbeddingReindex.isPending,
    isUpdatingStatus: deleteChatModel.isPending || recoverChatModel.isPending,
    isVerifying: verifyChatModel.isPending,
    modelStatusFilter: draftModelStatus,
    openChatModelDetail,
    openCreate,
    openEdit,
    openReindexDialog,
    page,
    prioritySort: draftSort,
    purposeFilter: draftPurpose,
    reindexDialog,
    requestReindexCancel,
    requestStatusChange,
    resetFilters,
    reverifyChatModel,
    save,
    search: draftQ,
    setActiveFilter: setDraftActive,
    setModelStatusFilter: setDraftModelStatus,
    setPage: (value: number) => setParams({ page: String(value) }),
    setPrioritySort: setDraftSort,
    setPurposeFilter: setDraftPurpose,
    setSearch: setDraftQ,
    statusChatModel,
    totalItems: chatModelsQuery.data?.totalItems ?? 0,
    totalPages: chatModelsQuery.data?.totalPages ?? 1,
    viewingChatModel,
  }
}
