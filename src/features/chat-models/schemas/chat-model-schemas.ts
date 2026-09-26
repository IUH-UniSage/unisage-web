import { z } from "zod"

import { VERIFICATION_STATUSES } from "@/features/chat-models/schemas/verification-status"

const auditFieldsSchema = z.object({
  createdAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  createdByName: z.string().nullish(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
  updatedByName: z.string().nullish(),
})

export const chatModelSourceTypeSchema = z.enum(["CLOUD_API", "SELF_HOSTED"])

// Mirrors com.unisage.backend.entity.enums.ChatModelPurpose.
export const chatModelPurposeSchema = z.enum([
  "CHAT",
  "EMBEDDING",
  "EXTRACTION",
])

// Mirrors com.unisage.backend.entity.enums.ChatModelStatus (plan.md "State machine").
export const chatModelStatusSchema = z.enum([
  "PENDING",
  "ACTIVE",
  "INACTIVE",
  "DISABLED",
])

// `status` here is `z.string()`, not the 7-value enum, on purpose: an
// unrecognized value from the API must render safely (getVerificationStatusLabel
// handles that), never fail to even parse the response.
export const chatModelVerificationSummarySchema = z.object({
  attempt: z.number().int().nullish(),
  createdAt: z.string().nullish(),
  errorCode: z.string().nullish(),
  errorMessage: z.string().nullish(),
  errorType: z.string().nullish(),
  finishedAt: z.string().nullish(),
  id: z.uuid(),
  status: z.string(),
})

export const chatModelSchema = auditFieldsSchema.extend({
  apiBaseUrl: z.string(),
  errorCount: z.number().int(),
  hasApiKey: z.boolean(),
  hasPendingChange: z.boolean().nullish(),
  id: z.uuid(),
  isActive: z.boolean(),
  lastErrorAt: z.string().nullable(),
  lastErrorCode: z.string().nullable(),
  latestVerification: chatModelVerificationSummarySchema.nullish(),
  llmModelName: z.string(),
  llmProvider: z.string().nullable(),
  maxRpm: z.number().int(),
  modelPurpose: chatModelPurposeSchema,
  modelSourceRef: z.string().nullable(),
  priority: z.number().int().nullable(),
  revision: z.number().int().nullish(),
  sourceType: chatModelSourceTypeSchema,
  status: chatModelStatusSchema,
  verifiedAt: z.string().nullable(),
})

export const chatModelPageSchema = z.object({
  data: z.array(chatModelSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

// modelPurpose is required at creation, immutable afterwards (plan.md
// "Credential rotation") - only present on the create schema below.
const chatModelBaseFieldsSchema = z.object({
  apiBaseUrl: z
    .string()
    .trim()
    .min(1, "URL API không được để trống.")
    .max(2048, "URL API không được vượt quá 2048 ký tự."),
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

function requireProviderForCloudApi<
  T extends { llmProvider?: string; sourceType: string },
>(values: T, ctx: z.RefinementCtx) {
  if (values.sourceType !== "CLOUD_API") return

  if (!values.llmProvider?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Nhà cung cấp không được để trống khi nguồn là Cloud API.",
      path: ["llmProvider"],
    })
  }
}

export const createChatModelRequestSchema = chatModelBaseFieldsSchema
  .extend({
    apiKey: z.string().trim().max(2048).optional(),
    modelPurpose: chatModelPurposeSchema,
  })
  .superRefine(requireProviderForCloudApi)
  .refine(
    (values) =>
      values.sourceType !== "CLOUD_API" || Boolean(values.apiKey?.trim()),
    {
      message: "API key không được để trống khi nguồn là Cloud API.",
      path: ["apiKey"],
    }
  )

// Update never carries modelPurpose (immutable) or apiKey as a plain required
// field: blank means "keep the old key" (plan.md "Credential rotation" - the
// tri-state semantics live in ChatModelUpdateRequest on the backend). The
// client only ever sends `apiKey` when the SA actually typed a new one -
// omitting it entirely is how "keep old key" is expressed over the wire, so
// a plain optional string is enough here; there is no `null` case to model.
export const updateChatModelRequestSchema = chatModelBaseFieldsSchema
  .extend({
    apiKey: z.string().trim().max(2048).optional(),
    clearApiKey: z.boolean().optional(),
  })
  .superRefine(requireProviderForCloudApi)

export const chatModelStatusRequestSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

export const chatModelPriorityRequestSchema = z.object({
  priority: z.number().int(),
})

export type ChatModelSourceType = z.infer<typeof chatModelSourceTypeSchema>
export type ChatModelPurpose = z.infer<typeof chatModelPurposeSchema>
export type ChatModelStatus = z.infer<typeof chatModelStatusSchema>
export type ChatModelVerificationSummary = z.infer<
  typeof chatModelVerificationSummarySchema
>
export type ChatModel = z.infer<typeof chatModelSchema>
export type ChatModelPage = z.infer<typeof chatModelPageSchema>
export type CreateChatModelRequest = z.infer<
  typeof createChatModelRequestSchema
>
export type UpdateChatModelRequest = z.infer<
  typeof updateChatModelRequestSchema
>

// Re-exported so callers don't need to know the union lives in a separate,
// hand-maintained file (todo.md Task 17 - contracts:sync doesn't exist yet).
export { VERIFICATION_STATUSES }
export type { VerificationStatus } from "@/features/chat-models/schemas/verification-status"
