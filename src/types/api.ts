export type ApiResponse<T = unknown> = {
  code: number
  data?: T | null
  errors?: Record<string, string> | null
  message: string
}

export type PageResponse<T> = {
  data: T
  limit: number
  page: number
  totalItems: number
  totalPages: number
}
