import axios from "axios"
import type { ZodType } from "zod"

import { getAiErrorCodeMessage } from "@/constants/ai-error-codes"
import { getErrorMessage } from "@/utils/error-handler"

// unisage-agent (FastAPI) returns the Pydantic model directly on success -
// no {code, data, errors, message} envelope like Java's ApiResponse - and
// {error_code, message, details} on error (see app/main.py's
// unisage_exception_handler). readSuccessData/readApiResponse assume Java's
// envelope and would throw a Zod parse error on every successful AI-agent
// call, so this reads the payload as-is instead of unwrapping it.
export function readAiSuccessData<T>(
  payload: unknown,
  dataSchema: ZodType<T>
): T {
  return dataSchema.parse(payload)
}

export type AiErrorResponse = {
  details?: Record<string, unknown> | null
  error_code?: string
  message?: string
}

/**
 * Same job as error-handler.ts's getErrorMessage, but consults
 * ai-error-codes.ts's map (keyed by unisage-agent's string error_code)
 * first, since that map's Vietnamese messages should win over the raw
 * English message string the backend sent - getErrorMessage's generic axios
 * fallback (used for anything not mapped here) already returns
 * payload.message, so no change needed there.
 */
export function getAiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<AiErrorResponse>(error)) {
    const errorCode = error.response?.data?.error_code
    const mapped = errorCode ? getAiErrorCodeMessage(errorCode) : undefined

    if (mapped) return mapped
  }

  return getErrorMessage(error)
}
