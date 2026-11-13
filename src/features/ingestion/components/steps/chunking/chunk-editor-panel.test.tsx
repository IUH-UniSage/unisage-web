import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ChunkEditorPanel } from "@/features/ingestion/components/steps/chunking/chunk-editor-panel"
import type { StepProps } from "@/features/ingestion/components/steps/shared"
import { chunkSchema } from "@/features/ingestion/schemas/ingestion-schemas"

afterEach(cleanup)

const chunk = chunkSchema.parse({
  chunk_index: 4,
  content: "Nội dung gốc",
  region_type: "text",
})

function renderPanel() {
  const updateChunkContent = vi.fn()
  const wizard = {
    chunks: [chunk],
    deleteChunk: vi.fn(),
    updateChunkContent,
  } as unknown as StepProps["wizard"]
  render(<ChunkEditorPanel chunk={chunk} wizard={wizard} />)
  return {
    editor: screen.getByLabelText("Nội dung đoạn #1"),
    updateChunkContent,
  }
}

describe("ChunkEditorPanel autosave", () => {
  it("saves the draft when the editor loses focus", () => {
    const { editor, updateChunkContent } = renderPanel()

    fireEvent.change(editor, { target: { value: "Nội dung đã sửa" } })
    fireEvent.blur(editor)

    expect(updateChunkContent).toHaveBeenCalledWith(4, "Nội dung đã sửa")
  })

  it("does nothing on blur when nothing changed", () => {
    const { editor, updateChunkContent } = renderPanel()

    fireEvent.blur(editor)

    expect(updateChunkContent).not.toHaveBeenCalled()
  })
})
