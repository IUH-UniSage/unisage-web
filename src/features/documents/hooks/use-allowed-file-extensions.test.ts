import { describe, expect, it } from "vitest"

import { parseAllowedExtensions } from "@/features/documents/hooks/use-allowed-file-extensions"
import { createDocumentFormSchema } from "@/features/documents/schemas/document-schemas"
import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"

function row(value: string): SystemConfig {
  return {
    category: "INGEST",
    configKey: "ingest.allowed_file_extensions",
    id: "11111111-1111-4111-8111-111111111111",
    isEditable: true,
    label: "Định dạng file được phép",
    value,
    valueType: "JSON",
  }
}

describe("parseAllowedExtensions", () => {
  it("reads the admin setting and normalizes each entry", () => {
    expect(parseAllowedExtensions([row('[".PDF", "xlsx", " .txt "]')])).toEqual(
      [".pdf", ".xlsx", ".txt"]
    )
  })

  it("returns null when the row is missing, malformed or empty", () => {
    expect(parseAllowedExtensions([])).toBeNull()
    expect(parseAllowedExtensions([row("not json")])).toBeNull()
    expect(parseAllowedExtensions([row("[]")])).toBeNull()
  })
})

describe("createDocumentFormSchema", () => {
  const base = {
    fileType: "PDF",
    isPublic: true,
    title: "Quy chế",
  }

  it("accepts a file type added in System Settings", () => {
    const schema = createDocumentFormSchema([".pdf", ".xlsx"])
    const file = new File(["x"], "bang-diem.xlsx")

    expect(schema.safeParse({ ...base, file }).success).toBe(true)
  })

  it("rejects .doc with the default list", () => {
    const schema = createDocumentFormSchema()
    const file = new File(["x"], "cu.doc")

    expect(schema.safeParse({ ...base, file }).success).toBe(false)
  })
})
