import type { UsagePurpose } from "@/features/cost-management/schemas/cost-management-schemas"

const PURPOSE_LABELS = {
  CHAT: "Chat",
  EMBEDDING: "Embedding",
  EXTRACTION: "Trích xuất",
  INGEST: "Ingest tài liệu",
  SEMANTIC_CHUNKING: "Chia đoạn (semantic)",
} as const satisfies Record<UsagePurpose, string>

export function getUsagePurposeLabel(purpose: UsagePurpose): string {
  return PURPOSE_LABELS[purpose]
}

export function getUsagePurposeLabelByKey(key: string): string {
  return key in PURPOSE_LABELS ? PURPOSE_LABELS[key as UsagePurpose] : key
}
