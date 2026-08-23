import { z } from "zod"

export const categorySchema = z.object({
  createdAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  description: z.string().nullish(),
  id: z.uuid(),
  isActive: z.boolean(),
  name: z.string(),
  status: z.string().nullish(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
})

export const categoryListSchema = z.array(categorySchema)

export const categoryRequestSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Mô tả không được để trống.")
    .max(500, "Mô tả không được vượt quá 500 ký tự."),
  name: z
    .string()
    .trim()
    .min(1, "Tên danh mục không được để trống.")
    .max(150, "Tên danh mục không được vượt quá 150 ký tự."),
  status: z.string().trim().max(50).nullish(),
})

export const createCategoryRequestSchema = categoryRequestSchema
export const updateCategoryRequestSchema = categoryRequestSchema

export type Category = z.infer<typeof categorySchema>
export type CategoryList = z.infer<typeof categoryListSchema>
export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>
export type UpdateCategoryRequest = z.infer<typeof updateCategoryRequestSchema>
