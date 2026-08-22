import { z } from "zod"

const auditFieldsSchema = z.object({
  createdAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
})

export const userRoleSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
})

export const userDepartmentSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
})

export const appUserSchema = auditFieldsSchema.extend({
  department: userDepartmentSchema.nullable().optional(),
  email: z.string().nullish(),
  fullName: z.string().trim().min(1).nullish(),
  id: z.uuid(),
  isActive: z.boolean().optional().default(true),
  roles: z.array(userRoleSchema).optional().default([]),
  username: z.string().trim().min(1).nullish(),
})

const pageSchema = <T>(itemSchema: z.ZodType<T>) =>
  z.object({
    data: z.array(itemSchema),
    limit: z.number().int().nonnegative(),
    page: z.number().int().nonnegative(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  })

export const appUserPageSchema = pageSchema(appUserSchema)

export const createUserRequestSchema = z.object({
  departmentId: z.uuid().nullable(),
  email: z
    .string()
    .trim()
    .email("Địa chỉ email không hợp lệ.")
    .max(255, "Email không được vượt quá 255 ký tự."),
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(100, "Họ tên không được vượt quá 100 ký tự."),
  isActive: z.boolean(),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự."),
  roleIds: z.array(z.uuid()),
  username: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
    .max(50, "Tên đăng nhập không được vượt quá 50 ký tự.")
    .regex(
      /^[a-z0-9_]+$/,
      "Tên đăng nhập chỉ được dùng chữ thường, số và dấu gạch dưới."
    ),
})

export const updateUserRequestSchema = z.object({
  departmentId: z.uuid().nullable(),
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(100, "Họ tên không được vượt quá 100 ký tự."),
  isActive: z.boolean(),
  roleIds: z.array(z.uuid()),
})

export type AppUser = z.infer<typeof appUserSchema>
export type AppUserPage = z.infer<typeof appUserPageSchema>
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>
