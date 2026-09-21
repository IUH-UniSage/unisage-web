import { z } from "zod"

const auditFieldsSchema = z.object({
  createdAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  createdByName: z.string().nullish(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
  updatedByName: z.string().nullish(),
})

export const accessPermissionSchema = auditFieldsSchema.extend({
  id: z.uuid(),
  isActive: z.boolean(),
  name: z.string().trim().min(1),
})

export const rolePermissionSchema = z.object({
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
  // null: the role has no plan of its own and uses the default plan.
  usageLimitPlan: z.object({ id: z.uuid(), name: z.string().min(1) }).nullish(),
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
  // Required (not optional) so a payload can never clear the plan by omission.
  usageLimitPlanId: z.uuid().nullable(),
})

export const createRoleRequestSchema = roleRequestSchema
export const updateRoleRequestSchema = roleRequestSchema

export const permissionRequestSchema = z.object({
  isActive: z.boolean(),
  name: z
    .string()
    .trim()
    .min(2, "Tên quyền phải có ít nhất 2 ký tự.")
    .max(100, "Tên quyền không được vượt quá 100 ký tự.")
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      "Dùng chữ in hoa, số và dấu gạch dưới; bắt đầu bằng chữ."
    ),
})

export const createPermissionRequestSchema = permissionRequestSchema
export const updatePermissionRequestSchema = permissionRequestSchema

export type AccessPermission = z.infer<typeof accessPermissionSchema>
export type AccessRole = z.infer<typeof accessRoleSchema>
export type AccessRolePage = z.infer<typeof accessRolePageSchema>
export type AccessPermissionPage = z.infer<typeof accessPermissionPageSchema>
export type CreateRoleRequest = z.infer<typeof createRoleRequestSchema>
export type UpdateRoleRequest = z.infer<typeof updateRoleRequestSchema>
export type CreatePermissionRequest = z.infer<
  typeof createPermissionRequestSchema
>
export type UpdatePermissionRequest = z.infer<
  typeof updatePermissionRequestSchema
>
