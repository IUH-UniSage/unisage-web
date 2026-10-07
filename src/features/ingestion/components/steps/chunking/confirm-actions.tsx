import { ChevronRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import {
  ErrorAlert,
  StepActions,
} from "@/features/ingestion/components/steps/step-primitives"
import { type StepProps } from "@/features/ingestion/components/steps/shared"
import { getErrorMessage } from "@/utils/error-handler"

export function ChunkingConfirmActions({ wizard }: StepProps) {
  const isSubmitting = wizard.embedMutation.isPending
  const error = wizard.embedMutation.error

  if (wizard.chunks.length === 0) return null

  return (
    <div {...tourAnchor(TOUR_ANCHORS.ingestConfirm)} className="space-y-4 pt-2">
      {error ? <ErrorAlert message={getErrorMessage(error)} /> : null}
      <StepActions>
        <Button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-xs font-black tracking-widest text-primary-foreground uppercase shadow-lg shadow-primary/20 hover:bg-primary/90 sm:w-auto sm:px-6"
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
