import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/features/auth/utils/auth-session"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  avatarUrl?: string | null
  className?: string
  fallbackClassName?: string
  fullName?: string
}

export function UserAvatar({
  avatarUrl,
  className,
  fallbackClassName,
  fullName,
}: UserAvatarProps) {
  return (
    <Avatar className={cn("size-9", className)}>
      {avatarUrl ? (
        <AvatarImage alt="" referrerPolicy="no-referrer" src={avatarUrl} />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-primary text-xs font-semibold text-primary-foreground",
          fallbackClassName
        )}
      >
        {fullName ? getInitials(fullName) : "US"}
      </AvatarFallback>
    </Avatar>
  )
}
