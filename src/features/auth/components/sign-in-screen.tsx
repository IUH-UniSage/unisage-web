import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/constants/paths"
import { AuthPageShell } from "@/features/auth/components/auth-page-shell"

const signInSchema = z.object({
  email: z.email("Vui lòng nhập email trường hợp lệ."),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
  remember: z.boolean(),
})

type SignInValues = z.infer<typeof signInSchema>

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<SignInValues>({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = () => {
    toast.info("Chức năng đăng nhập sẽ hoạt động khi kết nối API.")
  }

  return (
    <AuthPageShell>
      <div className="mb-7">
        <p className="text-sm font-semibold text-primary">Chào mừng trở lại</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Đăng nhập UniSage
        </h2>
        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
          Sử dụng tài khoản trường để tiếp tục vào không gian làm việc.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email trường</Label>
          <Input
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="h-11 bg-card"
            id="email"
            placeholder="sinhvien@truong.edu.vn"
            type="email"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="password">Mật khẩu</Label>
            <button
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() =>
                toast.info("Chức năng khôi phục mật khẩu chưa được kết nối.")
              }
              type="button"
            >
              Quên mật khẩu?
            </button>
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

        <div className="flex items-center gap-2.5">
          <Checkbox
            checked={watch("remember")}
            id="remember"
            onCheckedChange={(checked) =>
              setValue("remember", checked === true, {
                shouldDirty: true,
              })
            }
          />
          <Label
            className="font-normal text-muted-foreground"
            htmlFor="remember"
          >
            Duy trì đăng nhập trên thiết bị này
          </Label>
        </div>

        <Button className="h-11 w-full text-sm" disabled={isSubmitting}>
          Đăng nhập
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link
          className="font-semibold text-primary hover:underline"
          to={ROUTES.signUp}
        >
          Tạo tài khoản
        </Link>
      </p>

      <div className="mt-5 border-t pt-5 text-center text-xs leading-5 text-muted-foreground">
        Cần hỗ trợ truy cập tài khoản? Liên hệ bộ phận CNTT của trường.
      </div>
    </AuthPageShell>
  )
}
