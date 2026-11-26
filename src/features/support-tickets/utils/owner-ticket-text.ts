import type { Ticket } from "@/features/support-tickets/schemas/ticket-schemas"

// Calculation-feedback tickets filed before the backend wrote a student-readable
// description still carry staff details in the owner's part: the enum name after
// the reason ("Sai kết quả (WRONG_RESULT)"), the stored file name of the source
// and the agent's run id. The owner's view drops those; staff views keep the text.
const TECHNICAL_LINE =
  /^\s*(?:run_id\s*:|Nguồn đã hiển thị\s*:|Ghi chú\s*:\s*\(không có\)\s*$)/i
// "Người dùng đánh giá kết quả tính T1 là Sai." - T1 is the internal item id.
const LEGACY_VERDICT = /^Người dùng đánh giá kết quả tính \S+ là Sai\.?$/
const ENUM_SUFFIX = /\s*\([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\)/g
// "Tính sai (gpa_term_1): Sai kết quả" - the item id is internal.
const CALCULATION_TITLE = /^Tính sai \([^)]*\):\s*/

export function ownerTicketTitle(ticket: Pick<Ticket, "title" | "type">) {
  return ticket.type === "AI_CALCULATION_WRONG"
    ? ticket.title.replace(CALCULATION_TITLE, "Kết quả tính sai: ")
    : ticket.title
}

export function ownerTicketDescription(
  ticket: Pick<Ticket, "description" | "type">
): string {
  if (ticket.type !== "AI_CALCULATION_WRONG") return ticket.description
  return ticket.description
    .split("\n")
    .filter((line) => !TECHNICAL_LINE.test(line))
    .map((line) =>
      LEGACY_VERDICT.test(line.trim())
        ? "Kết quả tính toán được đánh giá là Sai."
        : line.replace(ENUM_SUFFIX, "").replace(/\s+·\s*$/, "")
    )
    .join("\n")
    .trim()
}

/** The description on one line for a list row: its lines joined by " · ". */
export function ticketSummary(description: string): string {
  return description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" · ")
}
