import { AuditLogList } from "@/features/audit-log/components/audit-log-list"

export function AuditLogPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          Quản trị · Hệ thống
        </p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">
          Nhật ký hệ thống
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Toàn bộ thao tác thêm, sửa, xóa dữ liệu trong hệ thống - ai đã làm gì,
          trên đối tượng nào và vào lúc nào.
        </p>
      </div>

      <AuditLogList />
    </div>
  )
}
