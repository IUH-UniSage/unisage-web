import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTE_SEGMENTS, ROUTES } from "@/constants/paths"
import { USER_ROLES } from "@/features/auth/lib/role-routing"
import { ChatLayout } from "@/layouts/chat-layout"
import { UserLayout } from "@/layouts/user-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { PrivateRoute } from "@/routes/private-route"

const UserHomePage = lazy(async () => {
  const { UserHomePage } = await import("@/pages/user/user-home-page")
  return { default: UserHomePage }
})

const ChatPage = lazy(async () => {
  const { ChatPage } = await import("@/pages/user/chat-page")
  return { default: ChatPage }
})

export const userRoutes: RouteObject[] = [
  {
    path: ROUTES.home,
    element: (
      <PrivateRoute allowedRoles={[USER_ROLES.user]}>
        <UserLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <UserHomePage />,
      },
      {
        path: ROUTE_SEGMENTS.knowledge,
        element: <WorkspacePlaceholderPage title="Thư viện tri thức" />,
      },
      {
        path: ROUTE_SEGMENTS.tickets,
        element: <WorkspacePlaceholderPage title="Yêu cầu hỗ trợ của tôi" />,
      },
      {
        path: ROUTE_SEGMENTS.notifications,
        element: <WorkspacePlaceholderPage title="Thông báo" />,
      },
      {
        path: ROUTE_SEGMENTS.profile,
        element: <WorkspacePlaceholderPage title="Hồ sơ và quyền truy cập" />,
      },
    ],
  },
  {
    path: ROUTES.chat,
    element: (
      <PrivateRoute allowedRoles={[USER_ROLES.user]}>
        <ChatLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
    ],
  },
]
