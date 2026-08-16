import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { FeatureComingSoon } from "@/components/shared/feature-coming-soon"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/paths"
import { AuthPageShell } from "@/features/auth/components/auth-page-shell"

export function SignUpPage() {
  return (
    <AuthPageShell>
      <Button asChild className="mb-6 -ml-2" size="sm" variant="ghost">
        <Link to={ROUTES.home}>
          <ArrowLeft aria-hidden="true" />
          Về trang chủ
        </Link>
      </Button>

      <FeatureComingSoon
        actions={
          <Button asChild className="h-11 w-full">
            <Link to={ROUTES.signIn}>Đăng nhập</Link>
          </Button>
        }
        description="Tính năng tự đăng ký chưa sẵn sàng. Nếu đã có tài khoản do nhà trường cấp, bạn có thể đăng nhập để sử dụng các chức năng dành riêng cho tài khoản."
        headingLevel="h2"
        title="Đăng ký tài khoản"
      />
    </AuthPageShell>
  )
}
