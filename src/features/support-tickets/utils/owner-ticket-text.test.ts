import { describe, expect, it } from "vitest"

import {
  ownerTicketDescription,
  ownerTicketTitle,
  ticketSummary,
} from "@/features/support-tickets/utils/owner-ticket-text"

describe("owner ticket text", () => {
  it("drops staff details from a calculation ticket", () => {
    const description = [
      "Người dùng đánh giá kết quả tính gpa_1 là Sai.",
      "Lý do: Sai kết quả (WRONG_RESULT)",
      "Ghi chú: (không có)",
      "Nguồn đã hiển thị: 9b699871-aaaa.pdf · Điều 10",
      "run_id: 1a98f786-bbbb",
    ].join("\n")

    expect(
      ownerTicketDescription({ description, type: "AI_CALCULATION_WRONG" })
    ).toBe("Kết quả tính toán được đánh giá là Sai.\nLý do: Sai kết quả")
    expect(
      ownerTicketTitle({
        title: "Tính sai (gpa_1): Sai kết quả",
        type: "AI_CALCULATION_WRONG",
      })
    ).toBe("Kết quả tính sai: Sai kết quả")
  })

  it("leaves other tickets as written", () => {
    const description = "run_id: do người dùng tự gõ (WRONG_RESULT)"
    expect(ownerTicketDescription({ description, type: "OTHER" })).toBe(
      description
    )
  })

  it("joins a description's lines for a list row", () => {
    expect(ticketSummary("Dòng một.\n\nLý do: Sai kết quả\n")).toBe(
      "Dòng một. · Lý do: Sai kết quả"
    )
  })
})
