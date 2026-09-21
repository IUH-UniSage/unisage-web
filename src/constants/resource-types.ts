// Mirrors com.unisage.backend.entity.enums.ResourceType — keep in sync with the
// backend enum (name + displayName) when it changes.
export const RESOURCE_TYPE_LABELS = {
  USER: "Người dùng",
  ROLE: "Vai trò",
  PERMISSION: "Quyền hạn",
  DEPARTMENT: "Phòng ban",
  USER_DEPARTMENT_ACCESS: "Phân quyền truy cập phòng ban",
  DOCUMENT: "Tài liệu",
  CATEGORY: "Danh mục",
  ACCESS_LEVEL: "Cấp độ truy cập",
  CHAT_MODEL: "Mô hình chat",
  LLM_TRACE_LOG: "Nhật ký LLM",
  INGEST: "Nạp liệu",
  CONVERSATION: "Hội thoại",
  MESSAGE: "Tin nhắn",
  TICKET: "Yêu cầu hỗ trợ",
  USAGE_LIMIT_PLAN: "Gói hạn mức",
  AUDIT_LOG: "Nhật ký hệ thống",
  SYSTEM: "Hệ thống",
  OTHER: "Khác",
} as const

export type ResourceTypeKey = keyof typeof RESOURCE_TYPE_LABELS

const RESOURCE_TYPE_BADGE_COLOR = {
  // Auth & Access
  USER: "sky",
  ROLE: "violet",
  PERMISSION: "teal",
  // Knowledge Base
  DEPARTMENT: "knowledge",
  USER_DEPARTMENT_ACCESS: "magenta",
  DOCUMENT: "success",
  CATEGORY: "warning",
  ACCESS_LEVEL: "muted",
  // AI / Chatbot
  CHAT_MODEL: "violet",
  LLM_TRACE_LOG: "muted",
  INGEST: "teal",
  // Conversation
  CONVERSATION: "success",
  MESSAGE: "magenta",
  // Support
  TICKET: "teal",
  USAGE_LIMIT_PLAN: "sky",
  // Logs
  AUDIT_LOG: "warning",
  // System
  SYSTEM: "sky",
  OTHER: "muted",
} as const satisfies Record<
  ResourceTypeKey,
  | "knowledge"
  | "magenta"
  | "muted"
  | "sky"
  | "success"
  | "teal"
  | "violet"
  | "warning"
>

const BADGE_COLOR_CLASSNAME = {
  knowledge: "border-transparent bg-knowledge/15 text-knowledge",
  magenta: "border-transparent bg-magenta/15 text-magenta",
  muted: "border-transparent bg-muted text-muted-foreground",
  sky: "border-transparent bg-sky/10 text-sky",
  success: "border-transparent bg-success/10 text-success",
  teal: "border-transparent bg-teal/15 text-teal",
  violet: "border-transparent bg-violet/15 text-violet",
  warning: "border-transparent bg-warning text-warning-foreground",
} as const

export function getResourceTypeLabel(resource: string): string {
  return (
    RESOURCE_TYPE_LABELS[resource as ResourceTypeKey] ??
    resource.replaceAll("_", " ")
  )
}

export function getResourceTypeBadgeClassName(resource: string): string {
  const color = RESOURCE_TYPE_BADGE_COLOR[resource as ResourceTypeKey]
  return color ? BADGE_COLOR_CLASSNAME[color] : BADGE_COLOR_CLASSNAME.muted
}
