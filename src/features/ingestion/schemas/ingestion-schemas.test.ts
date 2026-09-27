import { describe, expect, it } from "vitest"

import {
  chunkingResponseSchema,
  chunkSchema,
  embeddingRequestSchema,
} from "@/features/ingestion/schemas/ingestion-schemas"

// Phase 7 (backend `changes/13-09-2026-Chunking-Structural-Metadata/plan.md`):
// before this schema was extended, `chunkSchema` only kept
// chunk_index/content/region_type, so every structural field the backend
// added (heading_path/page_start/source_locator/...) was silently stripped
// the moment a response touched the frontend, even though the backend
// itself was already correct. These tests guard that regression directly.

const fullChunkFixture = {
  chunk_index: 0,
  content: "Điều 5. Nội dung quy định.",
  region_type: "table",
  source_type: "pdf",
  block_index: 3,
  heading_path: ["Chương 1", "Điều 5"],
  page_start: 5,
  page_end: 6,
  source_locator: {
    section: "Chương 1 > Điều 5",
    sheet_name: null,
    row_start: 1,
    row_end: 2,
    row_count: 2,
    table_id: "table-3",
    row_part: null,
    row_part_count: null,
    is_partial_row: false,
  },
  column_names: ["Tên", "Điểm"],
  has_header: true,
  header_source: "inferred",
  header_confidence: 0.6,
  chunking_version: "2026-09-structural-v1",
}

const legacyChunkFixture = {
  chunk_index: 0,
  content: "Nội dung cũ",
  region_type: "text",
}

describe("chunkSchema", () => {
  it("parses a fully-populated /ingestion/chunking response chunk without dropping any field", () => {
    const parsed = chunkSchema.parse(fullChunkFixture)

    expect(parsed).toMatchObject(fullChunkFixture)
  })

  it("parses a legacy/old chunk (only chunk_index/content/region_type) without throwing", () => {
    const parsed = chunkSchema.parse(legacyChunkFixture)

    expect(parsed.chunk_index).toBe(0)
    expect(parsed.content).toBe("Nội dung cũ")
    expect(parsed.region_type).toBe("text")
    // Defaulted fields, not silently dropped as `undefined`.
    expect(parsed.heading_path).toEqual([])
    expect(parsed.has_header).toBe(false)
  })

  it("rejects an unknown source_type / header_source enum value", () => {
    expect(() =>
      chunkSchema.parse({ ...legacyChunkFixture, source_type: "csv" })
    ).toThrow()
    expect(() =>
      chunkSchema.parse({ ...legacyChunkFixture, header_source: "verified" })
    ).toThrow()
  })

  it("accepts null for every nullable structural field", () => {
    const parsed = chunkSchema.parse({
      ...legacyChunkFixture,
      source_type: null,
      block_index: null,
      page_start: null,
      page_end: null,
      source_locator: null,
      column_names: null,
    })

    expect(parsed.source_type).toBeNull()
    expect(parsed.block_index).toBeNull()
    expect(parsed.source_locator).toBeNull()
  })
})

describe("round-trip through chunkingResponseSchema -> embeddingRequestSchema", () => {
  it("keeps every structural field across both parses (chunking response -> embedding request)", () => {
    const chunkingResponse = chunkingResponseSchema.parse({
      chunks: [fullChunkFixture],
    })

    // Mirrors runEmbed(): the parsed chunks (possibly content-edited) are
    // sent straight back as the embedding request body.
    const embeddingRequest = embeddingRequestSchema.parse({
      document_id: "doc-1",
      department_id: "CNTT",
      access_level: 2,
      object_key: "docs/handbook.pdf",
      chunks: chunkingResponse.chunks,
      is_public: false,
    })

    expect(embeddingRequest.chunks[0]).toMatchObject(fullChunkFixture)
  })

  it("still round-trips a legacy chunk with no structural fields at all", () => {
    const chunkingResponse = chunkingResponseSchema.parse({
      chunks: [legacyChunkFixture],
    })

    const embeddingRequest = embeddingRequestSchema.parse({
      document_id: "doc-1",
      department_id: "CNTT",
      access_level: 2,
      object_key: "docs/handbook.pdf",
      chunks: chunkingResponse.chunks,
      is_public: false,
    })

    expect(embeddingRequest.chunks).toHaveLength(1)
    expect(embeddingRequest.chunks[0]?.content).toBe("Nội dung cũ")
  })
})
