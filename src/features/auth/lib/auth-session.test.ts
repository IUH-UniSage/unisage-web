import { describe, expect, it } from "vitest"

import {
  createSessionFromLogin,
  createSessionFromSelectedProfile,
  getInitials,
} from "@/features/auth/lib/auth-session"

const permission = {
  accessLevel: 5,
  id: "a931f2ee-e2b1-45cf-9299-6f96f8a8db89",
  name: "DOCUMENT_ALL",
}

describe("auth session helpers", () => {
  it("combines account and single-profile login data", () => {
    const session = createSessionFromLogin(
      {
        accessToken: "access-token",
        code: "SV001",
        email: "student@example.edu.vn",
        profiles: [],
        refreshToken: "refresh-token",
        refreshTokenExpirationMs: 60_000,
      },
      {
        avatarUrl: null,
        fullName: "Nguyễn Minh Anh",
        isSystemRole: false,
        permissions: [permission],
        role: "USER",
        roleDescription: "Người dùng cuối",
        userId: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
      }
    )

    expect(session).toMatchObject({
      code: "SV001",
      fullName: "Nguyễn Minh Anh",
      role: "USER",
      userId: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
    })
  })

  it("keeps the selected profile id with its returned permissions", () => {
    const session = createSessionFromSelectedProfile(
      {
        accessToken: "access-token",
        avatarUrl: null,
        code: "NV001",
        email: "admin@example.edu.vn",
        fullName: "Trần Ngọc Huyền",
        isSystemRole: true,
        permissions: [permission],
        refreshToken: "refresh-token",
        refreshTokenExpirationMs: 60_000,
        role: "SUPER_ADMIN",
      },
      "61fe43cc-82dc-4c2a-a953-b1c11e560ea7"
    )

    expect(session.permissions).toEqual([permission])
    expect(session.userId).toBe("61fe43cc-82dc-4c2a-a953-b1c11e560ea7")
  })

  it("builds compact initials from Vietnamese names", () => {
    expect(getInitials("Trần Ngọc Huyền")).toBe("NH")
    expect(getInitials("An")).toBe("A")
  })
})
