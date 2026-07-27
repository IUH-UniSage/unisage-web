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

const signUpSchema = z
  .object({
    acceptedTerms: z.boolean().refine(Boolean, {
      message: "Bạn cần đồng ý với điều khoản để tiếp tục.",
    }),
    confirmPassword: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
    email: z.email("Vui lòng nhập email trường hợp lệ."),
    fullName: z.string().trim().min(2, "Vui lòng nhập họ và tên."),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  })

type SignUpValues = z.infer<typeof signUpSchema>

export function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<SignUpValues>({
    defaultValues: {
      acceptedTerms: false,
      confirmPassword: "",
      email: "",
      fullName: "",
      password: "",
    },
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = () => {
    toast.info("Chức năng đăng ký sẽ hoạt động khi kết nối API.")
  }

  return (
    <AuthPageShell>
      <div className="mb-5">
        <p className="text-sm font-semibold text-primary">Tham gia UniSage</p>
        <h2 className="mt-1.5 text-3xl font-bold tracking-tight">
          Tạo tài khoản
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sử dụng danh tính của trường để truy cập nguồn tri thức đã kiểm chứng.
        </p>
      </div>

      <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input
            aria-invalid={Boolean(errors.fullName)}
            autoComplete="name"
            className="h-10 bg-card"
            id="fullName"
            placeholder="Nguyễn Văn An"
            {...register("fullName")}
          />
          {errors.fullName ? (
            <p className="text-xs text-destructive">
              {errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signUpEmail">Email trường</Label>
          <Input
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="h-10 bg-card"
            id="signUpEmail"
            placeholder="sinhvien@truong.edu.vn"
            type="email"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="signUpPassword">Mật khẩu</Label>
            <div className="relative">
              <Input
                aria-invalid={Boolean(errors.password)}
                autoComplete="new-password"
                className="h-10 bg-card pr-10"
                id="signUpPassword"
                placeholder="Tối thiểu 8 ký tự"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <Button
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute top-0 right-0 size-10 text-muted-foreground"
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

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              aria-invalid={Boolean(errors.confirmPassword)}
              autoComplete="new-password"
              className="h-10 bg-card"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2.5">
            <Checkbox
              checked={watch("acceptedTerms")}
              id="acceptedTerms"
              onCheckedChange={(checked) =>
                setValue("acceptedTerms", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <Label
              className="leading-5 font-normal text-muted-foreground"
              htmlFor="acceptedTerms"
            >
              Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật.
            </Label>
          </div>
          {errors.acceptedTerms ? (
            <p className="text-xs text-destructive">
              {errors.acceptedTerms.message}
            </p>
          ) : null}
        </div>

        <Button className="h-11 w-full text-sm" disabled={isSubmitting}>
          Tạo tài khoản
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link
          className="font-semibold text-primary hover:underline"
          to={ROUTES.signIn}
        >
          Đăng nhập
        </Link>
      </p>
    </AuthPageShell>
  )
}
