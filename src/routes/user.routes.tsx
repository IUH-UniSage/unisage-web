import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import { ROUTE_SEGMENTS, ROUTES } from "@/constants/paths"
import { ChatLayout } from "@/layouts/chat-layout"
import { UserLayout } from "@/layouts/user-layout"
import { WorkspacePlaceholderPage } from "@/pages/shared/workspace-placeholder-page"
import { PrivateRoute } from "@/routes/private-route"

const UserHomePage = lazy(async () => {
  const { UserHomePage } = await import("@/pages/user/user-home-page")
  return { default: UserHomePage }
})

const TicketsPage = lazy(async () => {
  const { TicketsPage } = await import("@/pages/user/tickets-page")
  return { default: TicketsPage }
})

const TicketNewPage = lazy(async () => {
  const { TicketNewPage } = await import("@/pages/user/ticket-new-page")
  return { default: TicketNewPage }
})

const TicketDetailPage = lazy(async () => {
  const { TicketDetailPage } = await import("@/pages/user/ticket-detail-page")
  return { default: TicketDetailPage }
})

const ProfilePage = lazy(async () => {
  const { ProfilePage } = await import("@/pages/user/profile-page")
  return { default: ProfilePage }
})

const SharedConversationPage = lazy(async () => {
  const { SharedConversationPage } =
    await import("@/pages/user/shared-conversation-page")
  return { default: SharedConversationPage }
})

const SharedLinksPage = lazy(async () => {
  const { SharedLinksPage } = await import("@/pages/user/shared-links-page")
  return { default: SharedLinksPage }
})

const ChatPage = lazy(async () => {
  const { ChatPage } = await import("@/pages/user/chat-page")
  return { default: ChatPage }
})

export const userRoutes: RouteObject[] = [
  {
    path: ROUTES.home,
    element: <UserLayout />,
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
        element: (
          <PrivateRoute>
            <TicketsPage />
          </PrivateRoute>
        ),
      },
      {
        path: `${ROUTE_SEGMENTS.tickets}/new`,
        element: (
          <PrivateRoute>
            <TicketNewPage />
          </PrivateRoute>
        ),
      },
      {
        path: `${ROUTE_SEGMENTS.tickets}/:ticketId`,
        element: (
          <PrivateRoute>
            <TicketDetailPage />
          </PrivateRoute>
        ),
      },
      {
        path: ROUTE_SEGMENTS.sharedLinks,
        element: (
          <PrivateRoute>
            <SharedLinksPage />
          </PrivateRoute>
        ),
      },
      {
        path: ROUTE_SEGMENTS.notifications,
        element: <WorkspacePlaceholderPage title="Thông báo" />,
      },
      {
        path: ROUTE_SEGMENTS.profile,
        element: <ProfilePage />,
      },
    ],
  },
  {
    // A shared conversation link (UNISAGE-107): signed-in users only; the sign-in page comes back
    // here afterwards (PrivateRoute `from`). Inside the chat shell, so the snapshot reads like
    // the chat itself, with "continue" in place of the composer.
    path: `${ROUTES.share}/:token`,
    element: <ChatLayout />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <SharedConversationPage />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    // `/chat` and `/chat/<id>` are one route (optional segment), so opening or leaving a
    // conversation only changes the params: ChatPage and its streaming state stay mounted.
    path: `${ROUTES.chat}/${ROUTE_SEGMENTS.chatConversation}?`,
    element: <ChatLayout />,
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
    ],
  },
]
