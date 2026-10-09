import type { Message } from "@/features/chat/schemas/chat-schemas"
import type {
  ClarificationAnswers,
  ClarificationPanel,
} from "@/features/chat/schemas/clarification-schemas"

// The panel of unisage-agent/contracts/chat-sse.md §3, verbatim.
export const CONTRACT_PANEL: ClarificationPanel = {
  panel_id: "7f1c2a9e-0000-4000-8000-000000000001",
  questions: [
    {
      allow_other: true,
      id: "q1",
      kind: "choice",
      max_items: null,
      max_length: null,
      number: null,
      options: [
        { description: null, id: "k19", label: "K19", recommended: false },
        {
          description: "Nhập học 2020",
          id: "k20",
          label: "K20",
          recommended: true,
        },
      ],
      prompt: "Bạn thuộc khoá nào?",
      tab_label: "Khoá",
    },
    {
      allow_other: false,
      id: "q2",
      kind: "number",
      max_items: null,
      max_length: null,
      number: { max: "10", min: "0", step: "0.01", unit: null },
      options: [],
      prompt: "Điểm cuối kỳ (thang 10)",
      tab_label: "Điểm CK",
    },
    {
      allow_other: false,
      id: "q3",
      kind: "number_list",
      max_items: 20,
      max_length: null,
      number: { max: "10", min: "0", step: "0.01", unit: null },
      options: [],
      prompt: "Các cột điểm thực hành",
      tab_label: "Điểm TH",
    },
    {
      allow_other: false,
      id: "q4",
      kind: "course_table",
      max_items: 30,
      max_length: null,
      number: null,
      options: [],
      prompt: "Nhập các môn để tính GPA",
      tab_label: "Các môn",
    },
    {
      allow_other: false,
      id: "q5",
      kind: "number_or_list",
      max_items: 20,
      max_length: null,
      number: { max: "10", min: "0", step: "0.01", unit: null },
      options: [],
      prompt:
        "Điểm thường xuyên: nhập TBtx nếu đã biết, hoặc nhập từng cột TX1…TXn",
      tab_label: "Điểm TX",
    },
  ],
  schema_version: 1,
}

// A panel with many tabs (contract §3: no 12-question cut, ids up to q99).
export const MANY_TABS_PANEL: ClarificationPanel = {
  panel_id: "7f1c2a9e-0000-4000-8000-000000000015",
  questions: Array.from({ length: 15 }, (_, index) => ({
    allow_other: false,
    id: `q${index + 1}`,
    kind: "number" as const,
    max_items: null,
    max_length: null,
    number: { max: "10", min: "0", step: "0.01", unit: null },
    options: [],
    prompt: `Điểm môn thứ ${index + 1}`,
    tab_label: `Môn học số ${index + 1}`,
  })),
  schema_version: 1,
}

// `metadata.clarification_answers` of contract §5.
export const CONTRACT_ANSWERS: ClarificationAnswers = {
  items: [
    {
      display: "K20",
      kind: "choice",
      option_id: "k20",
      prompt: "Bạn thuộc khoá nào?",
      question_id: "q1",
      tab_label: "Khoá",
    },
    {
      display: "9, 8",
      kind: "number_list",
      prompt: "Các cột điểm thực hành",
      question_id: "q3",
      tab_label: "Điểm TH",
    },
    {
      display: null,
      kind: "course_table",
      prompt: "Nhập các môn để tính GPA",
      question_id: "q4",
      rows: [
        { credits: 3, name: "Toán", score: "8.5" },
        { credits: 2, name: null, score: "B+" },
      ],
      tab_label: "Các môn",
    },
  ],
  panel_id: CONTRACT_PANEL.panel_id,
  schema_version: 1,
}

let counter = 0

export function buildMessage(overrides: Partial<Message> = {}): Message {
  counter += 1
  return {
    chatModelId: null,
    citations: null,
    content: "",
    conversationId: "4d0f7f4e-8a3b-4c55-9d2e-0c7a3e9b1a11",
    createdAt: "2026-10-09T00:00:00.000Z",
    id: `00000000-0000-4000-8000-${String(counter).padStart(12, "0")}`,
    metadata: null,
    retrievalScore: null,
    role: "ASSISTANT",
    status: "COMPLETED",
    ticketId: null,
    ...overrides,
  }
}
