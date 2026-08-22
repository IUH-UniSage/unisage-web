import { describe, expect, it } from "vitest"

import {
  createSessionFromResponse,
  getInitials,
} from "@/features/auth/utils/auth-session"

const permission = {
  accessLevel: 5,
  id: "a931f2ee-e2b1-45cf-9299-6f96f8a8db89",
  name: "DOCUMENT_ALL",
}

function fakeAccessToken(subject: string): string {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replaceAll("+", "-").replaceAll("/", "_")

  return `${encode({ alg: "HS384" })}.${encode({ sub: subject })}.signature`
}

describe("auth session helpers", () => {
  it("creates a client session from the Backend auth response", () => {
    const session = createSessionFromResponse({
      accessToken: fakeAccessToken("a76398bd-c8ac-4fa8-803e-0a91e207347c"),
      avatarUrl: null,
      code: "SV001",
      email: "student@example.edu.vn",
      fullName: "Nguyễn Minh Anh",
      isSystemRole: false,
      permissions: [permission],
      refreshToken: "refresh-token",
      refreshTokenExpirationMs: 60_000,
      role: "USER",
    })

    expect(session).toEqual({
      avatarUrl: null,
      code: "SV001",
      email: "student@example.edu.vn",
      fullName: "Nguyễn Minh Anh",
      isSystemRole: false,
      permissions: [permission],
      role: "USER",
      userId: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
    })
  })

  it("builds compact initials from Vietnamese names", () => {
    expect(getInitials("Trần Ngọc Huyền")).toBe("NH")
    expect(getInitials("An")).toBe("A")
  })
})
