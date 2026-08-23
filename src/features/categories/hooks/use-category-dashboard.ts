import { useDeferredValue, useMemo, useState } from "react"

import {
  useCreateCategoryMutation,
  useDeactivateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/categories/queries/use-mutations"
import { useCategoriesQuery } from "@/features/categories/queries/use-queries"
import type {
  Category,
  CreateCategoryRequest,
} from "@/features/categories/schemas/category-schemas"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { PERMISSIONS } from "@/utils/permissions"

const EMPTY_CATEGORIES: Category[] = []
export const CATEGORY_PAGE_SIZE = 10

type StatusFilter = "active" | "all" | "inactive"

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function useCategoryDashboard() {
  const categoriesQuery = useCategoriesQuery()
  const createCategory = useCreateCategoryMutation()
  const updateCategory = useUpdateCategoryMutation()
  const deactivateCategory = useDeactivateCategoryMutation()
  const { can } = usePermissions()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category>()
  const [deactivatingCategory, setDeactivatingCategory] = useState<Category>()

  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES
  const deferredSearch = useDeferredValue(search)

  const filteredCategories = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLocaleLowerCase("vi")

    return categories.filter((category) => {
      if (statusFilter === "active" && !category.isActive) return false
      if (statusFilter === "inactive" && category.isActive) return false

      if (!normalizedSearch) return true

      return [category.name, category.description]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(normalizedSearch)
    })
  }, [categories, deferredSearch, statusFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / CATEGORY_PAGE_SIZE)
  )
  const currentPage = Math.min(page, totalPages)

  const openCreate = () => {
    setEditingCategory(undefined)
    setIsDialogOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const closeDialog = () => setIsDialogOpen(false)

  const save = async (input: CreateCategoryRequest) => {
    if (editingCategory) {
      await updateCategory.mutateAsync({
        categoryId: editingCategory.id,
        input,
      })
    } else {
      await createCategory.mutateAsync(input)
    }

    setIsDialogOpen(false)
  }

  const requestDeactivate = (category: Category) =>
    setDeactivatingCategory(category)

  const closeDeactivateDialog = () => setDeactivatingCategory(undefined)

  const confirmDeactivate = async () => {
    if (!deactivatingCategory) return

    await deactivateCategory.mutateAsync(deactivatingCategory.id)
    setDeactivatingCategory(undefined)
  }

  return {
    canCreate: can(PERMISSIONS.categoryCreate),
    canDelete: can(PERMISSIONS.categoryDelete),
    canUpdate: can(PERMISSIONS.categoryUpdate),
    categories,
    closeDeactivateDialog,
    closeDialog,
    confirmDeactivate,
    deactivatingCategory,
    editingCategory,
    filteredCount: filteredCategories.length,
    isDeactivating: deactivateCategory.isPending,
    isDialogOpen,
    isPending: categoriesQuery.isPending,
    isSaving: createCategory.isPending || updateCategory.isPending,
    openCreate,
    openEdit,
    page: currentPage,
    pagedCategories: paginate(
      filteredCategories,
      currentPage,
      CATEGORY_PAGE_SIZE
    ),
    requestDeactivate,
    save,
    search,
    setPage,
    setSearch: (value: string) => {
      setSearch(value)
      setPage(1)
    },
    setStatusFilter: (value: StatusFilter) => {
      setStatusFilter(value)
      setPage(1)
    },
    statusFilter,
    totalPages,
  }
}
