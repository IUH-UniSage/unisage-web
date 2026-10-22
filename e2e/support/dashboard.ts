import type { Page } from "@playwright/test"

// Shape of dashboardSummarySchema (src/features/analytics/schemas/
// dashboard-schemas.ts), enough for the admin overview page to render.
export async function mockDashboardSummary(page: Page) {
  await page.route(
    "**/api/v1/master/admin/dashboard/summary**",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          code: 1000,
          data: {
            activity: [
              {
                answered: 4,
                costUsd: 0.21,
                failed: 0,
                start: "2026-10-13T07:00:00",
              },
              {
                answered: 6,
                costUsd: 0.34,
                failed: 1,
                start: "2026-10-13T08:00:00",
              },
            ],
            answers: {
              current: {
                cited: 9,
                failed: 1,
                medianResponseMs: 2600,
                p95ResponseMs: 7300,
                total: 11,
              },
              previous: {
                cited: 12,
                failed: 0,
                medianResponseMs: 3400,
                p95ResponseMs: 8100,
                total: 14,
              },
            },
            askers: {
              current: { guests: 2, users: 5 },
              previous: { guests: 1, users: 6 },
            },
            attention: {
              activeBudgetAlerts: 1,
              failedDocuments: 1,
              openTickets: 3,
              outdatedDocuments: 0,
            },
            cost: {
              budgets: [
                {
                  id: "budget-1",
                  limitUsd: 2,
                  period: "DAILY",
                  scope: "SYSTEM",
                  scopeProvider: null,
                  scopePurpose: null,
                  spentPercent: 83.1,
                  spentUsd: 1.66,
                },
              ],
              byPurpose: [{ costUsd: 0.55, purpose: "CHAT", requestCount: 11 }],
              previousTotalUsd: 0.6,
              requestCount: 11,
              totalUsd: 0.55,
              unpricedEstimateUsd: 0,
            },
            documents: { departments: 6, published: 124 },
            health: {
              checkedAt: "2026-10-13T08:00:00Z",
              components: {
                db: { responseTimeMs: 4, status: "UP" },
                redis: { responseTimeMs: 2, status: "UP" },
              },
              overallStatus: "UP",
            },
            period: {
              from: "2026-10-13T00:00:00",
              granularity: "HOUR",
              key: "TODAY",
              previousFrom: "2026-10-12T00:00:00",
              previousTo: "2026-10-12T08:30:00",
              to: "2026-10-13T08:30:00",
            },
          },
          message: "Successful",
        },
        status: 200,
      })
    }
  )
}
