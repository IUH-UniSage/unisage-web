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

export const updateRoleRequestSchema = z.object({
  description: z.string().nullable(),
  isActive: z.boolean(),
  isSystemRole: z.boolean(),
  name: z.string().trim().min(1),
  permissionIds: z.array(z.uuid()),
})

export type AccessPermission = z.infer<typeof accessPermissionSchema>
export type AccessRole = z.infer<typeof accessRoleSchema>
export type AccessRolePage = z.infer<typeof accessRolePageSchema>
export type AccessPermissionPage = z.infer<typeof accessPermissionPageSchema>
export type UpdateRoleRequest = z.infer<typeof updateRoleRequestSchema>
