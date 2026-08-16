import { useCallback, useEffect, useMemo, useState } from "react"
import type { PropsWithChildren } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  AuthContext,
  type AuthenticationStatus,
  type LoginResult,
  type PendingProfileSelection,
} from "@/features/auth/model/auth-context"
import {
  createSessionFromLogin,
  createSessionFromSelectedProfile,
} from "@/features/auth/lib/auth-session"
import {
  useLoginMutation,
  useLogoutMutation,
  useRefreshSessionMutation,
  useSelectProfileMutation,
} from "@/features/auth/queries/use-mutations"
import type {
  AuthSession,
  LoginRequest,
} from "@/features/auth/schemas/auth-schemas"
import { authSessionSchema } from "@/features/auth/schemas/auth-schemas"
import {
  AUTH_SESSION_EXPIRED_EVENT,
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
  const { mutateAsync: requestProfileSelection } = useSelectProfileMutation()
  const [initialSession] = useState(readCachedSession)
  const [session, setSession] = useState<AuthSession | null>(initialSession)
  const [status, setStatus] = useState<AuthenticationStatus>(
    initialSession ? "loading" : "unauthenticated"
  )
  const [pendingProfileSelection, setPendingProfileSelection] =
    useState<PendingProfileSelection | null>(null)

  const persistSession = useCallback((nextSession: AuthSession) => {
    storage.set(STORAGE_KEYS.userProfile, nextSession)
    setSession(nextSession)
    setStatus("authenticated")
  }, [])

  const clearSession = useCallback(() => {
    clearLegacyAuthentication()
    storage.remove(STORAGE_KEYS.userProfile)
    setPendingProfileSelection(null)
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

    refreshSession()
      .then(() => {
        if (active) setStatus("authenticated")
      })
      .catch(() => {
        if (active) clearSession()
      })

    return () => {
      active = false
    }
  }, [clearSession, initialSession, refreshSession])

  useEffect(() => {
    const handleExpiredSession = () => clearSession()

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession)
    return () =>
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleExpiredSession
      )
  }, [clearSession])

  const login = useCallback(
    async (input: LoginRequest): Promise<LoginResult> => {
      const response = await requestLogin(input)

      if (response.profiles.length === 0) {
        throw new Error("Tài khoản chưa có hồ sơ sử dụng UniSage.")
      }

      if (response.profiles.length === 1 && response.accessToken) {
        const nextSession = createSessionFromLogin(
          response,
          response.profiles[0]
        )
        persistSession(nextSession)

        return {
          requiresProfileSelection: false,
          session: nextSession,
        }
      }

      setPendingProfileSelection({
        code: response.code,
        email: response.email,
        profiles: response.profiles,
      })

      return {
        requiresProfileSelection: true,
        session: null,
      }
    },
    [persistSession, requestLogin]
  )

  const selectProfile = useCallback(
    async (userId: string): Promise<AuthSession> => {
      const response = await requestProfileSelection(userId)
      const nextSession = createSessionFromSelectedProfile(response, userId)
      persistSession(nextSession)
      setPendingProfileSelection(null)

      return nextSession
    },
    [persistSession, requestProfileSelection]
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
      pendingProfileSelection,
      resetPendingProfileSelection: () => setPendingProfileSelection(null),
      selectProfile,
      session,
      status,
    }),
    [login, logout, pendingProfileSelection, selectProfile, session, status]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
