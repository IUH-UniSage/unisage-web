import { ArrowLeft, Building2, CircleHelp } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/paths"
import { AuthPageShell } from "@/features/auth/components/auth-page-shell"

export function SignUpPage() {
  return (
    <AuthPageShell>
      <Button asChild className="mb-6 -ml-2" size="sm" variant="ghost">
        <Link to={ROUTES.signIn}>
          <ArrowLeft aria-hidden="true" />
          Quay lại đăng nhập
        </Link>
      </Button>

      <div className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
        <Building2 aria-hidden="true" className="size-6" />
      </div>

      <h2 className="mt-5 text-3xl font-bold tracking-tight">
        Tài khoản do nhà trường cấp
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        UniSage chưa hỗ trợ đăng ký công khai. Tài khoản và vai trò truy cập
        được tạo từ hệ thống quản trị của nhà trường.
      </p>

      <div className="mt-6 rounded-xl border bg-card p-4">
        <div className="flex gap-3">
          <CircleHelp
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-primary"
          />
          <div>
            <p className="text-sm font-semibold">Bạn chưa có tài khoản?</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Liên hệ bộ phận CNTT hoặc đơn vị phụ trách để được cấp mã tài
              khoản và phân quyền phù hợp.
            </p>
          </div>
        </div>
      </div>

      <Button asChild className="mt-6 h-11 w-full">
        <Link to={ROUTES.signIn}>Đến trang đăng nhập</Link>
      </Button>
    </AuthPageShell>
  )
}
