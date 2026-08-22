import { lazy } from "react"
import { Navigate, type RouteObject } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import { AuthLayout } from "@/layouts/auth-layout"
import { GuestRoute } from "@/routes/guest-route"

const SignInPage = lazy(async () => {
  const { SignInPage } = await import("@/pages/auth/sign-in-page")
  return { default: SignInPage }
})

export const authRoutes: RouteObject = {
  element: (
    <GuestRoute>
      <AuthLayout />
    </GuestRoute>
  ),
  children: [
    {
      path: ROUTES.signIn,
      element: <SignInPage />,
    },
    {
      path: ROUTES.legacySignIn,
      element: <Navigate replace to={ROUTES.signIn} />,
    },
  ],
}
