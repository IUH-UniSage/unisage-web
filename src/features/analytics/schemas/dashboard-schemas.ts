import { z } from "zod"

import {
  budgetPeriodSchema,
  budgetScopeSchema,
  usagePurposeSchema,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { healthCheckResponseSchema } from "@/features/system-health/schemas/system-health-schemas"

export const dashboardPeriodSchema = z.enum([
  "TODAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "THIS_MONTH",
])

export type DashboardPeriod = z.infer<typeof dashboardPeriodSchema>

// Local wall-clock times in the app timezone (no offset), e.g. "2026-10-21T15:37:12".
export const periodInfoSchema = z.object({
  from: z.string(),
  granularity: z.enum(["HOUR", "DAY"]),
  key: dashboardPeriodSchema,
  previousFrom: z.string(),
  previousTo: z.string(),
  to: z.string(),
})

export type PeriodInfo = z.infer<typeof periodInfoSchema>

export const attentionSchema = z.object({
  activeBudgetAlerts: z.number().int().nonnegative(),
  failedDocuments: z.number().int().nonnegative(),
  openTickets: z.number().int().nonnegative(),
  outdatedDocuments: z.number().int().nonnegative(),
})

export type Attention = z.infer<typeof attentionSchema>

function comparisonSchema<T extends z.ZodTypeAny>(window: T) {
  return z.object({ current: window, previous: window })
}

export const answerWindowSchema = z.object({
  cited: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  medianResponseMs: z.number().nullable(),
  p95ResponseMs: z.number().nullable(),
  total: z.number().int().nonnegative(),
})

export type AnswerWindow = z.infer<typeof answerWindowSchema>

export const askerWindowSchema = z.object({
  guests: z.number().int().nonnegative(),
  users: z.number().int().nonnegative(),
})

export type AskerWindow = z.infer<typeof askerWindowSchema>

export const activityBucketSchema = z.object({
  answered: z.number().int().nonnegative(),
  costUsd: z.number(),
  failed: z.number().int().nonnegative(),
  start: z.string(),
})

export type ActivityBucket = z.infer<typeof activityBucketSchema>

export const purposeCostSchema = z.object({
  costUsd: z.number(),
  purpose: usagePurposeSchema,
  requestCount: z.number().int().nonnegative(),
})

export const budgetUsageSchema = z.object({
  id: z.string(),
  limitUsd: z.number(),
  period: budgetPeriodSchema,
  scope: budgetScopeSchema,
  scopeProvider: z.string().nullable(),
  scopePurpose: usagePurposeSchema.nullable(),
  spentPercent: z.number(),
  spentUsd: z.number(),
})

export type BudgetUsage = z.infer<typeof budgetUsageSchema>

export const costStatsSchema = z.object({
  budgets: z.array(budgetUsageSchema),
  byPurpose: z.array(purposeCostSchema),
  previousTotalUsd: z.number(),
  requestCount: z.number().int().nonnegative(),
  totalUsd: z.number(),
  unpricedEstimateUsd: z.number(),
})

export type CostStats = z.infer<typeof costStatsSchema>

export const documentStatsSchema = z.object({
  departments: z.number().int().nonnegative(),
  published: z.number().int().nonnegative(),
})

export const dashboardSummarySchema = z.object({
  activity: z.array(activityBucketSchema),
  answers: comparisonSchema(answerWindowSchema),
  askers: comparisonSchema(askerWindowSchema),
  attention: attentionSchema,
  cost: costStatsSchema,
  documents: documentStatsSchema,
  health: healthCheckResponseSchema,
  period: periodInfoSchema,
})

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>
