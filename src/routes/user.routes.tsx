import type { RouteObject } from "react-router-dom"

import { ChatLayout } from "@/layouts/chat-layout"
import { UserLayout } from "@/layouts/user-layout"
import { ChatPage } from "@/pages/user/chat-page"
import { UserHomePage } from "@/pages/user/user-home-page"

// Real auth/permission guards land in the auth integration feature branch.
export const userRoutes: RouteObject[] = [
  {
    element: <UserLayout />,
    children: [{ index: true, element: <UserHomePage /> }],
  },
  {
    element: <ChatLayout />,
    children: [{ path: "chat", element: <ChatPage /> }],
  },
]
