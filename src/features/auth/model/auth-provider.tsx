import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { PropsWithChildren } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  AuthContext,
  type AuthenticationStatus,
} from "@/features/auth/model/auth-context"
import { createSessionFromResponse } from "@/features/auth/utils/auth-session"
import {
  useLoginMutation,
  useLogoutMutation,
  useRefreshSessionMutation,
} from "@/features/auth/queries/use-mutations"
import type {
  AuthSession,
  LoginRequest,
  RefreshResponse,
} from "@/features/auth/schemas/auth-schemas"
import {
  authSessionSchema,
  refreshResponseSchema,
} from "@/features/auth/schemas/auth-schemas"
import { readSuccessData } from "@/utils/api-response"
import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_SESSION_REFRESHED_EVENT,
  clearLegacyAuthentication,
} from "@/lib/axios-client"
import { STORAGE_KEYS, storage } from "@/utils/local-storage"

function readCachedSession(): AuthSession | null {
  return storage.getValid(STORAGE_KEYS.userProfile, authSessionSchema)
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const { mutateAsync: requestLogin } = useLoginMutation()
  const { mutateAsync: requestLogout } = useLogoutMutation()
  const { mutateAsync: refreshSession } = useRefreshSessionMutation()
  const [initialSession] = useState(readCachedSession)
  const [session, setSession] = useState<AuthSession | null>(initialSession)
  const [status, setStatus] = useState<AuthenticationStatus>(
    initialSession ? "loading" : "unauthenticated"
  )
  const refreshRequest = useRef<Promise<RefreshResponse> | null>(null)

  const persistSession = useCallback((nextSession: AuthSession) => {
    storage.set(STORAGE_KEYS.userProfile, nextSession)
    setSession(nextSession)
    setStatus("authenticated")
  }, [])

  const clearSession = useCallback(() => {
    clearLegacyAuthentication()
    storage.remove(STORAGE_KEYS.userProfile)
    setSession(null)
    setStatus("unauthenticated")
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    clearLegacyAuthentication()

    if (!initialSession) {
      return
    }

    let active = true
    refreshRequest.current ??= refreshSession()

    refreshRequest.current
      .then((response) => {
        if (active) persistSession(createSessionFromResponse(response))
      })
      .catch(() => {
        if (active) clearSession()
      })

    return () => {
      active = false
    }
  }, [clearSession, initialSession, persistSession, refreshSession])

  useEffect(() => {
    const handleExpiredSession = () => clearSession()
    const handleRefreshedSession = (event: Event) => {
      if (!(event instanceof CustomEvent)) return

      try {
        const response = readSuccessData(event.detail, refreshResponseSchema)
        persistSession(createSessionFromResponse(response))
      } catch {
        clearSession()
      }
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession)
    window.addEventListener(
      AUTH_SESSION_REFRESHED_EVENT,
      handleRefreshedSession
    )
    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleExpiredSession
      )
      window.removeEventListener(
        AUTH_SESSION_REFRESHED_EVENT,
        handleRefreshedSession
      )
    }
  }, [clearSession, persistSession])

  const login = useCallback(
    async (input: LoginRequest): Promise<AuthSession> => {
      const response = await requestLogin(input)
      const nextSession = createSessionFromResponse(response)
      persistSession(nextSession)
      return nextSession
    },
    [persistSession, requestLogin]
  )

  const logout = useCallback(async () => {
    try {
      await requestLogout()
    } finally {
      clearSession()
    }
  }, [clearSession, requestLogout])

  const value = useMemo(
    () => ({
      login,
      logout,
      session,
      status,
    }),
    [login, logout, session, status]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
