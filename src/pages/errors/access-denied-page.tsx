import { ShieldAlert } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function AccessDeniedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-5 grid size-14 place-items-center rounded-xl bg-destructive/10">
            <ShieldAlert
              aria-hidden="true"
              className="size-6 text-destructive"
            />
          </div>
          <h1 className="text-2xl font-bold">Bạn không có quyền truy cập</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Tài khoản hiện tại chưa được cấp quyền sử dụng chức năng này. Vui
            lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
