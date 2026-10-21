import type { Page } from "@playwright/test"

// Shape of dashboardSummarySchema (src/features/analytics/schemas/
// dashboard-schemas.ts), enough for the admin overview page to render.
export async function mockDashboardSummary(page: Page) {
  await page.route(
    "**/api/v1/master/admin/dashboard/summary",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          code: 1000,
          data: {
            aiAnswers: { citedPercentage: 92, today: 48 },
            documents: { departments: 6, published: 124 },
            health: {
              checkedAt: "2026-10-13T08:00:00Z",
              components: {
                db: { responseTimeMs: 4, status: "UP" },
                redis: { responseTimeMs: 2, status: "UP" },
              },
              overallStatus: "UP",
            },
            tickets: { open: 3 },
            users: { activeToday: 37, activeTotal: 512 },
            weeklyActivity: {
              daily: [
                { date: "2026-10-07", questions: 40 },
                { date: "2026-10-08", questions: 52 },
                { date: "2026-10-09", questions: 61 },
                { date: "2026-10-10", questions: 45 },
                { date: "2026-10-11", questions: 12 },
                { date: "2026-10-12", questions: 9 },
                { date: "2026-10-13", questions: 48 },
              ],
              totalQuestions: 267,
            },
          },
          message: "Successful",
        },
        status: 200,
      })
    }
  )
}
