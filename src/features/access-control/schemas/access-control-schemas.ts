import { z } from "zod"

const auditFieldsSchema = z.object({
  createdAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
})

export const accessPermissionSchema = auditFieldsSchema.extend({
  accessLevel: z.number().int().nullable(),
  id: z.uuid(),
  isActive: z.boolean(),
  name: z.string().trim().min(1),
})

export const rolePermissionSchema = z.object({
  accessLevel: z.number().int().nullable(),
  id: z.uuid(),
  name: z.string().trim().min(1),
})

export const accessRoleSchema = auditFieldsSchema.extend({
  description: z.string().nullish(),
  id: z.uuid(),
  isActive: z.boolean(),
  isSystemRole: z.boolean(),
  name: z.string().trim().min(1),
  permissions: z.array(rolePermissionSchema),
})

const pageSchema = <T>(itemSchema: z.ZodType<T>) =>
  z.object({
    data: z.array(itemSchema),
    limit: z.number().int().nonnegative(),
    page: z.number().int().nonnegative(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  })

export const accessRolePageSchema = pageSchema(accessRoleSchema)
export const accessPermissionPageSchema = pageSchema(accessPermissionSchema)

export const roleRequestSchema = z.object({
  description: z.string().trim().max(255).nullable(),
  isActive: z.boolean(),
  isSystemRole: z.boolean(),
  name: z
    .string()
    .trim()
    .min(2, "Tên vai trò phải có ít nhất 2 ký tự.")
    .max(100, "Tên vai trò không được vượt quá 100 ký tự.")
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      "Dùng chữ in hoa, số và dấu gạch dưới; bắt đầu bằng chữ."
    ),
  permissionIds: z.array(z.uuid()),
})

export const createRoleRequestSchema = roleRequestSchema
export const updateRoleRequestSchema = roleRequestSchema

export type AccessPermission = z.infer<typeof accessPermissionSchema>
export type AccessRole = z.infer<typeof accessRoleSchema>
export type AccessRolePage = z.infer<typeof accessRolePageSchema>
export type AccessPermissionPage = z.infer<typeof accessPermissionPageSchema>
export type CreateRoleRequest = z.infer<typeof createRoleRequestSchema>
export type UpdateRoleRequest = z.infer<typeof updateRoleRequestSchema>
