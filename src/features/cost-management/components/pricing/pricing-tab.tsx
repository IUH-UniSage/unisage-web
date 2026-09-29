import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import {
  ExternalLink,
  History,
  Info,
  Plus,
  RefreshCw,
  RotateCcw,
} from "lucide-react"
import { useMemo, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/shared/dialog/confirm-delete-dialog"
import { DataTable } from "@/components/shared/list/data-table"
import { EntityActionsMenu } from "@/components/shared/list/entity-actions-menu"
import { SearchEmpty } from "@/components/shared/list/search-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getChatModelProviderOption } from "@/features/chat-models/constants/chat-model-providers"
import { chatModelOptions } from "@/features/chat-models/queries/options"
import type { ChatModelSourceType } from "@/features/chat-models/schemas/chat-model-schemas"
import { getPurposeLabel } from "@/features/chat-models/utils/chat-model-formatters"
import { PriceDialog } from "@/features/cost-management/components/pricing/price-dialog"
import {
  useCreateModelPriceMutation,
  useResetModelPriceMutation,
  useSyncModelPricesMutation,
  useUpdateModelPriceMutation,
} from "@/features/cost-management/queries/use-mutations"
import { useModelPricesQuery } from "@/features/cost-management/queries/use-queries"
import type {
  ModelPrice,
  ModelPriceRequest,
  ModelPricingSyncResult,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { formatUsdPrecise } from "@/features/cost-management/utils/format-cost"
import {
  getPriceSourceLabel,
  getProviderPricingUrl,
  priceKey,
} from "@/features/cost-management/utils/pricing-labels"
import { formatUtcDateTime } from "@/features/cost-management/utils/usage-display"
import { useResourcePermissions } from "@/hooks/use-resource-permissions"
import { getErrorMessage } from "@/utils/error-handler"

// Registry size is bounded by providers x purposes, so one page covers it.
const REGISTRY_PAGE_SIZE = 200

type PricingView = "registered" | "all"

type PricingRow = {
  displayName?: string | null
  key: string
  modelName: string
  price?: ModelPrice
  provider: string
  purpose?: string
  sourceType: ChatModelSourceType
}

type DialogTarget =
  | { kind: "edit"; price: ModelPrice }
  | { kind: "new"; model?: { modelName: string; provider: string } }

type PricingTabProps = {
  onShowHistory?: (filter: { model: string; provider: string }) => void
}

function PriceCell({
  row,
  value,
}: {
  row: PricingRow
  value: number | null | undefined
}) {
  if (row.sourceType === "SELF_HOSTED") {
    return <span className="text-success">Không tính phí</span>
  }
  if (!row.price) {
    return <span className="text-muted-foreground">Chưa có giá</span>
  }
  return value == null ? "-" : formatUsdPrecise(value)
}

function describeSync(result: ModelPricingSyncResult): string {
  return (
    `Đã đồng bộ: ${result.created} giá mới, ${result.updated} giá thay đổi, ` +
    `${result.unchanged} giữ nguyên, ${result.skippedManual} giá chỉnh tay được giữ` +
    (result.rejected > 0
      ? `, ${result.rejected} giá bất thường bị bỏ qua.`
      : ".")
  )
}

export function PricingTab({ onShowHistory }: PricingTabProps) {
  const pricing = useResourcePermissions("model_pricing")
  const chatModels = useResourcePermissions("chat_model")
  const [view, setView] = useState<PricingView>(
    chatModels.canRead ? "registered" : "all"
  )
  const [search, setSearch] = useState("")
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>()
  const [resetTarget, setResetTarget] = useState<ModelPrice>()
  const [syncMessage, setSyncMessage] = useState<string>()

  const pricesQuery = useModelPricesQuery(pricing.canRead)
  const modelsQuery = useQuery({
    ...chatModelOptions.list({ page: 1, size: REGISTRY_PAGE_SIZE }),
    enabled: chatModels.canRead && view === "registered",
  })
  const syncPrices = useSyncModelPricesMutation()
  const createPrice = useCreateModelPriceMutation()
  const updatePrice = useUpdateModelPriceMutation()
  const resetPrice = useResetModelPriceMutation()

  const pricesByKey = useMemo(
    () =>
      new Map(
        (pricesQuery.data ?? []).map((price) => [
          priceKey(price.provider, price.modelName),
          price,
        ])
      ),
    [pricesQuery.data]
  )

  const lastSyncedAt = useMemo(
    () =>
      (pricesQuery.data ?? [])
        .map((price) => price.syncedAt)
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1),
    [pricesQuery.data]
  )

  const rows = useMemo<PricingRow[]>(() => {
    const term = search.trim().toLowerCase()
    const all: PricingRow[] =
      view === "registered"
        ? (modelsQuery.data?.data ?? []).map((model) => {
            const provider = model.llmProvider ?? ""
            return {
              displayName: model.displayName,
              key: model.id,
              modelName: model.llmModelName,
              price: pricesByKey.get(priceKey(provider, model.llmModelName)),
              provider,
              purpose: getPurposeLabel(model.modelPurpose),
              sourceType: model.sourceType,
            }
          })
        : (pricesQuery.data ?? []).map((price) => ({
            key: price.id,
            modelName: price.modelName,
            price,
            provider: price.provider,
            sourceType: "CLOUD_API",
          }))
    return all
      .filter((row) => !term || row.modelName.toLowerCase().includes(term))
      .sort(
        (a, b) =>
          a.provider.localeCompare(b.provider) ||
          a.modelName.localeCompare(b.modelName)
      )
  }, [view, search, modelsQuery.data, pricesQuery.data, pricesByKey])

  const runSync = async () => {
    setSyncMessage(undefined)
    const result = await syncPrices.mutateAsync()
    setSyncMessage(describeSync(result))
  }

  const save = async (input: ModelPriceRequest) => {
    if (dialogTarget?.kind === "edit") {
      await updatePrice.mutateAsync({ input, priceId: dialogTarget.price.id })
    } else {
      await createPrice.mutateAsync(input)
    }
    setDialogTarget(undefined)
  }

  const confirmReset = async () => {
    if (!resetTarget) return
    await resetPrice.mutateAsync(resetTarget.id)
    setResetTarget(undefined)
    // Without a sync the model would stay unpriced until the nightly run.
    if (pricing.canCreate) {
      await runSync().catch(() => undefined)
    }
  }

  const columns = useMemo<ColumnDef<PricingRow, unknown>[]>(
    () => [
      {
        cell: ({ row }) => {
          const provider = row.original.provider
          if (!provider) return "-"
          const url = getProviderPricingUrl(provider)
          const label = getChatModelProviderOption(provider)?.label ?? provider
          return url ? (
            <a
              className="inline-flex items-center gap-1 hover:underline"
              href={url}
              rel="noreferrer"
              target="_blank"
              title="Trang giá chính thức của nhà cung cấp"
            >
              {label}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          ) : (
            label
          )
        },
        header: "Nhà cung cấp",
        id: "provider",
        meta: { className: "text-sm" },
      },
      {
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium">{row.original.modelName}</p>
            {row.original.displayName || row.original.purpose ? (
              <p className="text-xs text-muted-foreground">
                {[row.original.purpose, row.original.displayName]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        ),
        header: "Mô hình",
        id: "model",
      },
      {
        cell: ({ row }) => (
          <PriceCell
            row={row.original}
            value={row.original.price?.inputPerMillion}
          />
        ),
        header: "Input / 1M",
        id: "input",
        meta: {
          className: "text-right text-sm",
          headerClassName: "text-right",
        },
      },
      {
        cell: ({ row }) => (
          <PriceCell
            row={row.original}
            value={
              row.original.price?.cachedInputPerMillion ??
              row.original.price?.inputPerMillion
            }
          />
        ),
        header: "Input cache / 1M",
        id: "cachedInput",
        meta: {
          className: "text-right text-sm",
          headerClassName: "text-right",
        },
      },
      {
        cell: ({ row }) => (
          <PriceCell
            row={row.original}
            value={row.original.price?.outputPerMillion}
          />
        ),
        header: "Output / 1M",
        id: "output",
        meta: {
          className: "text-right text-sm",
          headerClassName: "text-right",
        },
      },
      {
        cell: ({ row }) => {
          const price = row.original.price
          if (!price) return "-"
          return (
            <div className="text-xs">
              <Badge
                className={
                  price.source === "MANUAL"
                    ? "border-transparent bg-warning/40 text-warning-foreground"
                    : "border-transparent bg-muted text-muted-foreground"
                }
                variant="ghost"
              >
                {getPriceSourceLabel(price.source)}
              </Badge>
              {price.source === "MANUAL" && price.updatedByEmail ? (
                <p className="mt-1 text-muted-foreground">
                  {price.updatedByEmail}
                </p>
              ) : null}
            </div>
          )
        },
        header: "Nguồn",
        id: "source",
      },
      {
        cell: ({ row }) => {
          const { price, modelName, provider, sourceType } = row.original
          if (sourceType === "SELF_HOSTED") return null
          // Unsupported providers (e.g. a leftover groq model) can't be priced by the backend.
          const canAdd =
            !price &&
            pricing.canCreate &&
            Boolean(getChatModelProviderOption(provider))
          return (
            <EntityActionsMenu
              canUpdate={Boolean(price) && pricing.canUpdate}
              editLabel="Sửa giá"
              entityLabel={modelName}
              onEdit={
                price
                  ? () => setDialogTarget({ kind: "edit", price })
                  : undefined
              }
            >
              {canAdd ? (
                <DropdownMenuItem
                  onClick={() =>
                    setDialogTarget({
                      kind: "new",
                      model: { modelName, provider },
                    })
                  }
                >
                  <Plus aria-hidden="true" className="size-4" />
                  <span>Thêm giá</span>
                </DropdownMenuItem>
              ) : null}
              {price?.source === "MANUAL" && pricing.canDelete ? (
                <DropdownMenuItem onClick={() => setResetTarget(price)}>
                  <RotateCcw aria-hidden="true" className="size-4" />
                  <span>Khôi phục giá LiteLLM</span>
                </DropdownMenuItem>
              ) : null}
              {onShowHistory && provider ? (
                <DropdownMenuItem
                  onClick={() => onShowHistory({ model: modelName, provider })}
                >
                  <History aria-hidden="true" className="size-4" />
                  <span>Lịch sử giá</span>
                </DropdownMenuItem>
              ) : null}
            </EntityActionsMenu>
          )
        },
        header: () => <span className="sr-only">Thao tác</span>,
        id: "actions",
        meta: { className: "w-12 text-right", headerClassName: "w-12" },
      },
    ],
    [pricing.canCreate, pricing.canDelete, pricing.canUpdate, onShowHistory]
  )

  const activeQuery = view === "registered" ? modelsQuery : pricesQuery
  const hasNoPrices = pricesQuery.isSuccess && pricesQuery.data.length === 0

  if (!pricing.canRead) {
    return (
      <p className="text-sm text-muted-foreground">
        Bạn cần quyền xem bảng giá mô hình AI.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Bảng giá</h2>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="flex max-w-3xl items-start gap-2 text-sm text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            Giá openai/google được đồng bộ mỗi ngày từ bảng giá LiteLLM (chỉ
            tier Standard); giá chỉnh tay không bị ghi đè. Giá mới áp dụng cho
            các lượt gọi sau, không tính lại chi phí đã ghi. Mô hình chưa có giá
            được ghi là "chưa định giá" và chỉ cộng chi phí ước tính.
            {lastSyncedAt
              ? ` Lần đồng bộ gần nhất: ${formatUtcDateTime(lastSyncedAt)}.`
              : ""}
          </span>
        </p>
        {pricing.canCreate ? (
          <div className="flex gap-2">
            <Button
              disabled={syncPrices.isPending}
              onClick={() => void runSync().catch(() => undefined)}
              variant="outline"
            >
              <RefreshCw
                aria-hidden="true"
                className={syncPrices.isPending ? "animate-spin" : undefined}
              />
              Đồng bộ ngay
            </Button>
            <Button onClick={() => setDialogTarget({ kind: "new" })}>
              <Plus aria-hidden="true" />
              Thêm giá
            </Button>
          </div>
        ) : null}
      </div>

      {syncMessage ? (
        <p className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
          {syncMessage}
        </p>
      ) : null}
      {syncPrices.isError ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {getErrorMessage(syncPrices.error)}
        </p>
      ) : null}
      {hasNoPrices ? (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm">
          Chưa có giá nào trong hệ thống. Mọi lượt gọi đang được ghi là chưa
          định giá cho tới lần đồng bộ đầu tiên (03:00 hằng ngày
          {pricing.canCreate ? ' hoặc bấm "Đồng bộ ngay"' : ""}).
        </p>
      ) : null}

      <Card className="border bg-card shadow-none">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>
            {view === "registered"
              ? "Mô hình đang đăng ký"
              : "Toàn bộ bảng giá"}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {chatModels.canRead ? (
              <Select
                onValueChange={(value) => setView(value as PricingView)}
                value={view}
              >
                <SelectTrigger aria-label="Chọn danh sách" className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registered">
                    Mô hình đang đăng ký
                  </SelectItem>
                  <SelectItem value="all">Toàn bộ bảng giá</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
            <Input
              aria-label="Tìm mô hình"
              className="w-56"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mô hình..."
              value={search}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeQuery.isPending || pricesQuery.isPending ? (
            <div className="space-y-2 p-5">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : activeQuery.isError || pricesQuery.isError ? (
            <p className="p-5 text-sm text-destructive">
              {getErrorMessage(activeQuery.error ?? pricesQuery.error)}
            </p>
          ) : rows.length === 0 ? (
            <SearchEmpty
              description={
                view === "registered"
                  ? "Thêm mô hình ở trang Cấu hình AI để thấy giá."
                  : "Thử từ khoá khác."
              }
              title="Không có mô hình nào"
            />
          ) : (
            <DataTable columns={columns} data={rows} getRowId={(r) => r.key} />
          )}
        </CardContent>
      </Card>

      {dialogTarget ? (
        <PriceDialog
          initialModel={
            dialogTarget.kind === "new" ? dialogTarget.model : undefined
          }
          isSaving={createPrice.isPending || updatePrice.isPending}
          onOpenChange={(open) => {
            if (!open) setDialogTarget(undefined)
          }}
          onSubmit={save}
          price={dialogTarget.kind === "edit" ? dialogTarget.price : undefined}
        />
      ) : null}

      {resetTarget ? (
        <ConfirmDeleteDialog
          description={`Giá chỉnh tay của "${resetTarget.modelName}" sẽ bị xoá và thay bằng giá LiteLLM ở lần đồng bộ ngay sau đó.`}
          entityLabel="giá chỉnh tay"
          isSubmitting={resetPrice.isPending || syncPrices.isPending}
          onConfirm={confirmReset}
          onOpenChange={(open) => {
            if (!open) setResetTarget(undefined)
          }}
          title={`Khôi phục giá LiteLLM cho "${resetTarget.modelName}"?`}
        />
      ) : null}
    </div>
  )
}
