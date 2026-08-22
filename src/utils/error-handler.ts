import { isAxiosError } from "axios"

interface ApiErrorPayload {
  message?: string
  error?: string
}

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again."

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data
    return (
      payload?.message ??
      payload?.error ??
      error.message ??
      DEFAULT_ERROR_MESSAGE
    )
  }

  if (error instanceof Error) {
    return error.message || DEFAULT_ERROR_MESSAGE
  }

  if (typeof error === "string") {
    return error
  }

  return DEFAULT_ERROR_MESSAGE
}

export function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404
}

export function isUnauthorizedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401
}
