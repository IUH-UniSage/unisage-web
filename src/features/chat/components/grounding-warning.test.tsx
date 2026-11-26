import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { GroundingWarning } from "@/features/chat/components/grounding-warning"

afterEach(cleanup)

describe("GroundingWarning", () => {
  it("lists the figures not found in the cited sources", () => {
    render(
      <GroundingWarning
        grounding={{ schema_version: 1, ungrounded: ["42.500.000", "16"] }}
        numbers={{}}
        onOpenSource={vi.fn()}
      />
    )

    expect(screen.getByRole("note")).toHaveTextContent(
      "Con số 42.500.000, 16 không tìm thấy trong tài liệu được trích dẫn"
    )
  })

  it("names the source a miscited figure is in by its marker number and opens it", async () => {
    const onOpenSource = vi.fn()
    render(
      <GroundingWarning
        grounding={{
          miscited: [{ sources: [3], value: "930.000" }],
          schema_version: 1,
        }}
        numbers={{ 1: 1, 3: 2 }}
        onOpenSource={onOpenSource}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: "nguồn 2" }))

    expect(screen.getByRole("note")).toHaveTextContent(
      "Con số 930.000 không có trong nguồn được trích mà nằm ở nguồn 2."
    )
    expect(onOpenSource).toHaveBeenCalledWith(3)
  })
})
