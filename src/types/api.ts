export type ApiResponse<T = unknown> = {
  code: number
  data: T | null
  errors?: Record<string, string> | null
  message: string
}
