import { lazy } from "react"
import { Navigate, type RouteObject } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import { AuthLayout } from "@/layouts/auth-layout"

const SignInPage = lazy(async () => {
  const { SignInPage } = await import("@/pages/auth/sign-in-page")
  return { default: SignInPage }
})

const SignUpPage = lazy(async () => {
  const { SignUpPage } = await import("@/pages/auth/sign-up-page")
  return { default: SignUpPage }
})

export const authRoutes: RouteObject = {
  element: <AuthLayout />,
  children: [
    {
      path: ROUTES.signIn,
      element: <SignInPage />,
    },
    {
      path: ROUTES.legacySignIn,
      element: <Navigate replace to={ROUTES.signIn} />,
    },
    {
      path: ROUTES.signUp,
      element: <SignUpPage />,
    },
    {
      path: ROUTES.legacySignUp,
      element: <Navigate replace to={ROUTES.signUp} />,
    },
  ],
}
