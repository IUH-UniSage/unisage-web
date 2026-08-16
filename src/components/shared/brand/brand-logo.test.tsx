import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { BrandLogo } from "@/components/shared/brand/brand-logo"

describe("BrandLogo", () => {
  it("renders the product and workspace names", () => {
    render(<BrandLogo workspace="Quản trị hệ thống" />)

    expect(screen.getByRole("img", { name: "UniSage" })).toBeInTheDocument()
    expect(screen.getByText("Quản trị hệ thống")).toBeInTheDocument()
  })
})
