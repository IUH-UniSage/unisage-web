import { z } from "zod"

export const USAGE_WINDOW_STATUSES = ["UNLIMITED", "IDLE", "ACTIVE"] as const

// The API sends a percentage and a reset time only, never token counts.
export const usageWindowSchema = z.object({
  remainingPercent: z.number().int().nullish(),
  resetAt: z.string().nullish(),
  status: z.enum(USAGE_WINDOW_STATUSES),
})

export const myUsageSchema = z.object({
  daily: usageWindowSchema,
  weekly: usageWindowSchema,
})

export const usageLimitPlanSchema = z.object({
  createdAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  createdByName: z.string().nullish(),
  dailyTokenLimit: z.number().int().nullish(),
  id: z.uuid(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  name: z.string().min(1),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
  updatedByName: z.string().nullish(),
  weeklyTokenLimit: z.number().int().nullish(),
})

export const usageLimitPlanListSchema = z.array(usageLimitPlanSchema)

// What goes over the wire: a null limit means unlimited.
export const usageLimitPlanRequestSchema = z.object({
  dailyTokenLimit: z.number().int().positive().nullable(),
  isDefault: z.boolean(),
  name: z.string().trim().min(1).max(255),
  weeklyTokenLimit: z.number().int().positive().nullable(),
})

const tokenLimitInputSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^[1-9]\d*$/.test(value), {
    message: "Nhập số nguyên dương, hoặc để trống nếu không giới hạn.",
  })

// What the form edits: the limit inputs are text, empty meaning unlimited.
export const usageLimitPlanFormSchema = z.object({
  dailyTokenLimit: tokenLimitInputSchema,
  isDefault: z.boolean(),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên gói.")
    .max(255, "Tên gói không được vượt quá 255 ký tự."),
  weeklyTokenLimit: tokenLimitInputSchema,
})

export type UsageWindow = z.infer<typeof usageWindowSchema>
export type MyUsage = z.infer<typeof myUsageSchema>
export type UsageLimitPlan = z.infer<typeof usageLimitPlanSchema>
export type UsageLimitPlanList = z.infer<typeof usageLimitPlanListSchema>
export type UsageLimitPlanRequest = z.infer<typeof usageLimitPlanRequestSchema>
export type UsageLimitPlanFormValues = z.infer<typeof usageLimitPlanFormSchema>
