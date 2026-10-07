import {
  Calendar,
  Clock3,
  CreditCard,
  KeyRound,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  User,
  Users,
} from "lucide-react"
import { useState } from "react"

import { UserAvatar } from "@/components/shared/navigation/user-avatar"
import { Button } from "@/components/ui/button"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChangePasswordDialog } from "@/features/profile/components/change-password-dialog"
import { ProfileInfoItem } from "@/features/profile/components/profile-info-item"
import {
  getProfileAccessLevelLabel,
  getProfileFullName,
  getProfileGenderLabel,
} from "@/features/profile/utils/profile-display"
import { UsageLimitCard } from "@/features/usage-limits/components/usage-limit-card"
import type { AppUser } from "@/features/users/schemas/user-schemas"
import { formatAuditDate } from "@/utils/date-format"

// Client-facing profile: banner header + basic-info card.
export function UserProfile({ me }: { me: AppUser }) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const fullName = getProfileFullName(me)

  return (
    <div className="mx-auto mt-6 mb-8 w-full max-w-[1200px] space-y-6 px-4">
      <div
        {...tourAnchor(TOUR_ANCHORS.pageHeader)}
        className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-primary to-primary/75 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar
            avatarUrl={me.avatarUrl}
            className="size-14 bg-white/15"
            fallbackClassName="bg-white/20 text-lg text-white"
            fullName={fullName}
          />
          <div className="min-w-0">
            <p className="text-xs text-white/80">Thông tin cá nhân</p>
            <h1 className="truncate text-2xl font-bold text-white">
              {fullName}
            </h1>
            {me.code ? (
              <p className="text-sm text-white/80">{me.code}</p>
            ) : null}
          </div>
        </div>
        <Button
          {...tourAnchor(TOUR_ANCHORS.pageActions)}
          className="self-start sm:self-center"
          onClick={() => setIsPasswordDialogOpen(true)}
          type="button"
          variant="secondary"
        >
          <KeyRound aria-hidden="true" className="mr-2 size-4" />
          Đổi mật khẩu
        </Button>
      </div>

      <Card
        {...tourAnchor(TOUR_ANCHORS.profileBasic)}
        className="border bg-card shadow-none"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <User aria-hidden="true" className="size-4" />
            Hồ sơ cơ bản
          </CardTitle>
          <CardDescription>
            Thông tin tài khoản của bạn. Liên hệ quản trị viên nếu cần chỉnh
            sửa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileInfoItem
              icon={CreditCard}
              label="Mã / Username"
              mono
              value={me.code || "Chưa có"}
            />
            <ProfileInfoItem icon={User} label="Họ và tên" value={fullName} />
            <ProfileInfoItem
              icon={Mail}
              label="Email"
              value={me.email || "—"}
            />
            <ProfileInfoItem
              icon={Phone}
              label="Số điện thoại"
              value={me.phone || "Chưa cập nhật"}
            />
            <ProfileInfoItem
              icon={Users}
              label="Giới tính"
              value={getProfileGenderLabel(me)}
            />
          </div>
        </CardContent>
      </Card>

      <Card
        {...tourAnchor(TOUR_ANCHORS.profileAccount)}
        className="border bg-card shadow-none"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Shield aria-hidden="true" className="size-4" />
            Tài khoản
          </CardTitle>
          <CardDescription>
            Vai trò và phạm vi truy cập của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileInfoItem
              icon={Shield}
              label="Vai trò"
              value={me.roleName || "Chưa gán vai trò"}
            />
            <ProfileInfoItem
              icon={ShieldAlert}
              label="Cấp truy cập"
              value={getProfileAccessLevelLabel(me)}
            />
            <ProfileInfoItem
              icon={Clock3}
              label="Đăng nhập gần nhất"
              value={formatAuditDate(me.lastLogin)}
            />
            <ProfileInfoItem
              icon={Calendar}
              label="Ngày tạo tài khoản"
              value={formatAuditDate(me.createdAt)}
            />
          </div>
        </CardContent>
      </Card>

      <UsageLimitCard />

      <ChangePasswordDialog
        onOpenChange={setIsPasswordDialogOpen}
        open={isPasswordDialogOpen}
      />
    </div>
  )
}
