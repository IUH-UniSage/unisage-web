export { PermissionGate } from "@/features/auth/components/permission-gate"
export { SignInPage } from "@/features/auth/components/sign-in-screen"
export { SignUpPage } from "@/features/auth/components/sign-up-screen"
export { useAuth } from "@/features/auth/hooks/use-auth"
export { usePermissions } from "@/features/auth/hooks/use-permissions"
export { PERMISSION_POLICIES } from "@/features/auth/lib/permission-policies"
export { USER_ROLES } from "@/features/auth/lib/role-routing"
export type {
  AuthSession,
  PermissionInfo,
} from "@/features/auth/schemas/auth-schemas"
