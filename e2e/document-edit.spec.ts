import { expect, test, type Page, type Request } from "@playwright/test"

import { authenticateAs } from "./support/auth"

const DOC_ID = "5d1c7f0e-2b3a-4c5d-8e9f-0a1b2c3d4e5f"

const documentRow = {
  fileType: "pdf",
  fileUrl: null,
  id: DOC_ID,
  isPublic: true,
  sourceUrl: "quy-che.pdf",
  status: "COMPLETED",
  title: "Quy chế đào tạo",
  version: 1,
}

const ok = (data: unknown) => ({ code: 1000, data, message: "Successful" })

async function mockDocument(page: Page, updates: Request[]) {
  await page.route(`**/api/v1/master/documents/${DOC_ID}**`, async (route) => {
    const request = route.request()
    if (request.method() === "PUT") updates.push(request)
    await route.fulfill({
      json: ok(
        new URL(request.url()).pathname.endsWith("/versions") ? [] : documentRow
      ),
    })
  })
}

// The edit page is shared by /admin and /ingester; both must behave the same.
const areas = [
  {
    base: "/admin/documents",
    role: "SUPER_ADMIN" as const,
    wizard: `/admin/documents/${DOC_ID}/ingest`,
  },
  {
    base: "/ingester/documents",
    role: "INGEST_ADMIN" as const,
    wizard: `/ingester/processing/${DOC_ID}`,
  },
]

for (const area of areas) {
  test.describe(area.base, () => {
    test("an edit needs a reason, and replacing the file opens the ingest step", async ({
      page,
    }) => {
      const updates: Request[] = []
      await authenticateAs(page, area.role)
      await mockDocument(page, updates)
      await page.goto(`${area.base}/${DOC_ID}/edit`)

      await page.locator("#document-file-replace").setInputFiles({
        buffer: Buffer.from("%PDF-1.4"),
        mimeType: "application/pdf",
        name: "quy-che-2026.pdf",
      })
      await page.getByRole("button", { name: "Lưu thay đổi" }).first().click()
      await expect(
        page.getByText("Vui lòng nhập lý do chỉnh sửa.")
      ).toBeVisible()
      expect(updates).toHaveLength(0)

      await page
        .getByLabel("Lý do chỉnh sửa")
        .fill("Cập nhật quy chế theo quyết định mới")
      await page.getByRole("button", { name: "Lưu thay đổi" }).first().click()

      await expect(page).toHaveURL(new RegExp(`${area.wizard}$`))
      expect(updates).toHaveLength(1)
      expect(updates[0].postData()).toContain(
        "Cập nhật quy chế theo quyết định mới"
      )
    })
  })
}
