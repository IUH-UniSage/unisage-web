import { expect, test } from "@playwright/test"

test("renders the home route", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("#root")).not.toBeEmpty()
})
