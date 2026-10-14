import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { MarkdownRenderer } from "@/components/shared/markdown-renderer"

describe("MarkdownRenderer links", () => {
  afterEach(cleanup)

  it("makes a bare URL clickable in a new tab, leaving trailing punctuation out", () => {
    render(
      <MarkdownRenderer content="Xem tại https://tuyensinh.iuh.edu.vn/diem-chuan.html." />
    )

    const link = screen.getByRole("link", {
      name: "https://tuyensinh.iuh.edu.vn/diem-chuan.html",
    })
    expect(link).toHaveAttribute(
      "href",
      "https://tuyensinh.iuh.edu.vn/diem-chuan.html"
    )
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("opens a markdown link in a new tab", () => {
    render(
      <MarkdownRenderer content="- [Đề án tuyển sinh 2026](https://iuh.edu.vn/de-an.pdf)" />
    )

    const link = screen.getByRole("link", { name: "Đề án tuyển sinh 2026" })
    expect(link).toHaveAttribute("href", "https://iuh.edu.vn/de-an.pdf")
    expect(link).toHaveAttribute("target", "_blank")
  })

  it("keeps a link with an unsafe scheme as plain text", () => {
    render(<MarkdownRenderer content="[bấm vào](javascript:alert(1))" />)

    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(screen.getByText(/bấm vào/)).toBeInTheDocument()
  })
})
