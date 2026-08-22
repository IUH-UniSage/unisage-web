import { createContext } from "react"

import type {
  AuthSession,
  LoginRequest,
} from "@/features/auth/schemas/auth-schemas"

export type AuthenticationStatus =
  "authenticated" | "loading" | "unauthenticated"

export type AuthContextValue = {
  login: (input: LoginRequest) => Promise<AuthSession>
  logout: () => Promise<void>
  session: AuthSession | null
  status: AuthenticationStatus
}

export const AuthContext = createContext<AuthContextValue | null>(null)
