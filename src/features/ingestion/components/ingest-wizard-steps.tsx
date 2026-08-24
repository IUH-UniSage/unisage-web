import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertTriangle,
  ChevronRight,
  FileText,
  Loader2,
  Settings2,
} from "lucide-react"
import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Textarea } from "@/components/ui/textarea"
import type { useIngestWizard } from "@/features/ingestion/hooks/use-ingest-wizard"
import {
  chunkingFormSchema,
  type Chunk,
  type ChunkingFormValues,
  type ChunkingStrategyName,
  type RegionType,
} from "@/features/ingestion/schemas/ingestion-schemas"
import { cn } from "@/lib/utils"
import { getAiErrorMessage } from "@/utils/ai-response"

const STRATEGY_LABELS: Record<ChunkingStrategyName, string> = {
  excel_row: "Theo dòng Excel",
  markdown_aware: "Nhận diện Markdown",
  recursive: "Đệ quy (mặc định)",
  semantic: "Theo ngữ nghĩa",
  token_based: "Theo số token",
}

const REGION_TYPE_LABELS: Record<RegionType, string> = {
  excel_row: "Dòng Excel",
  table: "Bảng",
  text: "Văn bản",
}

const REGION_TYPE_BADGE_CLASSNAME: Record<RegionType, string> = {
  excel_row: "border-transparent bg-sky/10 text-sky font-bold text-[9px]",
  table: "border-transparent bg-amber-100 text-amber-700 font-bold text-[9px]",
  text: "border-transparent bg-slate-100 text-slate-600 font-bold text-[9px]",
}

const CHUNK_COLORS = [
  {
    badge: "bg-blue-100 text-blue-700",
    bg: "bg-blue-50/80",
    border: "border-blue-200",
    label: "text-blue-700",
    ring: "ring-blue-400",
  },
  {
    badge: "bg-fuchsia-100 text-fuchsia-700",
    bg: "bg-fuchsia-50/80",
    border: "border-fuchsia-200",
    label: "text-fuchsia-700",
    ring: "ring-fuchsia-400",
  },
  {
    badge: "bg-emerald-100 text-emerald-700",
    bg: "bg-emerald-50/80",
    border: "border-emerald-200",
    label: "text-emerald-700",
    ring: "ring-emerald-400",
  },
  {
    badge: "bg-amber-100 text-amber-700",
    bg: "bg-amber-50/80",
    border: "border-amber-200",
    label: "text-amber-700",
    ring: "ring-amber-400",
  },
  {
    badge: "bg-indigo-100 text-indigo-700",
    bg: "bg-indigo-50/80",
    border: "border-indigo-200",
    label: "text-indigo-700",
    ring: "ring-indigo-400",
  },
  {
    badge: "bg-rose-100 text-rose-700",
    bg: "bg-rose-50/80",
    border: "border-rose-200",
    label: "text-rose-700",
    ring: "ring-rose-400",
  },
]

const estimateTokens = (text: string) => Math.ceil(text.length / 4)

function buildChunkingParams(
  values: ChunkingFormValues
): Record<string, unknown> {
  switch (values.strategy) {
    case "excel_row":
      return { rows_per_chunk: values.rowsPerChunk ?? 1 }
    case "semantic":
      return {
        overlap_ratio: values.overlapRatio ?? 0.2,
        similarity_threshold: values.similarityThreshold ?? 0.5,
        target_tokens: values.targetTokens ?? 400,
      }
    case "token_based":
      return {
        chunk_size: values.chunkSize ?? 400,
        overlap: values.overlap ?? 40,
      }
    case "markdown_aware":
    case "recursive":
      return {
        chunk_size: values.chunkSize ?? 800,
        overlap: values.overlap ?? 120,
      }
  }
}

function StepActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
      {children}
    </div>
  )
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive shadow-sm"
      role="alert"
    >
      <AlertTriangle className="size-4 shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  )
}

type StepProps = { wizard: ReturnType<typeof useIngestWizard> }

