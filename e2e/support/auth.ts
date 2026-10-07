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

// Matches DataInitializer.assignIngestAdmin (backend-java) exactly - see
// .claude/rules/rbac-permissions.md.
const permissionsByRole = {
  INGEST_ADMIN: [
    "DEPARTMENT_READ",
    "DOCUMENT_ALL",
    "CATEGORY_ALL",
    "CHAT_MODEL_READ",
    "LLM_TRACE_LOG_READ",
  ],
  SUPER_ADMIN: ["SUPER_ADMIN_ALL"],
  USER: ["DOCUMENT_READ"],
} as const

export type TestRole = keyof typeof sessionByRole

// Every tour the staff workspaces can auto-start: intro:<workspace>,
// page:<key> for each PAGE_TOURS entry (staff-tours.ts) and ROUTE_TOURS entry
// (route-tours.ts), and dialog:<key> for each DIALOG_TOURS entry
// (dialog-tours.ts), all under src/features/product-tour/tours/. Marked as seen by
// default so a first-visit tour overlay doesn't sit on top of the page a
// spec is trying to drive; product-tour.spec.ts opts back in.
export const PRODUCT_TOUR_KEYS = [
  "intro:system-admin",
  "intro:ingester",
  "page:admin-overview",
  "page:ingester-overview",
  "page:departments",
  "page:admin-users",
  "page:admin-rbac",
  "page:admin-access-levels",
  "page:admin-tickets",
  "page:admin-usage-limits",
  "page:categories",
  "page:documents",
  "page:admin-logs",
  "page:admin-models",
  "page:admin-cost-management",
  "page:admin-health",
  "page:admin-settings",
  "page:ingester-processing",
  "page:user-form",
  "page:user-detail",
  "page:role-form",
  "page:role-detail",
  "page:document-form",
  "page:document-chunks",
  "page:ingest-wizard",
  "page:document-detail",
  "page:admin-profile",
  "dialog:access-level-form",
  "dialog:audit-log-detail",
  "dialog:budget-form",
  "dialog:category-form",
  "dialog:change-password",
  "dialog:chat-model-detail",
  "dialog:chat-model-form",
  "dialog:department-detail",
  "dialog:department-form",
  "dialog:permission-detail",
  "dialog:permission-form",
  "dialog:price-form",
  "dialog:registered-models",
  "dialog:ticket-detail",
  "dialog:usage-limit-plan-form",
  "dialog:usage-log-detail",
  "dialog:verification-job-detail",
] as const

type AuthenticateOptions = {
  productTours?: boolean
}

export async function authenticateAs(
  page: Page,
  role: TestRole = "USER",
  permissionNames: readonly string[] = permissionsByRole[role],
  { productTours = false }: AuthenticateOptions = {}
) {
  const account = sessionByRole[role]
  const session = {
    avatarUrl: null,
    code: account.code,
    email: `${account.code.toLowerCase()}@example.edu.vn`,
    fullName: account.fullName,
    isSystemRole: role !== "USER",
    permissions: permissionNames.map((name, index) => ({
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
  if (!productTours) {
    await page.addInitScript(
      ({ seenTours, storageKey }) => {
        window.localStorage.setItem(storageKey, JSON.stringify(seenTours))
      },
      {
        seenTours: PRODUCT_TOUR_KEYS,
        storageKey: "unisage_product_tour_seen",
      }
    )
  }
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
