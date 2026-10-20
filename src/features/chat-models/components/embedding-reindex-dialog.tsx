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
import { useChatModelsQuery } from "@/features/chat-models/queries/use-queries"

type EmbeddingReindexDialogProps = {
  isSubmitting: boolean
  onConfirm: (chatModelId: string) => Promise<void>
  onOpenChange: (open: boolean) => void
  /** The model the admin tried to activate, if that is what opened the dialog. */
  preselectedModelId?: string
}

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
  const candidates = (candidatesQuery.data?.data ?? []).filter(
    (model) => model.status === "INACTIVE" && Boolean(model.verifiedAt)
  )
  const [selectedId, setSelectedId] = useState(preselectedModelId)
  const selected = candidates.find((model) => model.id === selectedId)

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Re-index sang mô hình embedding khác</DialogTitle>
          <DialogDescription>
            {preselectedModelId
              ? "Mô hình này tạo vector khác với dữ liệu đã nạp, nên không kích hoạt thẳng được. "
              : null}
            Toàn bộ đoạn văn đã nạp sẽ được embed lại bằng mô hình mới vào một
            chỉ mục mới. Trong lúc chạy, chat vẫn dùng chỉ mục hiện tại và tạm
            dừng embed tài liệu mới. Khi xong, mô hình mới tự được kích hoạt.
          </DialogDescription>
        </DialogHeader>

        {candidatesQuery.isPending ? (
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
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isSubmitting} variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button
            disabled={isSubmitting || !selected}
            onClick={() => {
              if (selected) void onConfirm(selected.id)
            }}
          >
            <RefreshCw aria-hidden="true" />
            {isSubmitting ? "Đang bắt đầu..." : "Bắt đầu re-index"}
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
