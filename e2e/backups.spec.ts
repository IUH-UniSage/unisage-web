import { expect, test, type Page } from "@playwright/test"

import { authenticateAs } from "./support/auth"

const API = "**/api/v1/master/admin/backups"

const fullRun = {
  backupType: "FULL",
  finishedAt: "2026-10-12T19:02:41Z",
  id: "8f0f5a52-0c1e-4c55-9d43-1f7a3b0c0001",
  sizeBytes: 48_234_496,
  startedAt: "2026-10-12T19:00:00Z",
  status: "SUCCEEDED",
}

const differentialRun = {
  backupType: "DIFFERENTIAL",
  baseRunId: fullRun.id,
  finishedAt: "2026-10-13T01:00:12Z",
  id: "8f0f5a52-0c1e-4c55-9d43-1f7a3b0c0002",
  sizeBytes: 3_145_728,
  startedAt: "2026-10-13T01:00:00Z",
  status: "SUCCEEDED",
}

const walRun = {
  backupType: "WAL",
  finishedAt: "2026-10-13T02:00:01Z",
  id: "8f0f5a52-0c1e-4c55-9d43-1f7a3b0c0003",
  sizeBytes: 16_777_216,
  startedAt: "2026-10-13T02:00:00Z",
  status: "SUCCEEDED",
}

const qdrantRun = {
  backupType: "QDRANT_SNAPSHOT",
  finishedAt: "2026-10-12T19:05:30Z",
  id: "8f0f5a52-0c1e-4c55-9d43-1f7a3b0c0004",
  sizeBytes: 12_582_912,
  startedAt: "2026-10-12T19:05:00Z",
  status: "SUCCEEDED",
  target: "unisage_documents",
}

const ok = (data: unknown) => ({
  contentType: "application/json",
  json: { code: 1000, data, message: "Successful" },
  status: 200,
})

// Shapes of src/features/backups/schemas/backup-schemas.ts.
async function mockBackups(page: Page) {
  await page.route(`${API}/overview`, (route) =>
    route.fulfill(
      ok({
        busy: false,
        latestRuns: [fullRun, differentialRun, walRun, qdrantRun],
        pointInTimeFrom: fullRun.finishedAt,
        pointInTimeTo: "2026-10-13T03:00:00Z",
        postgresRestore: null,
        postgresRestoreAvailable: true,
        qdrantSnapshots: [qdrantRun],
        restorePoints: [differentialRun, fullRun],
        scheduleEnabled: true,
        walArchivingConfigured: true,
      })
    )
  )
  await page.route(`${API}/runs?*`, (route) =>
    route.fulfill(
      ok({
        data: [walRun, differentialRun, qdrantRun, fullRun],
        limit: 10,
        page: 1,
        totalItems: 4,
        totalPages: 1,
      })
    )
  )
  await page.route(`${API}/restores?*`, (route) =>
    route.fulfill(
      ok({ data: [], limit: 10, page: 1, totalItems: 0, totalPages: 0 })
    )
  )
}

test("shows backups and asks for typed confirmation before a restore", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name.startsWith("mobile")) {
    await page.setViewportSize({ height: 812, width: 375 })
  }
  await authenticateAs(page, "SUPER_ADMIN")
  await mockBackups(page)
  await page.goto("/admin/backups")

  await expect(
    page.getByRole("heading", { name: "Khôi phục Qdrant" })
  ).toBeVisible()
  await expect(page.getByText("unisage_documents").first()).toBeVisible()

  // Nothing on the page may push it sideways on a phone.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  )
  expect(overflow).toBeLessThanOrEqual(0)

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath(`backups-${testInfo.project.name}.png`),
  })

  await page.getByRole("button", { name: "Khôi phục cơ sở dữ liệu" }).click()
  const dialog = page.getByRole("dialog")
  const submit = dialog.getByRole("button", { exact: true, name: "Khôi phục" })
  await expect(submit).toBeDisabled()
  await dialog.getByLabel(/để xác nhận/).fill("khoi phuc")
  await expect(submit).toBeEnabled()

  await page.screenshot({
    path: testInfo.outputPath(
      `backups-restore-dialog-${testInfo.project.name}.png`
    ),
  })
})
