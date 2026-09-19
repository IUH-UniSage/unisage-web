import { ChevronRight, FileText, Loader2 } from "lucide-react"

import { DocumentFilePreview } from "@/components/shared/document-file-preview"
import { Button } from "@/components/ui/button"
import type { Document } from "@/features/documents/schemas/document-schemas"
import {
  ErrorAlert,
  StepActions,
} from "@/features/ingestion/components/steps/step-primitives"
import {
  estimateTokens,
  type StepProps,
} from "@/features/ingestion/components/steps/shared"
import { getErrorMessage } from "@/utils/error-handler"

type PreviewStepProps = StepProps & { document: Document }

export function PreviewStep({ document, wizard }: PreviewStepProps) {
  const isLoading = wizard.previewMutation.isPending
  const error = wizard.previewMutation.error
  // A scanned PDF extracts to whitespace only, which is still a "non-empty" string.
  const hasText = Boolean(wizard.previewText?.trim())
  const hasNoText = wizard.previewText !== undefined && !hasText

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="text-[11px] font-black tracking-widest text-foreground uppercase">
            Nội dung xem trước
          </h3>
        </div>
        {hasText && wizard.previewText ? (
          <span className="text-[10px] font-bold text-muted-foreground">
            {wizard.previewText.length} ký tự (~
            {estimateTokens(wizard.previewText)} tokens)
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-muted/50 py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs font-bold">Đang tải nội dung tài liệu...</p>
        </div>
      ) : error ? (
        <ErrorAlert message={getErrorMessage(error)} />
      ) : document.fileUrl ? (
        <DocumentFilePreview
          fileType={document.fileType}
          fileUrl={document.fileUrl}
          title={document.title}
        />
      ) : (
        <div className="max-h-112 overflow-y-auto rounded-3xl border border-border bg-card p-5 text-sm leading-relaxed font-medium whitespace-pre-wrap text-foreground shadow-sm">
          {wizard.previewText}
        </div>
      )}

      {!isLoading && !error && hasNoText ? (
        <ErrorAlert message="Không trích xuất được văn bản từ tài liệu này. Có thể đây là bản scan (chỉ có ảnh), hệ thống chưa hỗ trợ OCR. Hãy tải lên bản có thể chọn chữ." />
      ) : null}

      <StepActions>
        <Button
          className="flex h-11 items-center gap-2 rounded-xl bg-primary text-xs font-black tracking-widest text-primary-foreground uppercase shadow-md shadow-primary/20 hover:bg-primary/90"
          disabled={isLoading || !hasText}
          onClick={wizard.goToChunking}
        >
          <span>Tiếp tục</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </StepActions>
    </div>
  )
}
