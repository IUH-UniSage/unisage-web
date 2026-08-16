import type { ZodType } from "zod"
import { z } from "zod"

import type { ApiResponse } from "@/types/api"

export const API_SUCCESS_CODE = 1000

export class ApiResponseError extends Error {
  readonly code: number
  readonly errors?: Record<string, string> | null

  constructor(response: ApiResponse<unknown>) {
    super(response.message)
    this.name = "ApiResponseError"
    this.code = response.code
    this.errors = response.errors
  }
}

export const apiResponseSchema = <T>(dataSchema: ZodType<T>) =>
  z.object({
    code: z.number(),
    data: dataSchema.nullish(),
    errors: z.record(z.string(), z.string()).nullish(),
    message: z.string(),
  })

export function readApiResponse<T>(
  payload: unknown,
  dataSchema: ZodType<T>
): ApiResponse<T> {
  const response = apiResponseSchema(dataSchema).parse(payload)

  if (response.code !== API_SUCCESS_CODE) {
    throw new ApiResponseError(response)
  }

  return response
}

export function readSuccessData<T>(
  payload: unknown,
  dataSchema: ZodType<T>
): T {
  const response = readApiResponse(payload, dataSchema)

  if (response.data == null) {
    throw new ApiResponseError(response)
  }

  return response.data
}
