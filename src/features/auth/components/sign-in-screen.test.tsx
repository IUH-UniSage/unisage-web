import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HttpResponse, http } from "msw"
import { setupServer } from "msw/node"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StrictMode } from "react"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { SignInPage } from "@/features/auth/components/sign-in-screen"
import { AuthProvider } from "@/features/auth/model/auth-provider"
import type { AuthResponse } from "@/features/auth/schemas/auth-schemas"
import { AUTH_SESSION_REFRESHED_EVENT } from "@/lib/axios-client"
import { GuestRoute } from "@/routes/guest-route"
import { STORAGE_KEYS } from "@/utils/local-storage"

const userId = "a76398bd-c8ac-4fa8-803e-0a91e207347c"
const permissions = [
  {
    accessLevel: 5,
    id: "a931f2ee-e2b1-45cf-9299-6f96f8a8db89",
    name: "DOCUMENT_READ",
  },
]

const server = setupServer()

function buildAuthResponse(overrides: Partial<AuthResponse> = {}) {
  return {
    accessToken: "access-token",
    avatarUrl: null,
    code: "SV001",
    email: "student@example.edu.vn",
    fullName: "Nguyễn Minh Anh",
    isSystemRole: false,
    permissions,
    refreshToken: "refresh-token",
    refreshTokenExpirationMs: 60_000,
    role: "USER",
    userId,
    ...overrides,
  }
}

function renderSignIn() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })

  render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={["/login"]}>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route element={<SignInPage />} path="/login" />
              </Route>
              <Route element={<h1>Trang người dùng</h1>} path="/" />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

async function submitCredentials() {
  const user = userEvent.setup()
  await user.type(
    screen.getByLabelText("Mã sinh viên hoặc mã giảng viên"),
    "SV001"
  )
  await user.type(screen.getByLabelText("Mật khẩu"), "Secret@123")
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }))
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

beforeEach(() => {
  window.localStorage.clear()
})

describe("sign-in integration", () => {
  it("shows the Backend message when credentials are rejected", async () => {
    server.use(
      http.post("*/auth/login", () =>
        HttpResponse.json(
          {
            code: 1006,
            data: null,
            message: "Mã sinh viên/giảng viên hoặc mật khẩu không chính xác.",
          },
          { status: 401 }
        )
      )
    )

    renderSignIn()
    await submitCredentials()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Mã sinh viên/giảng viên hoặc mật khẩu không chính xác."
    )
    expect(
      screen.getByRole("heading", { name: "Đăng nhập UniSage" })
    ).toBeInTheDocument()
  })

  it("creates a session from the Backend login contract", async () => {
    server.use(
      http.post("*/auth/login", async ({ request }) => {
        await expect(request.json()).resolves.toEqual({
          code: "SV001",
          password: "Secret@123",
        })

        return HttpResponse.json({
          code: 1000,
          data: buildAuthResponse(),
          message: "Successful",
        })
      })
    )

    renderSignIn()
    await submitCredentials()

    expect(
      await screen.findByRole("heading", { name: "Trang người dùng" })
    ).toBeInTheDocument()
    expect(window.localStorage.getItem(STORAGE_KEYS.userProfile)).toContain(
      '"role":"USER"'
    )
    expect(window.localStorage.getItem(STORAGE_KEYS.accessToken)).toBeNull()
  })

  it("refreshes a cached session from the Backend contract", async () => {
    let refreshRequestCount = 0
    window.localStorage.setItem(
      STORAGE_KEYS.userProfile,
      JSON.stringify({
        avatarUrl: null,
        code: "SV001",
        email: "student@example.edu.vn",
        fullName: "Old display name",
        isSystemRole: false,
        permissions,
        role: "USER",
        userId,
      })
    )
    server.use(
      http.post("*/auth/refresh", () => {
        refreshRequestCount += 1
        return HttpResponse.json({
          code: 1000,
          data: buildAuthResponse({ fullName: "Updated display name" }),
          message: "Successful",
        })
      })
    )

    renderSignIn()

    expect(
      await screen.findByRole("heading", { name: "Trang người dùng" })
    ).toBeInTheDocument()
    expect(window.localStorage.getItem(STORAGE_KEYS.userProfile)).toContain(
      "Updated display name"
    )
    expect(refreshRequestCount).toBe(1)
  })

  it("updates the active session after a silent refresh", async () => {
    server.use(
      http.post("*/auth/login", () =>
        HttpResponse.json({
          code: 1000,
          data: buildAuthResponse(),
          message: "Successful",
        })
      )
    )
    renderSignIn()
    await submitCredentials()
    await screen.findByRole("heading", { name: "Trang người dùng" })

    window.dispatchEvent(
      new CustomEvent(AUTH_SESSION_REFRESHED_EVENT, {
        detail: {
          code: 1000,
          data: buildAuthResponse({ fullName: "Refreshed display name" }),
          message: "Successful",
        },
      })
    )

    expect(window.localStorage.getItem(STORAGE_KEYS.userProfile)).toContain(
      "Refreshed display name"
    )
  })
})
