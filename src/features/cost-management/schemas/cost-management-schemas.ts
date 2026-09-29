import { z } from "zod"

// ── Usage log summary (Overview tab: KPI cards, donut/bar/line charts) ──────

export const usageLogSummaryBucketSchema = z.object({
  estimatedUnpricedCostUsd: z.number(),
  key: z.string(),
  pricedCostUsd: z.number(),
  requestCount: z.number().int().nonnegative(),
  totalInputTokens: z.number().int().nonnegative(),
  totalOutputTokens: z.number().int().nonnegative(),
})
export type UsageLogSummaryBucket = z.infer<typeof usageLogSummaryBucketSchema>

export const usageLogGroupBySchema = z.enum([
  "purpose",
  "provider",
  "model",
  "day",
  "user",
])
export type UsageLogGroupBy = z.infer<typeof usageLogGroupBySchema>

export const usageLogSummarySchema = z.object({
  buckets: z.array(usageLogSummaryBucketSchema),
  groupBy: z.string(),
})
export type UsageLogSummary = z.infer<typeof usageLogSummarySchema>

// ── Usage log list/detail (History tab) ─────────────────────────────────────

export const usagePurposeSchema = z.enum(["CHAT", "EMBEDDING", "EXTRACTION"])
export type UsagePurpose = z.infer<typeof usagePurposeSchema>

export const usageRequestStatusSchema = z.enum(["SUCCESS", "PARTIAL", "ERROR"])
export type UsageRequestStatus = z.infer<typeof usageRequestStatusSchema>

export const usageLogListItemSchema = z.object({
  estimatedUnpricedCostUsd: z.number(),
  finishedAt: z.string(),
  guestIp: z.string().nullable(),
  hasFailover: z.boolean(),
  id: z.string(),
  latencyMs: z.number().int().nonnegative(),
  purpose: usagePurposeSchema,
  requestId: z.string(),
  startedAt: z.string(),
  status: usageRequestStatusSchema,
  totalCostUsd: z.number().nullable(),
  totalInputTokens: z.number().int().nonnegative(),
  totalOutputTokens: z.number().int().nonnegative(),
  userId: z.string().nullable(),
})
export type UsageLogListItem = z.infer<typeof usageLogListItemSchema>

export const usageLogPageSchema = z.object({
  data: z.array(usageLogListItemSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})
export type UsageLogPage = z.infer<typeof usageLogPageSchema>

export const usageLineSchema = z.object({
  attempt: z.number().int().nonnegative(),
  cachedTokens: z.number().int().nonnegative(),
  chatModelId: z.string().nullable(),
  costStatus: z.enum(["PRICED", "UNPRICED", "FREE"]),
  costUsd: z.number().nullable(),
  errorCode: z.string().nullable(),
  estimatedCostUsd: z.number(),
  inputTokens: z.number().int().nonnegative(),
  latencyMs: z.number().int().nonnegative(),
  modelName: z.string().nullable(),
  nodeName: z.string(),
  occurredAt: z.string(),
  outputTokens: z.number().int().nonnegative(),
  provider: z.string().nullable(),
  seq: z.number().int().nonnegative(),
  sourceType: z.string().nullable(),
  status: usageRequestStatusSchema,
})
export type UsageLine = z.infer<typeof usageLineSchema>

export const usageLogDetailSchema = usageLogListItemSchema
  .omit({ totalCostUsd: true })
  .extend({
    answer: z.string().nullable(),
    citations: z.array(z.record(z.string(), z.unknown())).nullable(),
    lineCount: z.number().int().nonnegative(),
    lines: z.array(usageLineSchema),
    query: z.string().nullable(),
    totalCachedTokens: z.number().int().nonnegative(),
    totalCostUsd: z.number().nullable(),
    unpricedLineCount: z.number().int().nonnegative(),
  })
export type UsageLogDetail = z.infer<typeof usageLogDetailSchema>

// ── Budgets (Budgets tab) ───────────────────────────────────────────────────

export const budgetScopeSchema = z.enum(["SYSTEM", "PROVIDER", "PURPOSE"])
export type BudgetScope = z.infer<typeof budgetScopeSchema>

export const budgetPeriodSchema = z.enum(["DAILY", "MONTHLY"])
export type BudgetPeriod = z.infer<typeof budgetPeriodSchema>

export const budgetActionSchema = z.enum(["ALERT", "THROTTLE", "BLOCK"])
export type BudgetAction = z.infer<typeof budgetActionSchema>

export const budgetSchema = z.object({
  action: budgetActionSchema,
  createdAt: z.string(),
  createdBy: z.string().nullable(),
  id: z.string(),
  isActive: z.boolean(),
  isEnabled: z.boolean(),
  limitUsd: z.number(),
  period: budgetPeriodSchema,
  scope: budgetScopeSchema,
  scopeProvider: z.string().nullable(),
  scopePurpose: usagePurposeSchema.nullable(),
  spentPercent: z.number().nullable(),
  spentUsd: z.number().nullable(),
  throttleMaxConcurrency: z.number().int().positive().nullable(),
  updatedAt: z.string(),
  updatedBy: z.string().nullable(),
})
export type Budget = z.infer<typeof budgetSchema>

export type CreateBudgetRequest = {
  action: BudgetAction
  isEnabled?: boolean
  limitUsd: number
  period: BudgetPeriod
  scope: BudgetScope
  scopeProvider?: string
  scopePurpose?: UsagePurpose
  throttleMaxConcurrency?: number
}
export type UpdateBudgetRequest = CreateBudgetRequest

// A PROVIDER budget needs a provider, a PURPOSE budget needs a purpose, and a
// THROTTLE action needs a concurrency cap - none of that is expressible by
// the field types alone, so the cross-field rules live in superRefine.
export const budgetFormSchema = z
  .object({
    action: budgetActionSchema,
    isEnabled: z.boolean(),
    limitUsd: z.number().positive("Giới hạn phải lớn hơn 0"),
    period: budgetPeriodSchema,
    scope: budgetScopeSchema,
    scopeProvider: z.string().trim().optional(),
    scopePurpose: usagePurposeSchema.optional(),
    throttleMaxConcurrency: z.number().int().positive().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.scope === "PROVIDER" && !values.scopeProvider) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Chọn nhà cung cấp cho ngân sách theo nhà cung cấp.",
        path: ["scopeProvider"],
      })
    }
    if (values.scope === "PURPOSE" && !values.scopePurpose) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Chọn mục đích cho ngân sách theo mục đích.",
        path: ["scopePurpose"],
      })
    }
    if (values.action === "THROTTLE" && !values.throttleMaxConcurrency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nhập số request đồng thời tối đa.",
        path: ["throttleMaxConcurrency"],
      })
    }
  })
