import { expect, test, type Page, type Request } from "@playwright/test"

import { authenticateAs } from "./support/auth"

const KHOA = "11111111-1111-4111-8111-111111111111"
const BO_MON = "22222222-2222-4222-8222-222222222222"
const PHONG = "33333333-3333-4333-8333-333333333333"
const TO = "44444444-4444-4444-8444-444444444444"

const node = (
  id: string,
  name: string,
  isActive: boolean,
  parentId: string | null,
  children: unknown[] = []
) => ({
  children,
  createdAt: "2026-10-01T08:00:00",
  description: null,
  id,
  isActive,
  name,
  parentId,
})

// Khoa CNTT (active) > Bộ môn KTPM (inactive); Phòng Đào tạo (inactive) > Tổ tuyển sinh (inactive).
const roots = [
  node(KHOA, "Khoa CNTT", true, null, [
    node(BO_MON, "Bộ môn KTPM", false, KHOA),
  ]),
  node(PHONG, "Phòng Đào tạo", false, null, [
    node(TO, "Tổ tuyển sinh", false, PHONG),
  ]),
]

async function mockDepartments(page: Page, writes: Request[]) {
  await page.route("**/api/v1/master/departments**", async (route) => {
    const request = route.request()
    if (request.method() !== "GET") writes.push(request)
    await route.fulfill({
      contentType: "application/json",
      json: {
        code: 1000,
        data: request.method() === "GET" ? roots : null,
        message: "Successful",
      },
      status: 200,
    })
  })
}

const rowCheckbox = (page: Page, name: string) =>
  page.getByLabel(`Chọn ${name}`, { exact: true }).filter({ visible: true })

test.beforeEach(async ({ page }, testInfo) => {
  // The department table is desktop-first; the mobile layout is covered by screenshots.
  test.skip(testInfo.project.name === "mobile-chromium")
  await authenticateAs(page, "SUPER_ADMIN")
})

test("opens as a table with child units collapsed", async ({ page }) => {
  await mockDepartments(page, [])
  await page.goto("/admin/departments")

  await expect(rowCheckbox(page, "Khoa CNTT")).toBeVisible()
  await expect(rowCheckbox(page, "Bộ môn KTPM")).toHaveCount(0)

  await page.getByRole("button", { name: "Mở rộng Khoa CNTT" }).click()
  await expect(rowCheckbox(page, "Bộ môn KTPM")).toBeVisible()
})

test("bulk recover of a unit with children asks and sends includeChildren", async ({
  page,
}) => {
  const writes: Request[] = []
  await mockDepartments(page, writes)
  await page.goto("/admin/departments")

  await rowCheckbox(page, "Khoa CNTT").check()
  await rowCheckbox(page, "Phòng Đào tạo").check()
  await expect(page.getByRole("button", { name: "Vô hiệu hóa" })).toBeVisible()
  await page.getByRole("button", { name: "Khôi phục" }).click()

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Khôi phục cả đơn vị trực thuộc" })
    .click()

  await expect.poll(() => writes.length).toBe(1)
  const url = new URL(writes[0].url())
  expect(url.pathname).toMatch(/\/departments\/bulk\/recover$/)
  expect(url.searchParams.get("includeChildren")).toBe("true")
  expect(writes[0].postDataJSON()).toEqual([PHONG])
})

test("recovering one unit can leave its children disabled", async ({
  page,
}) => {
  const writes: Request[] = []
  await mockDepartments(page, writes)
  await page.goto("/admin/departments")

  await page
    .getByRole("button", { name: "Hành động cho Phòng Đào tạo" })
    .click()
  await page.getByRole("menuitem", { name: "Khôi phục" }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Chỉ đơn vị này" })
    .click()

  await expect.poll(() => writes.length).toBe(1)
  const url = new URL(writes[0].url())
  expect(url.pathname).toMatch(new RegExp(`/departments/${PHONG}/recover$`))
  expect(url.searchParams.get("includeChildren")).toBe("false")
})
