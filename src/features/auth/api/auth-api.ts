import type { ZodType } from "zod"
import { z } from "zod"

import type {
  AuthResponse,
  LoginRequest,
  RefreshResponse,
  SelectProfileResponse,
} from "@/features/auth/schemas/auth-schemas"
import {
  authResponseSchema,
  loginRequestSchema,
  refreshResponseSchema,
  selectProfileRequestSchema,
  selectProfileResponseSchema,
} from "@/features/auth/schemas/auth-schemas"
import { httpClient } from "@/lib/axios-client"

const apiResponseSchema = <T>(dataSchema: ZodType<T>) =>
  z.object({
    code: z.number(),
    data: dataSchema.nullable(),
    errors: z.record(z.string(), z.string()).nullish(),
    message: z.string(),
  })

function readSuccessData<T>(payload: unknown, dataSchema: ZodType<T>): T {
  const response = apiResponseSchema(dataSchema).parse(payload)

  if (response.code !== 1000 || response.data === null) {
    throw new Error(response.message)
  }

  return response.data
}

export const authApi = {
  async login(input: LoginRequest): Promise<AuthResponse> {
    const request = loginRequestSchema.parse(input)
    const response = await httpClient.post("/auth/login", request)

    return readSuccessData(response.data, authResponseSchema)
  },

  async logout(): Promise<void> {
    await httpClient.post("/auth/logout")
  },

  async refresh(): Promise<RefreshResponse> {
    const response = await httpClient.post("/auth/refresh")

    return readSuccessData(response.data, refreshResponseSchema)
  },

  async selectProfile(userId: string): Promise<SelectProfileResponse> {
    const request = selectProfileRequestSchema.parse({ userId })
    const response = await httpClient.post("/auth/select-profile", request)

    return readSuccessData(response.data, selectProfileResponseSchema)
  },
}
