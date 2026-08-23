import { z } from "zod"

export interface DepartmentNode {
  id: string
  name: string
  description?: string | null
  parentId?: string | null
  isActive?: boolean | null
  deletedAt?: string | null
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  children?: DepartmentNode[]
}

export const departmentNodeSchema: z.ZodType<DepartmentNode> = z.lazy(() =>
  z.object({
    children: z.array(departmentNodeSchema).optional().default([]),
    createdAt: z.string().nullish(),
    createdBy: z.string().nullish(),
    deletedAt: z.string().nullish(),
    description: z.string().nullish(),
    id: z.uuid(),
    isActive: z.boolean().optional().default(true),
    name: z.string().trim().min(1),
    parentId: z.uuid().nullish(),
    updatedAt: z.string().nullish(),
    updatedBy: z.string().nullish(),
  })
)

export const departmentSchema = z.object({
  children: z.array(departmentNodeSchema).optional().default([]),
  createdAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  deletedAt: z.string().nullish(),
  description: z.string().nullish(),
  id: z.uuid(),
  isActive: z.boolean().optional().default(true),
  name: z.string().trim().min(1),
  parentId: z.uuid().nullish(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
})

export const departmentRequestSchema = z.object({
  description: z.string().trim().nullish(),
  name: z
    .string()
    .trim()
    .min(2, "Tên phòng ban phải có ít nhất 2 ký tự.")
    .max(200, "Tên phòng ban không được vượt quá 200 ký tự."),
  parentId: z.uuid().nullish(),
})

export type Department = z.infer<typeof departmentSchema>
export type DepartmentRequest = z.infer<typeof departmentRequestSchema>
// Alias for backward-compat with existing imports
export type CreateDepartmentRequest = DepartmentRequest
export type UpdateDepartmentRequest = DepartmentRequest
