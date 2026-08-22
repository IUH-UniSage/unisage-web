import { z } from "zod"

export const accessLevelSchema = z.object({
  createdAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  description: z.string().nullish(),
  id: z.uuid(),
  isActive: z.boolean(),
  level: z.number().int(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
})

export const accessLevelListSchema = z.array(accessLevelSchema)

export const accessLevelRequestSchema = z.object({
  description: z.string().trim().max(255).nullable(),
  level: z
    .number()
    .int("Cấp độ phải là số nguyên.")
    .min(0, "Cấp độ không được nhỏ hơn 0."),
})

export const createAccessLevelRequestSchema = accessLevelRequestSchema
export const updateAccessLevelRequestSchema = accessLevelRequestSchema

export type AccessLevel = z.infer<typeof accessLevelSchema>
export type AccessLevelList = z.infer<typeof accessLevelListSchema>
export type CreateAccessLevelRequest = z.infer<
  typeof createAccessLevelRequestSchema
>
export type UpdateAccessLevelRequest = z.infer<
  typeof updateAccessLevelRequestSchema
>
