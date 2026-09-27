import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import axios from "axios"

import { ApiResponseError } from "@/utils/api-response"

export type ApiErrorResponse = {
  code?: number | string
  data?: Record<string, unknown> | null
  error?: {
    message?: string
  }
  errors?: Array<{ message?: string }> | Record<string, string> | null
  message?: string
}

const DEFAULT_ERROR_MESSAGE = "Đã xảy ra lỗi. Vui lòng thử lại."

function firstString(...values: unknown[]): string | undefined {
  return values.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  )
}

// Both backends (Java's `ApiResponse`, unisage-agent's `ApiResponse`) now
// return `{code, message, ...}` on error, and both author `message` directly
// in Vietnamese - this reads the backend's own message as-is, same as
// before unisage-agent adopted the shared envelope. `constants/error-codes.ts`
// (keyed by the same numeric `code`) is a separate, deliberately unused-here
// override map, only consulted by `ApiResponseError` for the rare "2xx HTTP
// status but code !== 1000" case.
export function getErrorMessage(
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return error instanceof Error && error.message ? error.message : fallback
  }

  const payload = error.response?.data
  const firstArrayError = Array.isArray(payload?.errors)
    ? payload.errors.find((item) => item.message)?.message
    : undefined
  const firstObjectError =
    payload?.errors &&
    !Array.isArray(payload.errors) &&
    typeof payload.errors === "object"
      ? Object.values(payload.errors).find(Boolean)
      : undefined

  return (
    firstString(
      payload?.message,
      payload?.error?.message,
      payload?.data?.message,
      firstArrayError,
      firstObjectError,
      error.message
    ) ?? fallback
  )
}

// The numeric `code` from the backend's `{code, message, ...}` envelope, for
// call sites that need to react to one specific error (e.g. surface it on a
// particular form field) rather than just displaying `getErrorMessage`.
export function getErrorCode(error: unknown): number | undefined {
  if (error instanceof ApiResponseError) return error.code
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return undefined

  const code = error.response?.data?.code
  return typeof code === "number" ? code : undefined
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiResponseError) return error.errors ?? {}
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return {}

  const payload = error.response?.data
  const candidate =
    payload?.errors &&
    !Array.isArray(payload.errors) &&
    typeof payload.errors === "object"
      ? payload.errors
      : payload?.data

  if (!candidate || typeof candidate !== "object") return {}

  return Object.fromEntries(
    Object.entries(candidate).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].trim().length > 0
    )
  )
}

export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): boolean {
  const fieldErrors = Object.entries(getFieldErrors(error))

  fieldErrors.forEach(([field, message]) => {
    setError(field as Path<T>, { message, type: "server" })
  })

  return fieldErrors.length > 0
}
