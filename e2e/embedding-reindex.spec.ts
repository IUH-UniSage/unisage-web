import { expect, test, type Page } from "@playwright/test"

import { authenticateAs } from "./support/auth"

// UNISAGE-103: the embedding index panel on the AI configuration page, and
// re-indexing into a model whose activation the backend refused with 2517.

const ACTIVE_MODEL_ID = "5b0f7c1e-2f4a-4a1e-9d3b-1c2d3e4f5a61"
const TARGET_MODEL_ID = "6c1a8d2f-3a5b-4b2f-8e4c-2d3e4f5a6b72"
const RUN_ID = "7d2b9e3a-4b6c-4c3a-9f5d-3e4f5a6b7c83"

function embeddingModel(
  id: string,
  llmModelName: string,
  status: "ACTIVE" | "INACTIVE"
) {
  return {
    apiBaseUrl: "https://api.openai.com/v1",
    displayName: null,
    errorCount: 0,
    hasApiKey: true,
    id,
    isActive: true,
    lastErrorAt: null,
    lastErrorCode: null,
    llmModelName,
    llmProvider: "openai",
    modelPurpose: "EMBEDDING",
    modelSourceRef: null,
    priority: 0,
    sourceType: "CLOUD_API",
    status,
    verifiedAt: "2026-10-16T08:00:00",
  }
}

const MODELS = [
  embeddingModel(ACTIVE_MODEL_ID, "text-embedding-3-small", "ACTIVE"),
  embeddingModel(TARGET_MODEL_ID, "text-embedding-3-large", "INACTIVE"),
]

function run(status: "QUEUED" | "RUNNING", processedPoints: number) {
  return {
    createdAt: "2026-10-17T08:00:00",
    errorMessage: null,
    failedPoints: 0,
    finishedAt: null,
    id: RUN_ID,
    processedPoints,
    sourceCollection: "unisage_chunks",
    startedAt: status === "RUNNING" ? "2026-10-17T08:00:10" : null,
    status,
    targetCollection: "unisage_chunks__20261017080000",
    targetModel: {
      displayName: null,
      embeddingDimension: 3072,
      id: TARGET_MODEL_ID,
      llmModelName: "text-embedding-3-large",
      llmProvider: "openai",
    },
    totalPoints: status === "RUNNING" ? 1200 : null,
  }
}

function embeddingIndex(currentRun: ReturnType<typeof run> | null) {
  return {
    activeCollection: "unisage_chunks",
    activeIdentity: {
      dimension: 1536,
      establishedAt: "2026-09-01T08:00:00",
      modelName: "text-embedding-3-small",
      provider: "openai",
    },
    activeModel: {
      displayName: null,
      id: ACTIVE_MODEL_ID,
      llmModelName: "text-embedding-3-small",
      llmProvider: "openai",
    },
    baseCollection: "unisage_chunks",
    currentRun,
    lastRun: currentRun,
  }
}

const ok = (data: unknown) => ({ code: 1000, data, message: "Successful" })

async function mockChatModels(
  page: Page,
  index: () => ReturnType<typeof embeddingIndex>
) {
  await page.route(/\/api\/v1\/master\/chat-models(\?.*)?$/, async (route) => {
    await route.fulfill({
      json: ok({
        data: MODELS,
        limit: 12,
        page: 1,
        totalItems: MODELS.length,
        totalPages: 1,
      }),
    })
  })
  await page.route(
    /\/api\/v1\/master\/chat-models\/embedding-index$/,
    async (route) => {
      await route.fulfill({ json: ok(index()) })
    }
  )
}

test("shows the live index and the progress of an open re-index", async ({
  page,
}, testInfo) => {
  await authenticateAs(page, "SUPER_ADMIN")
  await mockChatModels(page, () => embeddingIndex(run("RUNNING", 480)))

  await page.goto("/admin/models")

  const panel = page.getByRole("region", { name: "Chỉ mục embedding" })
  await expect(
    panel.getByText("Đang dùng text-embedding-3-small")
  ).toBeVisible()
  await expect(panel.getByText("Collection đang dùng")).toBeVisible()
  await expect(panel.getByText("unisage_chunks", { exact: true })).toBeVisible()
  await expect(
    panel.getByText("unisage_chunks__20261017080000", { exact: true })
  ).toBeVisible()
  await expect(panel.getByText("Đang re-index", { exact: true })).toBeVisible()
  await expect(panel.getByText(/480 \/ 1\.200 đoạn \(40%\)/)).toBeVisible()
  await expect(
    panel.getByRole("button", { name: "Huỷ re-index" })
  ).toBeVisible()

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath(`embedding-index-${testInfo.project.name}.png`),
  })
})

test("activating a model of another vector space offers a re-index", async ({
  page,
}, testInfo) => {
  let currentRun: ReturnType<typeof run> | null = null
  await authenticateAs(page, "SUPER_ADMIN")
  await mockChatModels(page, () => embeddingIndex(currentRun))
  await page.route(
    `**/api/v1/master/chat-models/${TARGET_MODEL_ID}/status`,
    async (route) => {
      await route.fulfill({
        json: {
          code: 2517,
          message:
            "Model embedding này khác danh tính với dữ liệu đã index, cần re-index trước khi dùng.",
        },
        status: 409,
      })
    }
  )
  let reindexBody: unknown
  await page.route(
    "**/api/v1/master/chat-models/embedding-index/reindex",
    async (route) => {
      reindexBody = route.request().postDataJSON()
      currentRun = run("QUEUED", 0)
      await route.fulfill({ json: ok(currentRun), status: 201 })
    }
  )

  await page.goto("/admin/models")
  await page.getByRole("button", { name: "Kích hoạt" }).click()

  const dialog = page.getByRole("dialog", {
    name: "Re-index sang mô hình embedding khác",
  })
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole("radio", { name: /text-embedding-3-large/ })
  ).toBeChecked()
  await page.screenshot({
    path: testInfo.outputPath(
      `embedding-reindex-dialog-${testInfo.project.name}.png`
    ),
  })

  await dialog.getByRole("button", { name: "Bắt đầu re-index" }).click()

  await expect(dialog).toBeHidden()
  expect(reindexBody).toEqual({ chatModelId: TARGET_MODEL_ID })
  await expect(
    page
      .getByRole("region", { name: "Chỉ mục embedding" })
      .getByText("Đang chờ worker", { exact: true })
  ).toBeVisible()
})
