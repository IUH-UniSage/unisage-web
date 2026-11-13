import { expect, test, type Page } from "@playwright/test"

import { authenticateAs } from "./support/auth"

const KHOA = "11111111-1111-4111-8111-111111111111"
const BM1 = "22222222-2222-4222-8222-222222222222"
const BM2 = "33333333-3333-4333-8333-333333333333"
const LEVEL_1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"
const LEVEL_2 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2"

const dept = (
  id: string,
  name: string,
  parentId: string | null,
  children: unknown[] = []
) => ({ children, id, isActive: true, name, parentId })

const ok = (data: unknown) => ({ code: 1000, data, message: "Successful" })

async function mockForm(page: Page) {
  await page.route("**/api/v1/master/departments/roots**", (route) =>
    route.fulfill({
      json: ok([
        dept(KHOA, "Khoa CNTT", null, [
          dept(BM1, "Bộ môn KTPM", KHOA),
          dept(BM2, "Bộ môn HTTT", KHOA),
        ]),
      ]),
    })
  )
  await page.route("**/api/v1/master/access-levels**", (route) =>
    route.fulfill({
      json: ok([
        { id: LEVEL_1, isActive: true, level: 1 },
        { id: LEVEL_2, isActive: true, level: 2 },
      ]),
    })
  )
  await page.route("**/api/v1/master/rbac/roles**", (route) =>
    route.fulfill({
      json: ok({ data: [], limit: 100, page: 1, totalItems: 0, totalPages: 0 }),
    })
  )
}

async function openPicker(page: Page) {
  await page.getByRole("button", { name: "Thêm phòng ban" }).click()
}

test.beforeEach(async ({ page }) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockForm(page)
  await page.goto("/admin/users/new")
})

test("ticking a faculty ticks its subject groups and the reverse", async ({
  page,
}) => {
  await openPicker(page)
  await page.getByLabel("Khoa CNTT").check()
  await expect(page.getByLabel("Bộ môn KTPM")).toBeChecked()
  await expect(page.getByLabel("Bộ môn HTTT")).toBeChecked()

  await page.getByLabel("Bộ môn HTTT").uncheck()
  await expect(page.getByLabel("Khoa CNTT")).not.toBeChecked()

  await page.getByLabel("Bộ môn HTTT").check()
  await expect(page.getByLabel("Khoa CNTT")).toBeChecked()
})

test("one level applies to every assigned department", async ({ page }) => {
  await openPicker(page)
  await page.getByLabel("Bộ môn KTPM").check()
  await page.getByLabel("Bộ môn HTTT").check()
  await page.getByRole("button", { name: "Cập nhật danh sách" }).click()

  await page.getByLabel("Cấp độ áp dụng cho tất cả").click()
  await page.getByRole("option", { name: "Cấp 2" }).click()
  await page.getByRole("button", { name: "Áp dụng cho tất cả" }).click()

  // The bulk picker plus the faculty row (auto-added parent) and both subject groups.
  await expect(
    page.getByRole("combobox").filter({ hasText: "Cấp 2" })
  ).toHaveCount(4)
})

test("a faculty without any of its subject groups is rejected", async ({
  page,
}) => {
  await page.locator("#user-lastname").fill("Nguyễn")
  await page.locator("#user-firstname").fill("An")
  await page.locator("#user-email").fill("gv001@example.edu.vn")
  await page.locator("#user-password").fill("matkhau123")
  await openPicker(page)
  await page.getByLabel("Bộ môn KTPM").check()
  await page.getByRole("button", { name: "Cập nhật danh sách" }).click()
  await page.getByRole("button", { name: "Xóa phòng ban" }).click()

  await page.getByRole("button", { name: "Tạo người dùng" }).click()

  await expect(page.getByText(/ít nhất một phòng ban cấp cuối/)).toBeVisible()
})
