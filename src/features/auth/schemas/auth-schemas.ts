import { z } from "zod"

export const userRoleSchema = z.string().trim().min(1)

export const permissionSchema = z.object({
  accessLevel: z.number().int().nullable().optional(),
  id: z.uuid(),
  name: z.string().trim().min(1),
})

const authenticatedAccountSchema = z.object({
  avatarUrl: z.string().nullish(),
  code: z.string().trim().min(1),
  email: z.email(),
  fullName: z.string().trim().min(1),
  isSystemRole: z.boolean(),
  permissions: z.array(permissionSchema),
  role: userRoleSchema,
})

export const loginRequestSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã sinh viên hoặc mã giảng viên."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
})

export const authResponseSchema = authenticatedAccountSchema.extend({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  refreshTokenExpirationMs: z.number().nonnegative(),
})

export const refreshResponseSchema = authResponseSchema

// The backend doesn't return userId as a field on AuthResponse -- it's
// decoded from the access token's `sub` claim and added when the session is
// built. See createSessionFromResponse.
export const authSessionSchema = authenticatedAccountSchema.extend({
  userId: z.uuid(),
})

export type AuthResponse = z.infer<typeof authResponseSchema>
export type AuthSession = z.infer<typeof authSessionSchema>
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type PermissionInfo = z.infer<typeof permissionSchema>
export type RefreshResponse = z.infer<typeof refreshResponseSchema>
