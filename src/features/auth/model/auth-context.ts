import { createContext } from "react"

import type {
  AuthSession,
  LoginRequest,
  UserProfile,
} from "@/features/auth/schemas/auth-schemas"

export type AuthenticationStatus =
  "authenticated" | "loading" | "unauthenticated"

export type PendingProfileSelection = {
  code: string
  email: string
  profiles: UserProfile[]
}

export type LoginResult = {
  requiresProfileSelection: boolean
  session: AuthSession | null
}

export type AuthContextValue = {
  login: (input: LoginRequest) => Promise<LoginResult>
  logout: () => Promise<void>
  pendingProfileSelection: PendingProfileSelection | null
  resetPendingProfileSelection: () => void
  selectProfile: (userId: string) => Promise<AuthSession>
  session: AuthSession | null
  status: AuthenticationStatus
}

export const AuthContext = createContext<AuthContextValue | null>(null)
