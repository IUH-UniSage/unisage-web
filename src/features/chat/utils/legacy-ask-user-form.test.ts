import { describe, expect, it } from "vitest"

import { stripLegacyAskUserForm } from "@/features/chat/utils/legacy-ask-user-form"

const FORM_JSON = JSON.stringify({
  fields: [
    {
      field: "khoa_nhap_hoc",
      label: "Khóa nhập học",
      options: [
        { id: "k20", label: "K20" },
        { id: "k21", label: "K21" },
      ],
    },
  ],
  type: "ask_user_form",
})

describe("stripLegacyAskUserForm", () => {
  it("strips the fence from the text and returns the form read-only", () => {
    const { form, text } = stripLegacyAskUserForm(
      `Bạn cho mình biết khoá nhé.\n\n\`\`\`json\n${FORM_JSON}\n\`\`\``
    )

    expect(text).toBe("Bạn cho mình biết khoá nhé.")
    expect(form?.fields[0].label).toBe("Khóa nhập học")
    expect(form?.fields[0].options).toHaveLength(2)
  })

  it("strips duplicated fences and a form with empty fields", () => {
    const empty = JSON.stringify({ fields: [], type: "ask_user_form" })
    const { form, text } = stripLegacyAskUserForm(
      `Câu hỏi\n\`\`\`json\n${empty}\n\`\`\`\n\`\`\`json\n${FORM_JSON}\n\`\`\``
    )

    expect(text).toBe("Câu hỏi")
    expect(form).not.toBeNull()
  })

  it("tolerates trailing // comments the model used to add", () => {
    const commented = `{"type": "ask_user_form", "fields": [{"field": "nganh", "label": "Ngành", "options": null}]} // ghi chú`
    const { form, text } = stripLegacyAskUserForm(
      `A\n\`\`\`json\n${commented}\n\`\`\``
    )

    expect(text).toBe("A")
    expect(form?.fields[0].options).toEqual([])
  })

  it("keeps unrelated json code blocks", () => {
    const content = 'Ví dụ:\n```json\n{"a": 1}\n```'
    expect(stripLegacyAskUserForm(content)).toEqual({
      form: null,
      text: content,
    })
  })
})
