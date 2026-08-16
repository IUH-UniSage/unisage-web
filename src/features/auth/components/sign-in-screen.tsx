import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthPageShell } from "@/features/auth/components/auth-page-shell"
import { ProfileSelection } from "@/features/auth/components/profile-selection"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { getRoleHome } from "@/features/auth/lib/role-routing"
import type { LoginRequest } from "@/features/auth/schemas/auth-schemas"
import { loginRequestSchema } from "@/features/auth/schemas/auth-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

export function SignInPage() {
  const navigate = useNavigate()
  const {
    login,
    pendingProfileSelection,
    resetPendingProfileSelection,
    selectProfile,
  } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [selectingUserId, setSelectingUserId] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string>()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginRequest>({
    defaultValues: {
      code: "",
      password: "",
    },
    resolver: zodResolver(loginRequestSchema),
  })

  const onSubmit = async (values: LoginRequest) => {
    try {
      const result = await login(values)

      if (result.session) {
        await navigate(getRoleHome(result.session.role), { replace: true })
      }
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }

  const handleSelectProfile = async (userId: string) => {
    setSelectingUserId(userId)
    setProfileError(undefined)

    try {
      const session = await selectProfile(userId)
      await navigate(getRoleHome(session.role), { replace: true })
    } catch (error) {
      setProfileError(getErrorMessage(error))
      setSelectingUserId(null)
    }
  }

  if (pendingProfileSelection) {
    return (
      <AuthPageShell>
        <ProfileSelection
          errorMessage={profileError}
          onBack={() => {
            setProfileError(undefined)
            setSelectingUserId(null)
            resetPendingProfileSelection()
          }}
          onSelect={(userId) => void handleSelectProfile(userId)}
          pendingProfileSelection={pendingProfileSelection}
          selectingUserId={selectingUserId}
        />
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell>
      <div className="mb-7">
        <p className="text-sm font-semibold text-primary">Chào mừng trở lại</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Đăng nhập UniSage
        </h2>
        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
          Sử dụng mã tài khoản được nhà trường cấp để vào không gian làm việc.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="code">Mã tài khoản</Label>
          <Input
            aria-invalid={Boolean(errors.code)}
            autoComplete="username"
            autoFocus
            className="h-11 bg-card"
            id="code"
            placeholder="Nhập mã sinh viên hoặc mã nhân sự"
            {...register("code")}
          />
          {errors.code ? (
            <p className="text-xs text-destructive">{errors.code.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="password">Mật khẩu</Label>
            <span className="text-xs text-muted-foreground">
              Liên hệ CNTT nếu quên mật khẩu
            </span>
          </div>
          <div className="relative">
            <Input
              aria-invalid={Boolean(errors.password)}
              autoComplete="current-password"
              className="h-11 bg-card pr-12"
              id="password"
              placeholder="Nhập mật khẩu"
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <Button
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute top-0.5 right-0.5 size-10 text-muted-foreground"
              onClick={() => setShowPassword((current) => !current)}
              size="icon"
              type="button"
              variant="ghost"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </Button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        {errors.root?.message ? (
          <p
            className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            {errors.root.message}
          </p>
        ) : null}

        <Button
          className="h-11 w-full text-sm"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>

      <div className="mt-5 border-t pt-5 text-center text-xs leading-5 text-muted-foreground">
        Tài khoản UniSage do nhà trường cấp và quản lý. Không chia sẻ thông tin
        đăng nhập với người khác.
      </div>
    </AuthPageShell>
  )
}
