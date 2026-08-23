import { z } from "zod"

// Enums matching backend UserStatus
export const userStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING",
])
export type UserStatus = z.infer<typeof userStatusSchema>

export const departmentAccessResponseSchema = z.object({
  accessLevel: z.number().int().nonnegative().nullish(),
  departmentId: z.uuid(),
  departmentName: z.string().trim().min(1),
})

export const appUserSchema = z.object({
  accessLevel: z.number().int().nonnegative().nullish(),
  accessLevelId: z.uuid().nullish(),
  avatarUrl: z.string().nullish(),
  code: z.string().nullish(),
  createdAt: z.string().nullish(),
  departmentAccesses: z
    .array(departmentAccessResponseSchema)
    .optional()
    .default([]),
  email: z.string().email().nullish(),
  firstName: z.string().nullish(),
  gender: z.string().nullish(),
  id: z.uuid(),
  lastLogin: z.string().nullish(),
  lastName: z.string().nullish(),
  phone: z.string().nullish(),
  roleId: z.uuid().nullish(),
  roleName: z.string().nullish(),
  status: userStatusSchema.optional().default("ACTIVE"),
})

export const appUserPageSchema = z.object({
  data: z.array(appUserSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const createUserRequestSchema = z.object({
  code: z.string().trim().nullish(),
  departmentAccesses: z
    .array(
      z.object({
        accessLevel: z.number().int().nonnegative(),
        departmentId: z.uuid(),
      })
    )
    .optional()
    .default([]),
  email: z
    .string()
    .trim()
    .email("Địa chỉ email không hợp lệ.")
    .max(255, "Email không được vượt quá 255 ký tự."),
  firstName: z
    .string()
    .trim()
    .min(1, "Tên không được để trống.")
    .max(100, "Tên không được vượt quá 100 ký tự."),
  gender: z.string().nullish(),
  lastName: z
    .string()
    .trim()
    .min(1, "Họ không được để trống.")
    .max(100, "Họ không được vượt quá 100 ký tự."),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự."),
  phone: z.string().trim().nullish(),
  roleId: z.uuid("Vui lòng chọn một vai trò."),
  accessLevelId: z.uuid().nullish(),
})

export const updateUserRequestSchema = z.object({
  code: z.string().trim().nullish(),
  departmentAccesses: z
    .array(
      z.object({
        accessLevel: z.number().int().nonnegative(),
        departmentId: z.uuid(),
      })
    )
    .optional()
    .default([]),
  email: z.string().trim().email("Địa chỉ email không hợp lệ.").nullish(),
  firstName: z.string().trim().min(1, "Tên không được để trống.").nullish(),
  gender: z.string().nullish(),
  lastName: z.string().trim().min(1, "Họ không được để trống.").nullish(),
  phone: z.string().trim().nullish(),
  roleId: z.uuid().nullish(),
  accessLevelId: z.uuid().nullish(),
  extraInfo: z.string().nullish(),
})

export const userFormSchema = z.object({
  accessLevelId: z.uuid().nullish(),
  code: z.string().trim().nullish(),
  departmentAccesses: z
    .array(
      z.object({
        accessLevel: z.number().int().nonnegative(),
        departmentId: z.uuid(),
      })
    )
    .optional(),
  email: z
    .string()
    .trim()
    .email("Địa chỉ email không hợp lệ.")
    .max(255, "Email không được vượt quá 255 ký tự."),
  firstName: z
    .string()
    .trim()
    .min(1, "Tên không được để trống.")
    .max(100, "Tên không được vượt quá 100 ký tự."),
  gender: z.string().nullish(),
  lastName: z
    .string()
    .trim()
    .min(1, "Họ không được để trống.")
    .max(100, "Họ không được vượt quá 100 ký tự."),
  password: z.string().optional(),
  phone: z.string().trim().nullish(),
  roleId: z.string().nullish(),
})

export type UserFormValues = z.infer<typeof userFormSchema>

export type AppUser = z.infer<typeof appUserSchema>
export type AppUserPage = z.infer<typeof appUserPageSchema>
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>
export type DepartmentAccessResponse = z.infer<
  typeof departmentAccessResponseSchema
>
