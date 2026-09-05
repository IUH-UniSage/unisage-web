import { z } from "zod"

const auditFieldsSchema = z.object({
  createdAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  createdByName: z.string().nullish(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
  updatedByName: z.string().nullish(),
})

export const chatModelSourceTypeSchema = z.enum(["CLOUD_API", "SELF_HOSTED"])

export const chatModelSchema = auditFieldsSchema.extend({
  apiBaseUrl: z.string(),
  errorCount: z.number().int(),
  hasApiKey: z.boolean(),
  id: z.uuid(),
  isActive: z.boolean(),
  lastErrorAt: z.string().nullable(),
  llmModelName: z.string(),
  llmProvider: z.string().nullable(),
  maxRpm: z.number().int(),
  modelSourceRef: z.string().nullable(),
  priority: z.number().int().nullable(),
  sourceType: chatModelSourceTypeSchema,
})

export const chatModelPageSchema = z.object({
  data: z.array(chatModelSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const chatModelRequestSchema = z
  .object({
    apiBaseUrl: z
      .string()
      .trim()
      .min(1, "URL API không được để trống.")
      .max(2048, "URL API không được vượt quá 2048 ký tự."),
    apiKey: z.string().trim().max(2048).optional(),
    llmModelName: z
      .string()
      .trim()
      .min(1, "Tên mô hình không được để trống.")
      .max(255, "Tên mô hình không được vượt quá 255 ký tự."),
    llmProvider: z.string().trim().max(100).optional(),
    maxRpm: z
      .number()
      .int("Giới hạn RPM phải là số nguyên.")
      .positive("Giới hạn RPM phải lớn hơn 0."),
    modelSourceRef: z.string().trim().max(255).optional(),
    priority: z.number().int().nullable().optional(),
    sourceType: chatModelSourceTypeSchema,
  })
  .superRefine((values, ctx) => {
    if (values.sourceType !== "CLOUD_API") return

    if (!values.llmProvider?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Nhà cung cấp không được để trống khi nguồn là Cloud API.",
        path: ["llmProvider"],
      })
    }
  })

export const createChatModelRequestSchema = chatModelRequestSchema.refine(
  (values) =>
    values.sourceType !== "CLOUD_API" || Boolean(values.apiKey?.trim()),
  {
    message: "API key không được để trống khi nguồn là Cloud API.",
    path: ["apiKey"],
  }
)

export const updateChatModelRequestSchema = chatModelRequestSchema

export type ChatModelSourceType = z.infer<typeof chatModelSourceTypeSchema>
export type ChatModel = z.infer<typeof chatModelSchema>
export type ChatModelPage = z.infer<typeof chatModelPageSchema>
export type CreateChatModelRequest = z.infer<
  typeof createChatModelRequestSchema
>
export type UpdateChatModelRequest = z.infer<
  typeof updateChatModelRequestSchema
>
