import { describe, expect, it } from "vitest"

import {
  embeddingIndexSchema,
  isOpenReindexRun,
} from "@/features/chat-models/schemas/embedding-index-schemas"
import {
  adminDocumentIngestWizardPath,
  INGEST_RESTART_PARAM,
} from "@/constants/paths"

const run = {
  failedPoints: 0,
  id: "7d2b9e3a-4b6c-4c3a-9f5d-3e4f5a6b7c83",
  processedPoints: 10,
  sourceCollection: "unisage_chunks",
  status: "RUNNING",
  targetCollection: "unisage_chunks__20261017080000",
  targetModel: {
    id: "6c1a8d2f-3a5b-4b2f-8e4c-2d3e4f5a6b72",
    llmModelName: "text-embedding-3-large",
  },
  totalPoints: 100,
}

describe("embeddingIndexSchema", () => {
  it("parses an index before anything was ingested", () => {
    const index = embeddingIndexSchema.parse({
      activeCollection: "unisage_chunks",
      activeIdentity: null,
      activeModel: null,
      baseCollection: "unisage_chunks",
      currentRun: null,
      lastRun: null,
    })

    expect(index.activeIdentity).toBeNull()
    expect(isOpenReindexRun(index.currentRun)).toBe(false)
  })

  it("treats only QUEUED and RUNNING runs as open", () => {
    const index = embeddingIndexSchema.parse({
      activeCollection: "unisage_chunks",
      baseCollection: "unisage_chunks",
      currentRun: run,
    })

    expect(isOpenReindexRun(index.currentRun)).toBe(true)
    expect(isOpenReindexRun({ ...index.currentRun!, status: "QUEUED" })).toBe(
      true
    )
    expect(
      isOpenReindexRun({ ...index.currentRun!, status: "SUCCEEDED" })
    ).toBe(false)
  })
})

describe("ingest wizard restart path", () => {
  it("adds a restart nonce only when asked", () => {
    expect(adminDocumentIngestWizardPath("doc-1")).toBe(
      "/admin/documents/doc-1/ingest"
    )
    expect(adminDocumentIngestWizardPath("doc-1", { restart: true })).toMatch(
      new RegExp(
        `^/admin/documents/doc-1/ingest\\?${INGEST_RESTART_PARAM}=\\d+$`
      )
    )
  })
})
