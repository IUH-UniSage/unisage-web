import { z } from "zod"

export const userRoleSchema = z.string().trim().min(1)

export const permissionSchema = z.object({
  accessLevel: z.number().int().nullable().optional(),
  id: z.uuid(),
  name: z.string().trim().min(1),
})

export const userProfileSchema = z.object({
  avatarUrl: z.string().nullish(),
  fullName: z.string().trim().min(1),
  isSystemRole: z.boolean(),
  permissions: z.array(permissionSchema),
  role: userRoleSchema,
  roleDescription: z.string().nullish(),
  userId: z.uuid(),
})

export const loginRequestSchema = z.object({
  code: z.string().trim().min(1, "Vui lòng nhập mã tài khoản."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
})

export const selectProfileRequestSchema = z.object({
  userId: z.uuid(),
})

export const authResponseSchema = z.object({
  accessToken: z.string().nullish(),
  code: z.string(),
  email: z.string(),
  profiles: z.array(userProfileSchema),
  refreshToken: z.string().nullish(),
  refreshTokenExpirationMs: z.number().nonnegative(),
})

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
  code: z.string(),
  email: z.string(),
  refreshToken: z.string(),
  refreshTokenExpirationMs: z.number().nonnegative(),
})

export const selectProfileResponseSchema = z.object({
  accessToken: z.string(),
  avatarUrl: z.string().nullish(),
  code: z.string(),
  email: z.string(),
  fullName: z.string().trim().min(1),
  isSystemRole: z.boolean(),
  permissions: z.array(permissionSchema),
  refreshToken: z.string(),
  refreshTokenExpirationMs: z.number().nonnegative(),
  role: userRoleSchema,
})

export const authSessionSchema = z.object({
  avatarUrl: z.string().nullish(),
  code: z.string(),
  email: z.string(),
  fullName: z.string().trim().min(1),
  isSystemRole: z.boolean(),
  permissions: z.array(permissionSchema),
  role: userRoleSchema,
  userId: z.uuid(),
})

export type AuthResponse = z.infer<typeof authResponseSchema>
export type AuthSession = z.infer<typeof authSessionSchema>
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type PermissionInfo = z.infer<typeof permissionSchema>
export type RefreshResponse = z.infer<typeof refreshResponseSchema>
export type SelectProfileResponse = z.infer<typeof selectProfileResponseSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
