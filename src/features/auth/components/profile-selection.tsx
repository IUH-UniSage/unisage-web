import { ArrowLeft, ChevronRight, ShieldCheck } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getInitials } from "@/features/auth/lib/auth-session"
import type { PendingProfileSelection } from "@/features/auth/model/auth-context"

type ProfileSelectionProps = {
  errorMessage?: string
  onBack: () => void
  onSelect: (userId: string) => void
  pendingProfileSelection: PendingProfileSelection
  selectingUserId: string | null
}

function getRoleLabel(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Quản trị hệ thống"
    case "INGEST_ADMIN":
      return "Quản trị tri thức"
    case "USER":
      return "Người dùng"
    default:
      return role
  }
}

export function ProfileSelection({
  errorMessage,
  onBack,
  onSelect,
  pendingProfileSelection,
  selectingUserId,
}: ProfileSelectionProps) {
  return (
    <div>
      <Button
        className="mb-5 -ml-2"
        onClick={onBack}
        size="sm"
        type="button"
        variant="ghost"
      >
        <ArrowLeft aria-hidden="true" />
        Đăng nhập bằng tài khoản khác
      </Button>

      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">Chọn không gian</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Bạn muốn tiếp tục với vai trò nào?
        </h2>
        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
          Tài khoản {pendingProfileSelection.code} có nhiều hồ sơ được cấp quyền
          truy cập.
        </p>
      </div>

      <div className="space-y-3" role="list">
        {pendingProfileSelection.profiles.map((profile) => {
          const isSelecting = selectingUserId === profile.userId

          return (
            <div key={profile.userId} role="listitem">
              <button
                className="group flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/30 hover:bg-secondary/50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
                disabled={selectingUserId !== null}
                onClick={() => onSelect(profile.userId)}
                type="button"
              >
                <Avatar className="size-11">
                  {profile.avatarUrl ? (
                    <AvatarImage
                      alt=""
                      referrerPolicy="no-referrer"
                      src={profile.avatarUrl}
                    />
                  ) : null}
                  <AvatarFallback className="bg-secondary text-xs font-bold text-primary">
                    {getInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {profile.fullName}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck aria-hidden="true" className="size-3.5" />
                    {getRoleLabel(profile.role)}
                  </span>
                </span>

                {isSelecting ? (
                  <Badge variant="secondary">Đang mở...</Badge>
                ) : (
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {errorMessage ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
        Quyền truy cập và dữ liệu hiển thị phụ thuộc vào hồ sơ bạn chọn.
      </p>
    </div>
  )
}
