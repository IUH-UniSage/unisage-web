import type {
  AlertChannel,
  AlertStatus,
  AlertType,
} from "@/features/cost-management/schemas/cost-management-schemas"

const ALERT_TYPE_LABELS = {
  THRESHOLD: "Vượt ngưỡng",
  SPIKE: "Tăng đột biến",
} as const satisfies Record<AlertType, string>

export function getAlertTypeLabel(alertType: AlertType): string {
  return ALERT_TYPE_LABELS[alertType]
}

const ALERT_CHANNEL_LABELS = {
  IN_APP: "Trong ứng dụng",
  EMAIL: "Email",
  SLACK: "Slack",
} as const satisfies Record<AlertChannel, string>

export function getAlertChannelLabel(channel: AlertChannel): string {
  return ALERT_CHANNEL_LABELS[channel]
}

const ALERT_STATUS_LABELS = {
  PENDING: "Đang chờ gửi",
  SENT: "Đã gửi",
  FAILED: "Gửi lỗi",
  GAVE_UP: "Đã bỏ cuộc",
  SKIPPED: "Bỏ qua (chưa cấu hình)",
} as const satisfies Record<AlertStatus, string>

export function getAlertStatusLabel(status: AlertStatus): string {
  return ALERT_STATUS_LABELS[status]
}

export function getAlertStatusBadgeClassName(status: AlertStatus): string {
  switch (status) {
    case "SENT":
      return "border-transparent bg-success/10 text-success"
    case "FAILED":
    case "GAVE_UP":
      return "border-transparent bg-destructive/10 text-destructive"
    case "SKIPPED":
      return "border-transparent bg-muted text-muted-foreground"
    case "PENDING":
      return "border-transparent bg-warning/40 text-warning-foreground"
  }
}
