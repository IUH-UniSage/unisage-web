import { useDeferredValue, useMemo, useState } from "react"

import {
  useCreateAccessLevelMutation,
  useDeleteAccessLevelMutation,
  useUpdateAccessLevelMutation,
} from "@/features/access-level/queries/use-mutations"
import { useAccessLevelsQuery } from "@/features/access-level/queries/use-queries"
import type {
  AccessLevel,
  CreateAccessLevelRequest,
} from "@/features/access-level/schemas/access-level-schemas"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSIONS } from "@/utils/permissions"

const EMPTY_ACCESS_LEVELS: AccessLevel[] = []
export const ACCESS_LEVEL_PAGE_SIZE = 10

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function useAccessLevelDashboard() {
  const accessLevelsQuery = useAccessLevelsQuery()
  const createAccessLevel = useCreateAccessLevelMutation()
  const updateAccessLevel = useUpdateAccessLevelMutation()
  const deleteAccessLevel = useDeleteAccessLevelMutation()
  const { can } = usePermissions()

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccessLevel, setEditingAccessLevel] = useState<AccessLevel>()
  const [deletingAccessLevel, setDeletingAccessLevel] = useState<AccessLevel>()

  const accessLevels = accessLevelsQuery.data ?? EMPTY_ACCESS_LEVELS
  const deferredSearch = useDeferredValue(search)

  const filteredAccessLevels = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLocaleLowerCase("vi")

    if (!normalizedSearch) return accessLevels

    return accessLevels.filter((accessLevel) =>
      [String(accessLevel.level), accessLevel.description]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(normalizedSearch)
    )
  }, [accessLevels, deferredSearch])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccessLevels.length / ACCESS_LEVEL_PAGE_SIZE)
  )
  const currentPage = Math.min(page, totalPages)

  const openCreate = () => {
    setEditingAccessLevel(undefined)
    setIsDialogOpen(true)
  }

  const openEdit = (accessLevel: AccessLevel) => {
    setEditingAccessLevel(accessLevel)
    setIsDialogOpen(true)
  }

  const closeDialog = () => setIsDialogOpen(false)

  const save = async (input: CreateAccessLevelRequest) => {
    if (editingAccessLevel) {
      await updateAccessLevel.mutateAsync({
        accessLevelId: editingAccessLevel.id,
        input,
      })
    } else {
      await createAccessLevel.mutateAsync(input)
    }

    setIsDialogOpen(false)
  }

  const requestDelete = (accessLevel: AccessLevel) =>
    setDeletingAccessLevel(accessLevel)

  const closeDeleteDialog = () => setDeletingAccessLevel(undefined)

  const confirmDelete = async () => {
    if (!deletingAccessLevel) return

    await deleteAccessLevel.mutateAsync(deletingAccessLevel.id)
    setDeletingAccessLevel(undefined)
  }

  return {
    accessLevels,
    canCreate: can(PERMISSIONS.accessLevelCreate),
    canDelete: can(PERMISSIONS.accessLevelDelete),
    canUpdate: can(PERMISSIONS.accessLevelUpdate),
    closeDeleteDialog,
    closeDialog,
    confirmDelete,
    deletingAccessLevel,
    editingAccessLevel,
    filteredCount: filteredAccessLevels.length,
    isDeleting: deleteAccessLevel.isPending,
    isDialogOpen,
    isPending: accessLevelsQuery.isPending,
    isSaving: createAccessLevel.isPending || updateAccessLevel.isPending,
    openCreate,
    openEdit,
    page: currentPage,
    pagedAccessLevels: paginate(
      filteredAccessLevels,
      currentPage,
      ACCESS_LEVEL_PAGE_SIZE
    ),
    requestDelete,
    save,
    search,
    setPage,
    setSearch: (value: string) => {
      setSearch(value)
      setPage(1)
    },
    totalPages,
  }
}
