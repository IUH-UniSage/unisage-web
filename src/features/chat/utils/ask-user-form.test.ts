import { describe, expect, it } from "vitest"

import {
  formatAskUserFormAnswer,
  resolveAnsweredSelections,
  type AskUserForm,
} from "@/features/chat/utils/ask-user-form"

const form: AskUserForm = {
  type: "ask_user_form",
  fields: [
    {
      field: "he_dao_tao",
      label: "Hệ đào tạo",
      options: [
        { id: "chinh_quy", label: "Chính quy" },
        { id: "lien_thong", label: "Liên thông" },
      ],
    },
    {
      field: "khoa_nhap_hoc",
      label: "Khóa nhập học",
      options: [
        { id: "k20", label: "K20" },
        { id: "k21", label: "K21" },
      ],
    },
  ],
}

describe("resolveAnsweredSelections", () => {
  it("round-trips a fully answered multi-field form", () => {
    const selections = { he_dao_tao: "chinh_quy", khoa_nhap_hoc: "k21" }
    const answer = formatAskUserFormAnswer(form, selections)

    expect(resolveAnsweredSelections(form, answer)).toEqual(selections)
  })

  it("round-trips a single-field form", () => {
    const singleField: AskUserForm = { ...form, fields: [form.fields[0]] }
    const answer = formatAskUserFormAnswer(singleField, {
      he_dao_tao: "lien_thong",
    })

    expect(resolveAnsweredSelections(singleField, answer)).toEqual({
      he_dao_tao: "lien_thong",
    })
  })

  it("returns only the answered fields of a partial multi-field submit", () => {
    const answer = formatAskUserFormAnswer(form, { khoa_nhap_hoc: "k20" })

    expect(resolveAnsweredSelections(form, answer)).toEqual({
      khoa_nhap_hoc: "k20",
    })
  })

  it("returns nothing for a reply that isn't a form answer", () => {
    expect(
      resolveAnsweredSelections(form, "Cho mình hỏi học phí kỳ này bao nhiêu?")
    ).toEqual({})
  })

  it("prefers the longest match when one option label prefixes another", () => {
    const prefixing: AskUserForm = {
      type: "ask_user_form",
      fields: [
        {
          field: "khoa_nhap_hoc",
          label: "Khóa nhập học",
          options: [
            { id: "k20", label: "K20" },
            { id: "k20_2020", label: "K20 (2020)" },
          ],
        },
      ],
    }
    const answer = formatAskUserFormAnswer(prefixing, {
      khoa_nhap_hoc: "k20_2020",
    })

    expect(resolveAnsweredSelections(prefixing, answer)).toEqual({
      khoa_nhap_hoc: "k20_2020",
    })
  })

  it("tolerates an option label containing the '. ' answer separator", () => {
    const dotted: AskUserForm = {
      type: "ask_user_form",
      fields: [
        {
          field: "bac_hoc",
          label: "Bậc học",
          options: [{ id: "ths", label: "Th.S. Ứng dụng" }],
        },
        form.fields[1],
      ],
    }
    const answer = formatAskUserFormAnswer(dotted, {
      bac_hoc: "ths",
      khoa_nhap_hoc: "k21",
    })

    expect(resolveAnsweredSelections(dotted, answer)).toEqual({
      bac_hoc: "ths",
      khoa_nhap_hoc: "k21",
    })
  })
})
