import { Check } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Document } from "@/features/documents/schemas/document-schemas"
import {
  ChunkEditorPanel,
  ChunkingConfigPanel,
  ChunkingConfirmActions,
  ChunkListPanel,
  EmbeddingStep,
  ErrorAlert,
  PreviewStep,
} from "@/features/ingestion/components/ingest-wizard-steps"
import { useIngestWizard } from "@/features/ingestion/hooks/use-ingest-wizard"
import { cn } from "@/lib/utils"

type VisualStep = 1 | 2 | 3

const STEP_LABELS: Record<VisualStep, string> = {
  1: "Xem trước",
  2: "Chia đoạn",
  3: "Embedding",
}

function stepToVisualStep(step: ReturnType<typeof useIngestWizard>["step"]) {
  if (step === "preview") return 1
  if (step === "embedding") return 3
  return 2
}

function StepIndicator({ activeStep }: { activeStep: VisualStep }) {
  const steps: VisualStep[] = [1, 2, 3]

  return (
    <ol className="flex items-center gap-3 overflow-x-auto">
      {steps.map((step, index) => {
        const isDone = step < activeStep
        const isActive = step === activeStep

        return (
          <li className="flex shrink-0 items-center gap-3" key={step}>
            <div className="flex items-center gap-2">
              <span
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  step
                )}
              </span>
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                aria-hidden="true"
                className={cn(
                  "h-px w-6 shrink-0 sm:w-16",
                  isDone ? "bg-primary" : "bg-border"
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

type IngestWizardPageContentProps = {
  backTo: string
  document: Document
}

export function IngestWizardPageContent({
  backTo,
  document,
}: IngestWizardPageContentProps) {
  const navigate = useNavigate()
  const wizard = useIngestWizard(document)
  const visualStep = stepToVisualStep(wizard.step)
  const [activeChunkIndex, setActiveChunkIndex] = useState<number>()

  const goToQueue = () => navigate(backTo)

  const activeChunk =
    wizard.chunks.find((chunk) => chunk.chunk_index === activeChunkIndex) ??
    wizard.chunks[0]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          Vận hành tri thức
        </p>
        <h1 className="mt-2 truncate text-2xl font-bold md:text-3xl">
          Xử lý nạp liệu — {document.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Xem trước nội dung, chia đoạn và bắt đầu embedding cho tài liệu này.
        </p>
      </div>

      <Card className="border bg-card shadow-none">
        <CardHeader className="border-b pb-6">
          <StepIndicator activeStep={visualStep} />
          <CardTitle className="sr-only">{STEP_LABELS[visualStep]}</CardTitle>
        </CardHeader>
        <CardContent>
          {wizard.missingDepartmentInfo ? (
            <ErrorAlert message="Tài liệu này chưa được gán phòng ban hoặc cấp độ truy cập tối thiểu, không thể xử lý nạp liệu. Hãy cập nhật tài liệu trước." />
          ) : wizard.isResuming ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Đang kiểm tra tiến trình đã lưu...
            </p>
          ) : (
            <>
              {wizard.step === "preview" ? (
                <PreviewStep wizard={wizard} />
              ) : null}
              {wizard.step === "chunking" || wizard.step === "review" ? (
                <div className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_240px]">
                    <div className="h-fit rounded-lg border bg-muted/20 p-4">
                      <ChunkingConfigPanel wizard={wizard} />
                    </div>
                    <ChunkEditorPanel
                      chunk={activeChunk}
                      key={activeChunk?.chunk_index}
                      wizard={wizard}
                    />
                    <ChunkListPanel
                      activeChunkIndex={activeChunk?.chunk_index}
                      onSelect={setActiveChunkIndex}
                      wizard={wizard}
                    />
                  </div>
                  <ChunkingConfirmActions wizard={wizard} />
                </div>
              ) : null}
              {wizard.step === "embedding" ? (
                <EmbeddingStep onFinish={goToQueue} wizard={wizard} />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