export type BudgetFormValues = z.infer<typeof budgetFormSchema>

// ── Budget alert settings (Alerts tab, config half) ─────────────────────────

export const budgetAlertSettingSchema = z.object({
  emailEnabled: z.boolean(),
  emailRecipients: z.array(z.string()),
  inAppEnabled: z.boolean(),
  slackChannelLabel: z.string().nullable(),
  slackConfigured: z.boolean(),
  slackEnabled: z.boolean(),
  spikeDetectionEnabled: z.boolean(),
  spikeThresholdPercent: z.number().int().positive(),
  thresholdsPercent: z.array(z.number().int().positive()),
  updatedAt: z.string(),
})
export type BudgetAlertSetting = z.infer<typeof budgetAlertSettingSchema>

export type UpdateBudgetAlertSettingRequest = {
  emailEnabled: boolean
  emailRecipients?: string[]
  inAppEnabled: boolean
  slackEnabled: boolean
  spikeDetectionEnabled: boolean
  spikeThresholdPercent: number
  thresholdsPercent: number[]
}

// Mirrors ErrorCode.BUDGET_ALERT_SETTING_INVALID: thresholds 1-200, emails
// well-formed.
export const updateBudgetAlertSettingRequestSchema = z.object({
  emailEnabled: z.boolean(),
  emailRecipients: z.array(z.string().email("Email không đúng định dạng")),
  inAppEnabled: z.boolean(),
  slackEnabled: z.boolean(),
  spikeDetectionEnabled: z.boolean(),
  spikeThresholdPercent: z.number().int().min(1).max(200),
  thresholdsPercent: z
    .array(z.number().int().min(1).max(200))
    .min(1, "Cần ít nhất một ngưỡng cảnh báo"),
})
export type UpdateBudgetAlertSettingFormValues = z.infer<
  typeof updateBudgetAlertSettingRequestSchema
>

// ── Budget alert log (Alerts tab, history half) ─────────────────────────────

export const alertTypeSchema = z.enum(["THRESHOLD", "SPIKE"])
export type AlertType = z.infer<typeof alertTypeSchema>

export const alertChannelSchema = z.enum(["IN_APP", "EMAIL", "SLACK"])
export type AlertChannel = z.infer<typeof alertChannelSchema>

export const alertStatusSchema = z.enum([
  "PENDING",
  "SENT",
  "FAILED",
  "GAVE_UP",
  "SKIPPED",
])
export type AlertStatus = z.infer<typeof alertStatusSchema>

export const budgetAlertLogSchema = z.object({
  alertType: alertTypeSchema,
  attemptCount: z.number().int().nonnegative(),
  budgetId: z.string().nullable(),
  channel: alertChannelSchema,
  createdAt: z.string(),
  dismissedAt: z.string().nullable(),
  dismissedBy: z.string().nullable(),
  errorMessage: z.string().nullable(),
  id: z.string(),
  lastAttemptAt: z.string().nullable(),
  limitUsd: z.number().nullable(),
  nextAttemptAt: z.string().nullable(),
  periodStart: z.string(),
  sentAt: z.string().nullable(),
  spentUsd: z.number(),
  status: alertStatusSchema,
  thresholdPercent: z.number().int().nullable(),
})
export type BudgetAlertLog = z.infer<typeof budgetAlertLogSchema>

export const budgetAlertLogPageSchema = z.object({
  data: z.array(budgetAlertLogSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})
export type BudgetAlertLogPage = z.infer<typeof budgetAlertLogPageSchema>
