import type { Page } from "@playwright/test"

// createSessionFromResponse() derives userId by decoding the access token's
// JWT `sub` claim (see src/features/auth/utils/jwt.ts) - a plain string
// token has no payload segment to decode and breaks the session build, so
// the mocked token must be shaped like a real JWT with the session's userId
// as its subject.
function fakeJwt(subject: string): string {
  const base64url = (payload: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(payload)).toString("base64url")

  return [
    base64url({ alg: "none", typ: "JWT" }),
    base64url({ sub: subject }),
    "signature",
  ].join(".")
}

const sessionByRole = {
  INGEST_ADMIN: {
    code: "NV001",
    fullName: "Nguyễn Văn Ingest",
    role: "INGEST_ADMIN",
  },
  SUPER_ADMIN: {
    code: "AD001",
    fullName: "Trần Ngọc Huyền",
    role: "SUPER_ADMIN",
  },
  USER: {
    code: "SV001",
    fullName: "Nguyễn Minh Anh",
    role: "USER",
  },
} as const

const permissionsByRole = {
  INGEST_ADMIN: [
    "DOCUMENT_ALL",
    "DOCUMENT_CHUNK_ALL",
    "DOCUMENT_PROCESS_LOG_READ",
    "EMBEDDED_MODEL_READ",
    "INGEST_ALL",
  ],
  SUPER_ADMIN: ["SUPER_ADMIN_ALL"],
  USER: ["DOCUMENT_READ"],
} as const

export type TestRole = keyof typeof sessionByRole

export async function authenticateAs(
  page: Page,
  role: TestRole = "USER",
  permissionNames: readonly string[] = permissionsByRole[role]
) {
  const account = sessionByRole[role]
  const session = {
    avatarUrl: null,
    code: account.code,
    email: `${account.code.toLowerCase()}@example.edu.vn`,
    fullName: account.fullName,
    isSystemRole: role !== "USER",
    permissions: permissionNames.map((name, index) => ({
      accessLevel: 5,
      id: `a931f2ee-e2b1-45cf-9299-6f96f8a8db8${index}`,
      name,
    })),
    role,
    userId: "a76398bd-c8ac-4fa8-803e-0a91e207347c",
  }

  await page.addInitScript(
    ({ cachedSession, storageKey }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(cachedSession))
    },
    {
      cachedSession: session,
      storageKey: "unisage_user_profile",
    }
  )
  await page.route("**/api/v1/master/auth/refresh", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        code: 1000,
        data: {
          accessToken: fakeJwt(session.userId),
          avatarUrl: session.avatarUrl,
          code: account.code,
          email: session.email,
          fullName: session.fullName,
          isSystemRole: session.isSystemRole,
          permissions: session.permissions,
          refreshToken: "refresh-token",
          refreshTokenExpirationMs: 60_000,
          role: session.role,
          userId: session.userId,
        },
        message: "Successful",
      },
      status: 200,
    })
  })
}
