import { Loader2, Save } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DetailPageActionsProps = {
  /** Extra actions (reprocess, edit, ...) rendered after "Quay lại". */
  children?: ReactNode
  className?: string
  onBack: () => void
}

/** Action row of a full-page detail screen; rendered in the header and again at the page foot. */
export function DetailPageActions({
  children,
  className,
  onBack,
}: DetailPageActionsProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-end gap-3", className)}
    >
      <Button onClick={onBack} type="button" variant="outline">
        Quay lại
      </Button>
      {children}
    </div>
  )
}

type FormPageActionsProps = {
  className?: string
  /** `id` of the form to submit when this row sits outside the `<form>` (the header). */
  formId?: string
  isBusy: boolean
  onCancel: () => void
  submitLabel: string
}

/** Cancel + save row of a full-page create/edit screen; header and page foot share it. */
export function FormPageActions({
  className,
  formId,
  isBusy,
  onCancel,
  submitLabel,
}: FormPageActionsProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-end gap-3", className)}
    >
      <Button
        disabled={isBusy}
        onClick={onCancel}
        type="button"
        variant="outline"
      >
        Hủy
      </Button>
      <Button disabled={isBusy} form={formId} type="submit">
        {isBusy ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang lưu...
          </>
        ) : (
          <>
            <Save className="mr-2 size-4" />
            {submitLabel}
          </>
        )}
      </Button>
    </div>
  )
}
