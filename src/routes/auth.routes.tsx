import type { RouteObject } from "react-router-dom"

import { AuthLayout } from "@/layouts/auth-layout"
import { SignInPage } from "@/pages/auth/sign-in-page"
import { SignUpPage } from "@/pages/auth/sign-up-page"

export const authRoutes: RouteObject = {
  element: <AuthLayout />,
  children: [
    { path: "login", element: <SignInPage /> },
    { path: "register", element: <SignUpPage /> },
  ],
}
