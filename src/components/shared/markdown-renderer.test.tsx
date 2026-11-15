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

describe("MarkdownRenderer citation markers", () => {
  afterEach(cleanup)

  it("attaches a marker to the cited text and the punctuation after it", () => {
    const { container } = render(
      <MarkdownRenderer content="đến hết thứ Tư (ngày 02/09/2026) [1] ." />
    )

    expect(container.textContent).toBe("đến hết thứ Tư (ngày 02/09/2026)1.")
  })
})

describe("MarkdownRenderer math", () => {
  afterEach(() => cleanup())

  it("typesets a $$ block with KaTeX and keeps the text around it", () => {
    render(
      <MarkdownRenderer
        content={
          "Công thức:\n\n$$\n\\text{XT2} = \\text{ĐTN} + \\text{ĐC}\n$$\n\nTrong đó ĐTN là tổng điểm [1]."
        }
      />
    )
    const block = screen.getByTestId("math-block")
    expect(block.querySelector(".katex")).not.toBeNull()
    expect(block.textContent).toContain("XT2")
    expect(screen.getByText(/Trong đó ĐTN là tổng điểm/)).toBeInTheDocument()
  })

  it("renders an unparseable formula as text instead of throwing", () => {
    render(<MarkdownRenderer content={"$$\\frac{a}{$$"} />)
    expect(screen.getByTestId("math-block").textContent).toContain("frac")
  })
})

describe("MarkdownRenderer tables", () => {
  afterEach(cleanup)

  it("renders pipe rows without a separator row as a headerless table", () => {
    const { container } = render(
      <MarkdownRenderer
        content={
          "| Thời gian | Tự đánh giá<br>(thang điểm 10) |\n| Tuần 1<br>(01/07/2026) | 10 |"
        }
      />
    )

    expect(container.querySelector("table")).not.toBeNull()
    expect(container.querySelector("thead")).toBeNull()
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2)
    expect(screen.getByText("10")).toBeTruthy()
  })
})
