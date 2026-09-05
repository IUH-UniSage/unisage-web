import { Calendar, Clock, User, UserCog } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatAuditDate } from "@/utils/date-format"

type AuditInfoProps = {
  className?: string
  createdAt: string | null | undefined
  createdByName?: string | null
  updatedAt?: string | null
  updatedByName?: string | null
}

/**
 * Shared audit-metadata block (created/updated by + when) for entity detail views.
 * Low-priority info — always place it last in the detail layout, after the entity's own content.
 */
export function AuditInfo({
  className,
  createdAt,
  createdByName,
  updatedAt,
  updatedByName,
}: AuditInfoProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 rounded-xl border bg-muted/20 p-4",
        className
      )}
    >
      <AuditInfoTile
        icon={User}
        label="Người tạo"
        value={createdByName || "Hệ thống"}
      />
      <AuditInfoTile
        icon={Calendar}
        label="Ngày tạo"
        value={formatAuditDate(createdAt)}
      />
      {updatedAt ? (
        <>
          <AuditInfoTile
            icon={UserCog}
            label="Người cập nhật"
            value={updatedByName || "Hệ thống"}
          />
          <AuditInfoTile
            icon={Clock}
            label="Cập nhật lần cuối"
            value={formatAuditDate(updatedAt)}
          />
        </>
      ) : null}
    </div>
  )
}

type AuditInfoTileProps = {
  icon: typeof User
  label: string
  value: string
}

function AuditInfoTile({ icon: Icon, label, value }: AuditInfoTileProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <span className="block text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground">{value}</span>
      </div>
    </div>
  )
}
