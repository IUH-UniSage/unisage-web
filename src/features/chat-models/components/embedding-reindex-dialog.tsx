import { RefreshCw } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { useEmbeddingIndexQuery } from "@/features/chat-models/queries/use-queries"
import { useChatModelsQuery } from "@/features/chat-models/queries/use-queries"
import type { StartEmbeddingReindexInput } from "@/features/chat-models/schemas/embedding-index-schemas"

type EmbeddingReindexDialogProps = {
  isSubmitting: boolean
  onConfirm: (input: StartEmbeddingReindexInput) => Promise<void>
  onOpenChange: (open: boolean) => void
  /** The model the admin tried to activate, if that is what opened the dialog. */
  preselectedModelId?: string
}

// "switch" = re-embed into another model; "rebuild" = same live model, copy the
// vectors and add the BM25 sparse vector (hybrid retrieval, UNISAGE-104).
type ReindexMode = "switch" | "rebuild"
const REBUILD_VALUE = "__rebuild__"

// Only a verified, switched-off EMBEDDING model can take over the index
// (backend EmbeddingReindexServiceImpl.isReindexTarget).
const CANDIDATE_PARAMS = {
  isActive: true,
  modelPurpose: "EMBEDDING",
  page: 1,
  size: 50,
  status: "INACTIVE",
} as const

export function EmbeddingReindexDialog({
  isSubmitting,
  onConfirm,
  onOpenChange,
  preselectedModelId,
}: EmbeddingReindexDialogProps) {
  const candidatesQuery = useChatModelsQuery(CANDIDATE_PARAMS)
  const indexQuery = useEmbeddingIndexQuery()
  const activeModel = indexQuery.data?.activeModel
  const candidates = (candidatesQuery.data?.data ?? []).filter(
    (model) => model.status === "INACTIVE" && Boolean(model.verifiedAt)
  )
  const [mode, setMode] = useState<ReindexMode>(
    preselectedModelId ? "switch" : "rebuild"
  )
  const [selectedId, setSelectedId] = useState(preselectedModelId)
  const selected = candidates.find((model) => model.id === selectedId)
  const canConfirm =
    mode === "rebuild" ? Boolean(activeModel) : Boolean(selected)

  const confirm = () => {
    if (mode === "rebuild") {
      void onConfirm({ rebuild: true })
    } else if (selected) {
      void onConfirm({ chatModelId: selected.id })
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Re-index chỉ mục embedding</DialogTitle>
          <DialogDescription>
            {preselectedModelId
              ? "Mô hình này tạo vector khác với dữ liệu đã nạp, nên không kích hoạt thẳng được. "
              : null}
            Chỉ mục mới được dựng bên cạnh chỉ mục hiện tại. Trong lúc chạy,
            chat vẫn dùng chỉ mục hiện tại và tạm dừng embed tài liệu mới; khi
            xong hệ thống tự chuyển sang chỉ mục mới.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          aria-label="Kiểu re-index"
          className="gap-2"
          onValueChange={(value) =>
            setMode(value === REBUILD_VALUE ? "rebuild" : "switch")
          }
          value={mode === "rebuild" ? REBUILD_VALUE : "switch"}
        >
          <Label
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            htmlFor="reindex-mode-rebuild"
          >
            <RadioGroupItem
              className="mt-0.5"
              disabled={!activeModel}
              id="reindex-mode-rebuild"
              value={REBUILD_VALUE}
            />
            <span className="min-w-0 space-y-0.5">
              <span className="block font-medium">
                Xây lại chỉ mục với mô hình hiện tại (thêm tìm kiếm từ khóa
                BM25)
              </span>
              <span className="block text-xs text-muted-foreground">
                {activeModel
                  ? `Sao chép vector của ${activeModel.displayName || activeModel.llmModelName}, không gọi API embedding. Dùng khi chỉ mục được nạp trước khi có hybrid retrieval.`
                  : "Chưa có mô hình embedding đang bật."}
              </span>
            </span>
          </Label>
          <Label
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            htmlFor="reindex-mode-switch"
          >
            <RadioGroupItem
              className="mt-0.5"
              id="reindex-mode-switch"
              value="switch"
            />
            <span className="min-w-0 space-y-0.5">
              <span className="block font-medium">
                Re-index sang mô hình embedding khác
              </span>
              <span className="block text-xs text-muted-foreground">
                Toàn bộ đoạn văn được embed lại bằng mô hình mới; mô hình mới tự
                được kích hoạt khi xong.
              </span>
            </span>
          </Label>
        </RadioGroup>

        {mode === "switch" ? (
          candidatesQuery.isPending ? (
            <Skeleton className="h-24 rounded-lg" />
          ) : candidates.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Chưa có mô hình embedding nào đã xác minh và đang tắt. Thêm và xác
              minh mô hình mới trước khi re-index.
            </p>
          ) : (
            <RadioGroup
              aria-label="Mô hình embedding đích"
              className="max-h-72 gap-2 overflow-y-auto"
              onValueChange={setSelectedId}
              value={selectedId}
            >
              {candidates.map((model) => (
                <Label
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  htmlFor={`reindex-${model.id}`}
                  key={model.id}
                >
                  <RadioGroupItem
                    className="mt-0.5"
                    id={`reindex-${model.id}`}
                    value={model.id}
                  />
                  <span className="min-w-0 space-y-0.5">
                    <span className="block truncate font-medium">
                      {model.displayName || model.llmModelName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {model.llmProvider ?? "—"} · {model.llmModelName}
                    </span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          )
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isSubmitting} variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button disabled={isSubmitting || !canConfirm} onClick={confirm}>
            <RefreshCw aria-hidden="true" />
            {isSubmitting
              ? "Đang bắt đầu..."
              : mode === "rebuild"
                ? "Xây lại chỉ mục"
                : "Bắt đầu re-index"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type CancelEmbeddingReindexDialogProps = {
  isSubmitting: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
}

export function CancelEmbeddingReindexDialog({
  isSubmitting,
  onConfirm,
  onOpenChange,
}: CancelEmbeddingReindexDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Huỷ re-index?</DialogTitle>
          <DialogDescription>
            Phần đã embed lại sẽ bị bỏ. Chỉ mục và mô hình embedding hiện tại
            giữ nguyên, việc nạp tài liệu được mở lại.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isSubmitting} variant="outline">
              Tiếp tục re-index
            </Button>
          </DialogClose>
          <Button
            disabled={isSubmitting}
            onClick={() => void onConfirm()}
            variant="destructive"
          >
            {isSubmitting ? "Đang huỷ..." : "Huỷ re-index"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
