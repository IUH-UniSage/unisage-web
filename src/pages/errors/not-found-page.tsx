import { ArrowLeft, Search } from "lucide-react"
import { Link } from "react-router-dom"

import { BrandLogo } from "@/components/shared/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/paths"

export function NotFoundPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6 py-12">
      <div className="w-full max-w-lg text-center">
        <BrandLogo className="mb-10 justify-center" />
        <div className="mx-auto mb-6 grid size-24 place-items-center rounded-3xl bg-secondary">
          <Search
            aria-hidden="true"
            className="size-10 text-primary"
            strokeWidth={1.6}
          />
        </div>
        <p className="mb-2 text-sm font-semibold text-primary">Lỗi 404</p>
        <h1 className="text-3xl font-bold">Không tìm thấy trang</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Trang UniSage bạn yêu cầu không tồn tại hoặc đã được di chuyển.
        </p>
        <Button asChild className="mt-7">
          <Link to={ROUTES.home}>
            <ArrowLeft aria-hidden="true" />
            Về trang chủ
          </Link>
        </Button>
      </div>
    </main>
  )
}
