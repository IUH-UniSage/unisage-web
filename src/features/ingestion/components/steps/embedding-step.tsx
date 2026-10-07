import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import {
  ErrorAlert,
  StepActions,
} from "@/features/ingestion/components/steps/step-primitives"
import { type StepProps } from "@/features/ingestion/components/steps/shared"

const STATE_LABELS: Record<string, string> = {
  connecting: "Đang kết nối...",
  PROGRESS: "Đang xử lý embedding...",
  SUCCESS: "Hoàn tất embedding",
  FAILURE: "Embedding thất bại",
  error: "Mất kết nối theo dõi tiến độ",
}

export function EmbeddingStep({
  onFinish,
  wizard,
}: StepProps & { onFinish: () => void }) {
  const { percent, state } = wizard.embeddingProgress
  const isTerminal = state === "SUCCESS" || state === "FAILURE"

  return (
    <div
      {...tourAnchor(TOUR_ANCHORS.ingestEmbedding)}
      className="mx-auto max-w-2xl space-y-6 py-4"
    >
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between text-xs font-black tracking-widest uppercase">
          <span className="flex items-center gap-2 text-foreground">
            {STATE_LABELS[state] ?? STATE_LABELS.error}
          </span>
          <span className="text-sm font-extrabold text-primary">
            {percent}%
          </span>
        </div>
        <ProgressBar value={percent} />
      </div>

      {state === "error" ? (
        <ErrorAlert message="Không thể theo dõi tiến độ trực tiếp, nhưng yêu cầu embedding đã được gửi và đang xử lý trong nền." />
      ) : null}
      {state === "FAILURE" ? (
        <ErrorAlert
          message={
            wizard.embeddingProgress.message ??
            "Quá trình embedding thất bại. Hãy thử lại từ bước chia đoạn."
          }
        />
      ) : null}
      {!isTerminal ? (
        <p className="text-center text-xs font-medium text-muted-foreground">
          Rời khỏi trang này không huỷ tiến trình — việc embedding vẫn tiếp tục
          chạy ở máy chủ.
        </p>
      ) : null}

      <StepActions>
        <Button
          className="h-11 rounded-xl bg-primary text-xs font-black tracking-widest text-primary-foreground uppercase shadow-md shadow-primary/20 hover:bg-primary/90"
          disabled={!isTerminal}
          onClick={onFinish}
        >
          Quay lại hàng đợi
        </Button>
      </StepActions>
    </div>
  )
}
