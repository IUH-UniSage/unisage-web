import { z } from "zod"

import { chatModelPurposeSchema } from "@/features/chat-models/schemas/chat-model-schemas"
import { VERIFICATION_STATUSES } from "@/features/chat-models/schemas/verification-status"

// Mirrors ChatModelVerificationJobResponse.java - the admin "Jobs" tab's
// read-only view over chat_model_verifications. `status` is z.string(), not
// the 7-value enum, same defensive reasoning as
// chatModelVerificationSummarySchema: an unrecognized value must render
// safely, never fail to parse.
export const verificationJobSchema = z.object({
  attempt: z.number().int(),
  baseRevision: z.number().int(),
  candidateApiBaseUrl: z.string().nullable(),
  candidateGeneration: z.number().int(),
  candidateLlmModelName: z.string().nullable(),
  candidateLlmProvider: z.string().nullable(),
  candidateModelSourceRef: z.string().nullable(),
  chatModelDisplayName: z.string().nullish(),
  chatModelId: z.uuid(),
  createdAt: z.string(),
  embeddingDimension: z.number().int().nullable(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  errorType: z.string().nullable(),
  finishedAt: z.string().nullable(),
  hasCandidateApiKey: z.boolean(),
  id: z.uuid(),
  leaseUntil: z.string().nullable(),
  maxAttempts: z.number().int(),
  modelPurpose: chatModelPurposeSchema,
  nextAttemptAt: z.string().nullable(),
  startedAt: z.string().nullable(),
  status: z.string(),
})

export const verificationJobPageSchema = z.object({
  data: z.array(verificationJobSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export type VerificationJob = z.infer<typeof verificationJobSchema>
export type VerificationJobPage = z.infer<typeof verificationJobPageSchema>

export { VERIFICATION_STATUSES }
