import { useMutation } from "@tanstack/react-query"

import { authApi } from "@/features/auth/api/auth-api"
import { authKeys } from "@/features/auth/queries/keys"
import type { LoginRequest } from "@/features/auth/schemas/auth-schemas"

const authMutationMeta = {
  suppressGlobalError: true,
} as const

export function useLoginMutation() {
  return useMutation({
    meta: authMutationMeta,
    mutationFn: (input: LoginRequest) => authApi.login(input),
    mutationKey: authKeys.login(),
  })
}

export function useLogoutMutation() {
  return useMutation({
    meta: authMutationMeta,
    mutationFn: () => authApi.logout(),
    mutationKey: authKeys.logout(),
  })
}

export function useRefreshSessionMutation() {
  return useMutation({
    meta: authMutationMeta,
    mutationFn: () => authApi.refresh(),
    mutationKey: authKeys.refresh(),
  })
}

export function useSelectProfileMutation() {
  return useMutation({
    meta: authMutationMeta,
    mutationFn: (userId: string) => authApi.selectProfile(userId),
    mutationKey: authKeys.selectProfile(),
  })
}
