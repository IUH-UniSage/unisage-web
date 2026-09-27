import { z } from "zod"

import { healthCheckResponseSchema } from "@/features/system-health/schemas/system-health-schemas"

export const userStatsSchema = z.object({
  activeToday: z.number().int().nonnegative(),
  activeTotal: z.number().int().nonnegative(),
})

export type UserStats = z.infer<typeof userStatsSchema>

export const aiAnswerStatsSchema = z.object({
  citedPercentage: z.number().nullable(),
  today: z.number().int().nonnegative(),
})

export type AiAnswerStats = z.infer<typeof aiAnswerStatsSchema>

export const documentStatsSchema = z.object({
  departments: z.number().int().nonnegative(),
  published: z.number().int().nonnegative(),
})

export type DocumentStats = z.infer<typeof documentStatsSchema>

export const ticketStatsSchema = z.object({
  open: z.number().int().nonnegative(),
})

export type TicketStats = z.infer<typeof ticketStatsSchema>

export const dailyActivitySchema = z.object({
  date: z.string(),
  questions: z.number().int().nonnegative(),
})

export type DailyActivity = z.infer<typeof dailyActivitySchema>

export const weeklyActivitySchema = z.object({
  daily: z.array(dailyActivitySchema),
  totalQuestions: z.number().int().nonnegative(),
})

export type WeeklyActivity = z.infer<typeof weeklyActivitySchema>

export const dashboardSummarySchema = z.object({
  aiAnswers: aiAnswerStatsSchema,
  documents: documentStatsSchema,
  health: healthCheckResponseSchema,
  tickets: ticketStatsSchema,
  users: userStatsSchema,
  weeklyActivity: weeklyActivitySchema,
})

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>
