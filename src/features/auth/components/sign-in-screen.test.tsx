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
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { SignInPage } from "@/features/auth/components/sign-in-screen"
import { AuthProvider } from "@/features/auth/model/auth-provider"
import { GuestRoute } from "@/routes/guest-route"
import { STORAGE_KEYS } from "@/utils/local-storage"

const userProfile = {
  avatarUrl: null,
  fullName: "Nguyễn Minh Anh",
  isSystemRole: false,
  permissions: [
    {
      accessLevel: 5,
      id: "a931f2ee-e2b1-45cf-9299-6f96f8a8db89",
      name: "DOCUMENT_READ",
    },
  ],
  role: "USER",
  roleDescription: "Người dùng cuối",
  userId: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
}

const adminProfile = {
  ...userProfile,
  fullName: "Trần Ngọc Huyền",
  isSystemRole: true,
  role: "SUPER_ADMIN",
  roleDescription: "Quản trị hệ thống",
  userId: "61fe43cc-82dc-4c2a-a953-b1c11e560ea7",
}

const server = setupServer()

function renderSignIn() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route element={<SignInPage />} path="/login" />
            </Route>
            <Route element={<h1>Trang người dùng</h1>} path="/" />
            <Route element={<h1>Trang quản trị</h1>} path="/admin" />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

async function submitCredentials() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Mã tài khoản"), "SV001")
  await user.type(screen.getByLabelText("Mật khẩu"), "Secret@123")
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }))
  return user
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
            message: "Mã tài khoản hoặc mật khẩu không chính xác.",
          },
          { status: 401 }
        )
      )
    )

    renderSignIn()
    await submitCredentials()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Mã tài khoản hoặc mật khẩu không chính xác."
    )
    expect(
      screen.getByRole("heading", { name: "Đăng nhập UniSage" })
    ).toBeInTheDocument()
  })

  it("creates a session and redirects a single-profile user", async () => {
    server.use(
      http.post("*/auth/login", async ({ request }) => {
        await expect(request.json()).resolves.toEqual({
          code: "SV001",
          password: "Secret@123",
        })

        return HttpResponse.json({
          code: 1000,
          data: {
            accessToken: "access-token",
            code: "SV001",
            email: "student@example.edu.vn",
            profiles: [userProfile],
            refreshToken: "refresh-token",
            refreshTokenExpirationMs: 60_000,
          },
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

  it("asks the user to choose when an account has multiple profiles", async () => {
    server.use(
      http.post("*/auth/login", () =>
        HttpResponse.json({
          code: 1000,
          data: {
            accessToken: null,
            code: "SV001",
            email: "student@example.edu.vn",
            profiles: [userProfile, adminProfile],
            refreshToken: null,
            refreshTokenExpirationMs: 0,
          },
          message: "Successful",
        })
      ),
      http.post("*/auth/select-profile", async ({ request }) => {
        await expect(request.json()).resolves.toEqual({
          userId: adminProfile.userId,
        })

        return HttpResponse.json({
          code: 1000,
          data: {
            accessToken: "access-token",
            avatarUrl: null,
            code: "SV001",
            email: "student@example.edu.vn",
            fullName: adminProfile.fullName,
            isSystemRole: true,
            permissions: adminProfile.permissions,
            refreshToken: "refresh-token",
            refreshTokenExpirationMs: 60_000,
            role: "SUPER_ADMIN",
          },
          message: "Successful",
        })
      })
    )

    renderSignIn()
    const user = await submitCredentials()

    expect(
      await screen.findByRole("heading", {
        name: "Bạn muốn tiếp tục với vai trò nào?",
      })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /Trần Ngọc Huyền/ }))

    expect(
      await screen.findByRole("heading", { name: "Trang quản trị" })
    ).toBeInTheDocument()
  })

  it("restores a cached profile when refresh omits profiles", async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.userProfile,
      JSON.stringify({
        avatarUrl: null,
        code: "SV001",
        email: "student@example.edu.vn",
        fullName: userProfile.fullName,
        isSystemRole: false,
        permissions: userProfile.permissions,
        role: "USER",
        userId: userProfile.userId,
      })
    )

    server.use(
      http.post("*/auth/refresh", () =>
        HttpResponse.json({
          code: 1000,
          data: {
            accessToken: "new-access-token",
            code: "SV001",
            email: "student@example.edu.vn",
            refreshToken: "new-refresh-token",
            refreshTokenExpirationMs: 60_000,
          },
          message: "Successful",
        })
      )
    )

    renderSignIn()

    expect(
      await screen.findByRole("heading", { name: "Trang người dùng" })
    ).toBeInTheDocument()
  })
})
