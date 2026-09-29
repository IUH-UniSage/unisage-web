import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"
import { useMemo } from "react"

import { DataTable } from "@/components/shared/list/data-table"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getChatModelProviderOption } from "@/features/chat-models/constants/chat-model-providers"
import { chatModelOptions } from "@/features/chat-models/queries/options"
import type { ChatModel } from "@/features/chat-models/schemas/chat-model-schemas"
import {
  getPurposeLabel,
  getSourceTypeLabel,
} from "@/features/chat-models/utils/chat-model-formatters"
import { getModelPricing } from "@/features/cost-management/constants/model-pricing"
import { formatUsdPrecise } from "@/features/cost-management/utils/format-cost"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { getErrorMessage } from "@/utils/error-handler"

// Registry size is bounded by providers x purposes, so one page covers it.
const REGISTRY_PAGE_SIZE = 200

type PriceField =
  "cachedInputPerMillion" | "inputPerMillion" | "outputPerMillion"

function PriceCell({ field, model }: { field: PriceField; model: ChatModel }) {
  if (model.sourceType === "SELF_HOSTED") {
    return <span className="text-success">Không tính phí</span>
  }
  const pricing = getModelPricing(model.llmModelName)
  if (!pricing) {
    return <span className="text-muted-foreground">Chưa có giá</span>
  }
  const value = pricing[field]
  return value == null ? "-" : formatUsdPrecise(value)
}

export function PricingTab() {
  const { canRead } = useResourcePermissions("chat_model")
  const modelsQuery = useQuery({
    ...chatModelOptions.list({ page: 1, size: REGISTRY_PAGE_SIZE }),
    enabled: canRead,
  })

  const models = useMemo(
    () =>
      [...(modelsQuery.data?.data ?? [])].sort(
        (a, b) =>
          (a.llmProvider ?? "").localeCompare(b.llmProvider ?? "") ||
          a.llmModelName.localeCompare(b.llmModelName)
      ),
    [modelsQuery.data]
  )

  const columns = useMemo<ColumnDef<ChatModel, unknown>[]>(
    () => [
      {
        cell: ({ row }) => {
          const provider = row.original.llmProvider
          if (!provider) return "-"
          return getChatModelProviderOption(provider)?.label ?? provider
        },
        header: "Nhà cung cấp",
        id: "provider",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium">{row.original.llmModelName}</p>
            {row.original.displayName ? (
              <p className="text-xs text-muted-foreground">
                {row.original.displayName}
              </p>
            ) : null}
          </div>
        ),
        header: "Mô hình",
        id: "model",
      },
      {
        cell: ({ row }) => getPurposeLabel(row.original.modelPurpose),
        header: "Mục đích",
        id: "purpose",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => getSourceTypeLabel(row.original.sourceType),
        header: "Nguồn",
        id: "sourceType",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => (
          <PriceCell field="inputPerMillion" model={row.original} />
        ),
        header: "Input / 1M token",
        id: "input",
        meta: {
          className: "text-right text-sm",
          headerClassName: "text-right",
        },
      },
      {
        cell: ({ row }) => (
          <PriceCell field="cachedInputPerMillion" model={row.original} />
        ),
        header: "Input cache / 1M token",
        id: "cachedInput",
        meta: {
          className: "text-right text-sm",
          headerClassName: "text-right",
        },
      },
      {
        cell: ({ row }) => (
          <PriceCell field="outputPerMillion" model={row.original} />
        ),
        header: "Output / 1M token",
        id: "output",
        meta: {
          className: "text-right text-sm",
          headerClassName: "text-right",
        },
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Bảng giá</h2>

      <p className="flex max-w-3xl items-start gap-2 text-sm text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        Bảng giá chỉ để tham khảo. Chi phí thực tế được tính theo bảng giá
        LiteLLM đi kèm agent tại thời điểm gọi; mô hình chưa có giá được ghi
        nhận là "chưa định giá" và chỉ cộng chi phí ước tính vào ngân sách.
      </p>

      <Card className="border bg-card shadow-none">
        <CardHeader>
          <CardTitle>Mô hình đang đăng ký</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!canRead ? (
            <p className="p-5 text-sm text-muted-foreground">
              Bạn cần quyền xem mô hình AI để xem bảng giá.
            </p>
          ) : modelsQuery.isPending ? (
            <div className="space-y-2 p-5">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : modelsQuery.isError ? (
            <p className="p-5 text-sm text-destructive">
              {getErrorMessage(modelsQuery.error)}
            </p>
          ) : models.length === 0 ? (
            <SearchEmpty
              description="Thêm mô hình ở trang Mô hình AI để thấy giá tham khảo."
              title="Chưa có mô hình nào"
            />
          ) : (
            <DataTable columns={columns} data={models} getRowId={(m) => m.id} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
