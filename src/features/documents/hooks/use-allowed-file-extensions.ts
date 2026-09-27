import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { DEFAULT_ALLOWED_DOCUMENT_FILE_EXTENSIONS } from "@/features/documents/schemas/document-schemas"
import { systemConfigOptions } from "@/features/system-settings/queries/options"
import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"

const ALLOWED_EXTENSIONS_KEY = "ingest.allowed_file_extensions"

/**
 * Reads the admin setting's JSON array (e.g. `[".pdf",".docx"]`), normalized
 * to lowercase with a leading dot. Null when the row is missing or unusable,
 * so the caller falls back to the default list instead of rejecting every file.
 */
export function parseAllowedExtensions(rows: SystemConfig[]): string[] | null {
  const row = rows.find((config) => config.configKey === ALLOWED_EXTENSIONS_KEY)
  if (!row) return null

  try {
    const parsed: unknown = JSON.parse(row.value)
    if (!Array.isArray(parsed)) return null
    const extensions = parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .map((item) => (item.startsWith(".") ? item : `.${item}`))
    return extensions.length > 0 ? extensions : null
  } catch {
    return null
  }
}

/**
 * The upload whitelist from System Settings, so adding a file type there
 * reaches the upload form too - the backend already enforced the setting,
 * but the form still checked a hardcoded list (UNISAGE-94). Falls back to the
 * default list while loading or when the role can't read system settings.
 */
export function useAllowedFileExtensions(): string[] {
  const { data } = useQuery({
    ...systemConfigOptions.list(),
    retry: false,
    throwOnError: false,
  })

  // Stable reference, so the upload form's schema is rebuilt only when the
  // setting actually changes.
  return useMemo(
    () =>
      (data && parseAllowedExtensions(data)) ??
      DEFAULT_ALLOWED_DOCUMENT_FILE_EXTENSIONS,
    [data]
  )
}
