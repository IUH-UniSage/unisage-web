import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  formatAskUserFormAnswer,
  type AskUserForm,
} from "@/features/chat/utils/ask-user-form"
import { cn } from "@/lib/utils"

// Chips read faster than a dropdown for a handful of options; beyond that a
// select keeps the form compact. Matches the "≤3 nên dùng chip" guidance
// from the design reference this was built against.
const CHIP_THRESHOLD = 3

type AskUserFormCardProps = {
  disabled?: boolean
  form: AskUserForm
  onSubmit: (message: string) => void
}

export function AskUserFormCard({
  disabled,
  form,
  onSubmit,
}: AskUserFormCardProps) {
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const isComplete = form.fields.every((field) => selections[field.field])

  const handleSubmit = () => {
    if (!isComplete) return
    setSubmitted(true)
    onSubmit(formatAskUserFormAnswer(form, selections))
  }

  const isLocked = disabled || submitted

  return (
    <div className="mt-2 space-y-4 rounded-2xl border border-border/60 bg-muted/30 p-4">
      {form.fields.map((field) => {
        const selectedId = selections[field.field]
        const useChips = field.options.length <= CHIP_THRESHOLD

        return (
          <div className="space-y-2" key={field.field}>
            <p className="text-sm font-medium text-foreground">{field.label}</p>
            {useChips ? (
              <div className="flex flex-wrap gap-2">
                {field.options.map((option) => (
                  <button
                    className={cn(
                      "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                      selectedId === option.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/60 bg-background text-foreground hover:border-primary/50",
                      isLocked && "cursor-not-allowed opacity-60"
                    )}
                    disabled={isLocked}
                    key={option.id}
                    onClick={() =>
                      setSelections((current) => ({
                        ...current,
                        [field.field]: option.id,
                      }))
                    }
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <Select
                disabled={isLocked}
                onValueChange={(value) =>
                  setSelections((current) => ({
                    ...current,
                    [field.field]: value,
                  }))
                }
                value={selectedId}
              >
                <SelectTrigger aria-label={field.label} className="w-full">
                  <SelectValue placeholder="— Chọn —" />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )
      })}

      <Button
        disabled={!isComplete || isLocked}
        onClick={handleSubmit}
        size="sm"
      >
        Gửi
      </Button>
    </div>
  )
}
