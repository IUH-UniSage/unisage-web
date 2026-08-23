// Mirrors com.unisage.backend.entity.enums.DocStatus — keep in sync with the
// backend enum when it changes.
export const DOC_STATUS_LABELS = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn tất",
  FAILED: "Thất bại",
  OUTDATED: "Lỗi thời",
} as const

export type DocStatusKey = keyof typeof DOC_STATUS_LABELS

const DOC_STATUS_BADGE_COLOR = {
  PENDING: "warning",
  PROCESSING: "sky",
  COMPLETED: "success",
  FAILED: "destructive",
  OUTDATED: "muted",
} as const satisfies Record<
  DocStatusKey,
  "destructive" | "muted" | "sky" | "success" | "warning"
>

const BADGE_COLOR_CLASSNAME = {
  destructive: "border-transparent bg-destructive/10 text-destructive",
  muted: "border-transparent bg-muted text-muted-foreground",
  sky: "border-transparent bg-sky/10 text-sky",
  success: "border-transparent bg-success/10 text-success",
  warning: "border-transparent bg-warning text-warning-foreground",
} as const

export function getDocStatusLabel(status: string): string {
  return DOC_STATUS_LABELS[status as DocStatusKey] ?? status
}

export function getDocStatusBadgeClassName(status: string): string {
  const color = DOC_STATUS_BADGE_COLOR[status as DocStatusKey]
  return color ? BADGE_COLOR_CLASSNAME[color] : BADGE_COLOR_CLASSNAME.muted
}
