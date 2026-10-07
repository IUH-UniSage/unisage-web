import type { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { Pagination } from "@/components/shared/list/pagination"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { getChatModelProviderOption } from "@/features/chat-models/constants/chat-model-providers"
import type { ChatModel } from "@/features/chat-models/schemas/chat-model-schemas"
import {
  getPurposeLabel,
  getStatusLabel,
  STATUS_BADGE_STYLES,
} from "@/features/chat-models/utils/chat-model-formatters"
import { DialogTourButton } from "@/features/product-tour"

const PAGE_SIZE = 10

const COLUMNS: ColumnDef<ChatModel, unknown>[] = [
  {
    cell: ({ row }) =>
      row.original.displayName || (
        <span className="text-muted-foreground">Chưa đặt</span>
      ),
    header: "Tên gợi nhớ",
    id: "displayName",
    meta: { className: "font-medium" },
  },
  {
    cell: ({ row }) => getPurposeLabel(row.original.modelPurpose),
    header: "Mục đích",
    id: "purpose",
    meta: { className: "text-sm" },
  },
  {
    cell: ({ row }) => (
      <Badge className={STATUS_BADGE_STYLES[row.original.status]}>
        {getStatusLabel(row.original.status)}
      </Badge>
    ),
    header: "Trạng thái",
    id: "status",
  },
]

type RegisteredModelsDialogProps = {
  modelName: string
  models: ChatModel[]
  onOpenChange: (open: boolean) => void
  provider: string
}

export function RegisteredModelsDialog({
  modelName,
  models,
  onOpenChange,
  provider,
}: RegisteredModelsDialogProps) {
  const [page, setPage] = useState(1)
  const providerLabel = getChatModelProviderOption(provider)?.label ?? provider
  const totalPages = Math.ceil(models.length / PAGE_SIZE)
  const pageModels = models.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTourButton tourKey="registered-models" />
        <DialogHeader {...tourAnchor(TOUR_ANCHORS.dialogHeader)}>
          <DialogTitle className="font-mono text-base">{modelName}</DialogTitle>
          <DialogDescription>
            {[providerLabel, `${models.length} cấu hình đang đăng ký`]
              .filter(Boolean)
              .join(" · ")}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg border">
          <DataTable
            columns={COLUMNS}
            data={pageModels}
            getRowId={(model) => model.id}
          />
          {totalPages > 1 ? (
            <Pagination
              className="rounded-none border-x-0 border-b-0 shadow-none"
              currentPage={page}
              onPageChange={setPage}
              pageSize={PAGE_SIZE}
              totalItems={models.length}
              totalPages={totalPages}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