export function PreviewStep({ wizard }: StepProps) {
  const isLoading = wizard.previewMutation.isPending
  const error = wizard.previewMutation.error

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="text-[11px] font-black tracking-widest text-slate-700 uppercase">
            Nội dung xem trước
          </h3>
        </div>
        {wizard.previewText ? (
          <span className="text-[10px] font-bold text-slate-400">
            {wizard.previewText.length} ký tự (~
            {estimateTokens(wizard.previewText)} tokens)
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-slate-50/50 py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-xs font-bold">Đang tải nội dung tài liệu...</p>
        </div>
      ) : error ? (
        <ErrorAlert message={getAiErrorMessage(error)} />
      ) : (
        <div className="max-h-112 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-relaxed font-medium whitespace-pre-wrap text-slate-700 shadow-sm">
          {wizard.previewText}
        </div>
      )}

      <StepActions>
        <Button
          className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 text-xs font-black tracking-widest text-white uppercase shadow-md shadow-blue-200 hover:bg-blue-700"
          disabled={isLoading || !wizard.previewText}
          onClick={wizard.goToChunking}
        >
          <span>Tiếp tục</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </StepActions>
    </div>
  )
}

export function ChunkingConfigPanel({ wizard }: StepProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<ChunkingFormValues>({
    defaultValues: { strategy: wizard.chunkingStrategy },
    resolver: zodResolver(chunkingFormSchema),
  })
  const strategy = watch("strategy")
  const isSubmitting = wizard.chunkMutation.isPending
  const error = wizard.chunkMutation.error

  const [tokenLimit, setTokenLimit] = useState(512)

  const chunksOverLimit = useMemo(
    () => wizard.chunks.filter((c) => estimateTokens(c.content) > tokenLimit),
    [wizard.chunks, tokenLimit]
  )

  const submit = (values: ChunkingFormValues) => {
    wizard.runChunk(values.strategy, buildChunkingParams(values))
  }

  const strategies: { id: ChunkingStrategyName; label: string }[] = [
    { id: "recursive", label: "ĐỆ QUY" },
    { id: "token_based", label: "TOKEN" },
    { id: "semantic", label: "NGỮ NGHĨA" },
    { id: "markdown_aware", label: "MARKDOWN" },
    { id: "excel_row", label: "EXCEL" },
  ]

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={(event) => void handleSubmit(submit)(event)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <Settings2 className="h-4 w-4" />
        </div>
        <h3 className="text-[11px] font-black tracking-widest text-slate-700 uppercase">
          Chiến lược phân đoạn
        </h3>
      </div>

      {/* Strategies Grid Selector */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {strategies.map((s) => (
          <button
            className={cn(
              "cursor-pointer rounded-xl border px-1.5 py-2 text-[9px] font-black tracking-widest transition-all",
              strategy === s.id
                ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200"
                : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300"
            )}
            key={s.id}
            onClick={() => setValue("strategy", s.id)}
            type="button"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Strategy Description Label */}
      <p className="text-[10px] font-bold text-slate-400">
        {STRATEGY_LABELS[strategy]}
      </p>

      {/* Inputs based on strategy */}
      <div className="space-y-4 pt-1">
        {strategy === "excel_row" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
              <span className="text-slate-400">Số dòng mỗi đoạn</span>
              <span className="font-bold text-blue-600">
                {watch("rowsPerChunk") ?? 1} dòng
              </span>
            </div>
            <Input
              className="h-10 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
              defaultValue={1}
              id="chunking-rows-per-chunk"
              min={1}
              type="number"
              {...register("rowsPerChunk", { valueAsNumber: true })}
            />
          </div>
        ) : strategy === "semantic" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                <span className="text-slate-400">Token mục tiêu</span>
                <span className="font-bold text-blue-600">
                  {watch("targetTokens") ?? 400}
                </span>
              </div>
              <Input
                className="h-10 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                defaultValue={400}
                id="chunking-target-tokens"
                min={1}
                type="number"
                {...register("targetTokens", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                <span className="text-slate-400">Tỷ lệ chồng lấn</span>
                <span className="font-bold text-blue-600">
                  {watch("overlapRatio") ?? 0.2}
                </span>
              </div>
              <Input
                className="h-10 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                defaultValue={0.2}
                id="chunking-overlap-ratio"
                max={1}
                min={0}
                step={0.1}
                type="number"
                {...register("overlapRatio", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                <span className="text-slate-400">Ngưỡng tương đồng</span>
                <span className="font-bold text-blue-600">
                  {watch("similarityThreshold") ?? 0.5}
                </span>
              </div>
              <Input
                className="h-10 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                defaultValue={0.5}
                id="chunking-similarity-threshold"
                max={1}
                min={0}
                step={0.1}
                type="number"
                {...register("similarityThreshold", { valueAsNumber: true })}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                <span className="text-slate-400">Kích thước đoạn</span>
                <span className="font-bold text-blue-600">
                  {watch("chunkSize") ??
                    (strategy === "token_based" ? 400 : 800)}
                </span>
              </div>
              <Input
                className="h-10 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                defaultValue={strategy === "token_based" ? 400 : 800}
                id="chunking-chunk-size"
                min={1}
                type="number"
                {...register("chunkSize", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                <span className="text-slate-400">Độ chồng lấn</span>
                <span className="font-bold text-blue-600">
                  {watch("overlap") ?? (strategy === "token_based" ? 40 : 120)}
                </span>
              </div>
              <Input
                className="h-10 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                defaultValue={strategy === "token_based" ? 40 : 120}
                id="chunking-overlap"
                min={0}
                type="number"
                {...register("overlap", { valueAsNumber: true })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Token Limit Warning Config */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
          <span className="flex items-center gap-1 text-orange-500">
            <AlertTriangle className="h-3 w-3" /> Giới hạn Token
          </span>
          <span
            className={cn(
              "font-black",
              chunksOverLimit.length > 0 ? "text-red-500" : "text-slate-400"
            )}
          >
            {tokenLimit} tk
          </span>
        </div>
        <input
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-orange-500"
          max="4096"
          min="64"
          onChange={(e) => setTokenLimit(+e.target.value)}
          step="64"
          type="range"
          value={tokenLimit}
        />
        <div className="flex gap-1.5">
          {[256, 512, 1024, 2048].map((n) => (
            <button
              className={cn(
                "flex-1 cursor-pointer rounded-lg border py-1 text-[9px] font-black transition-all",
                tokenLimit === n
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300"
              )}
              key={n}
              onClick={() => setTokenLimit(n)}
              type="button"
            >
              {n}
            </button>
          ))}
        </div>
        {chunksOverLimit.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
            <p className="text-[9px] font-black text-red-600">
              {chunksOverLimit.length} đoạn vượt {tokenLimit} tokens
            </p>
          </div>
        )}
      </div>

      {errors.strategy ? (
        <p className="text-xs text-destructive">{errors.strategy.message}</p>
      ) : null}
      {error ? <ErrorAlert message={getAiErrorMessage(error)} /> : null}

      <div className="pt-2">
        <Button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-blue-200 text-xs font-black tracking-widest text-blue-600 uppercase hover:bg-blue-50"
          disabled={isSubmitting}
          type="submit"
          variant="outline"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Đang áp dụng...</span>
            </>
          ) : (
            "Áp dụng"
          )}
        </Button>
      </div>
    </form>
  )
}

export function ChunkListPanel({
  activeChunkIndex,
  onSelect,
  wizard,
}: StepProps & {
  activeChunkIndex: number | undefined
  onSelect: (chunkIndex: number) => void
}) {
  if (wizard.chunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-400">
        <FileText className="h-8 w-8 opacity-20" />
        <p className="text-xs font-bold italic">
          Nhấn "Áp dụng" để xem bản nháp phân đoạn.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          Bản đồ đoạn
        </span>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-600">
          {wizard.chunks.length} đoạn
        </span>
      </div>

      <div className="max-h-128 space-y-2 overflow-y-auto pr-1">
        {wizard.chunks.map((chunk: Chunk) => {
          const idx = chunk.chunk_index
          const text = chunk.content
          const tokens = estimateTokens(text)
          const color = CHUNK_COLORS[idx % CHUNK_COLORS.length]
          const isActive = idx === activeChunkIndex

          return (
            <button
              className={cn(
                "w-full cursor-pointer rounded-xl border p-3 text-left transition-all",
                isActive
                  ? `${color.bg} ${color.border} ring-2 ${color.ring} shadow-sm`
                  : "border-slate-100 bg-slate-50/40 hover:border-slate-200"
              )}
              key={idx}
              onClick={() => onSelect(idx)}
              type="button"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className={cn(
                    "text-[9px] font-black tracking-widest uppercase",
                    isActive ? color.label : "text-slate-500"
                  )}
                >
                  #{idx + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge
                    className={REGION_TYPE_BADGE_CLASSNAME[chunk.region_type]}
                    variant="outline"
                  >
                    {REGION_TYPE_LABELS[chunk.region_type]}
                  </Badge>
                  <span className="text-[8px] font-bold text-slate-400">
                    ~{tokens}tk
                  </span>
                </div>
              </div>
              <p
                className={cn(
                  "line-clamp-2 text-xs leading-snug font-medium text-slate-600",
                  isActive ? "text-slate-800" : "text-slate-500"
                )}
              >
                {text}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ChunkEditorPanel({
  chunk,
  wizard,
}: {
  chunk: Chunk | undefined
  wizard: ReturnType<typeof useIngestWizard>
}) {
  const [draft, setDraft] = useState(chunk?.content ?? "")
  const isDirty = chunk != null && draft !== chunk.content

  if (!chunk) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
          <FileText className="h-7 w-7 text-blue-600 opacity-30" />
        </div>
        <p className="text-xs font-bold italic">
          Chọn một đoạn ở danh sách bên phải để xem và chỉnh sửa nội dung.
        </p>
      </div>
    )
  }

  const idx = chunk.chunk_index
  const color = CHUNK_COLORS[idx % CHUNK_COLORS.length]
  const tokens = estimateTokens(draft)

  return (
    <div className="flex flex-col space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-black tracking-widest uppercase",
              color.label
            )}
          >
            Nội dung đoạn #{idx + 1}
          </span>
          <Badge
            className={REGION_TYPE_BADGE_CLASSNAME[chunk.region_type]}
            variant="outline"
          >
            {REGION_TYPE_LABELS[chunk.region_type]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
            {draft.length} ký tự
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-bold",
              color.badge
            )}
          >
            ~{tokens} tokens
          </span>
        </div>
      </div>

      {/* Editor Textarea */}
      <Textarea
        className="min-h-80 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs leading-relaxed text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
        onChange={(event) => setDraft(event.target.value)}
        value={draft}
      />

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-[10px] font-medium text-slate-400">
          {isDirty ? "Có thay đổi chưa lưu" : "Nội dung gốc"}
        </span>
        <Button
          className="h-10 rounded-xl bg-blue-600 text-xs font-black tracking-widest text-white uppercase shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-40"
          disabled={!isDirty}
          onClick={() => wizard.updateChunkContent(chunk.chunk_index, draft)}
          type="button"
        >
          Lưu thay đổi
        </Button>
      </div>
    </div>
  )
}

export function ChunkingConfirmActions({ wizard }: StepProps) {
  const isSubmitting = wizard.embedMutation.isPending
  const error = wizard.embedMutation.error

  if (wizard.chunks.length === 0) return null

  return (
    <div className="space-y-4 pt-2">
      {error ? <ErrorAlert message={getAiErrorMessage(error)} /> : null}
      <StepActions>
        <Button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 sm:w-auto sm:px-6"
          disabled={isSubmitting}
          onClick={wizard.runEmbed}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <span>Bắt đầu embedding</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </StepActions>
    </div>
  )
}

export function EmbeddingStep({
  onFinish,
  wizard,
}: StepProps & { onFinish: () => void }) {
  const { percent, state } = wizard.embeddingProgress
  const isTerminal = state === "SUCCESS" || state === "FAILURE"

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between text-xs font-black tracking-widest uppercase">
          <span className="flex items-center gap-2 text-slate-700">
            {state === "connecting"
              ? "Đang kết nối..."
              : state === "PROGRESS"
                ? "Đang xử lý embedding..."
                : state === "SUCCESS"
                  ? "Hoàn tất embedding"
                  : state === "FAILURE"
                    ? "Embedding thất bại"
                    : "Mất kết nối theo dõi tiến độ"}
          </span>
          <span className="text-sm font-extrabold text-blue-600">
            {percent}%
          </span>
        </div>
        <ProgressBar value={percent} />
      </div>

      {state === "error" ? (
        <ErrorAlert message="Không thể theo dõi tiến độ trực tiếp, nhưng yêu cầu embedding đã được gửi và đang xử lý trong nền." />
      ) : null}
      {state === "FAILURE" ? (
        <ErrorAlert message="Quá trình embedding thất bại. Hãy thử lại từ bước chia đoạn." />
      ) : null}
      {!isTerminal ? (
        <p className="text-center text-xs font-medium text-slate-500">
          Rời khỏi trang này không huỷ tiến trình — việc embedding vẫn tiếp tục
          chạy ở máy chủ.
        </p>
      ) : null}

      <StepActions>
        <Button
          className="h-11 rounded-xl bg-blue-600 text-xs font-black tracking-widest text-white uppercase shadow-md shadow-blue-200 hover:bg-blue-700"
          disabled={!isTerminal}
          onClick={onFinish}
        >
          Quay lại hàng đợi
        </Button>
      </StepActions>
    </div>
  )
}
