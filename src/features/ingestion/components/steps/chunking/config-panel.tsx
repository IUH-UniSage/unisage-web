import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Settings2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  buildChunkingParams,
  STRATEGIES,
  STRATEGY_DESCRIPTIONS,
} from "@/features/ingestion/components/steps/chunking/strategy-config"
import { StrategyFields } from "@/features/ingestion/components/steps/chunking/strategy-fields"
import { ErrorAlert } from "@/features/ingestion/components/steps/step-primitives"
import { type StepProps } from "@/features/ingestion/components/steps/shared"
import {
  chunkingFormSchema,
  type ChunkingFormValues,
} from "@/features/ingestion/schemas/ingestion-schemas"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/utils/error-handler"

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

  const submit = (values: ChunkingFormValues) => {
    wizard.runChunk(values.strategy, buildChunkingParams(values))
  }

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={(event) => void handleSubmit(submit)(event)}
    >
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Settings2 className="h-4 w-4" />
        </div>
        <h3 className="text-[11px] font-black tracking-widest text-foreground uppercase">
          Chiến lược phân đoạn
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {STRATEGIES.map((option) => (
          <button
            className={cn(
              "cursor-pointer rounded-xl border px-1.5 py-2 text-[9px] font-black tracking-widest transition-all",
              strategy === option.id
                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border-border bg-muted text-muted-foreground hover:border-muted-foreground/40"
            )}
            key={option.id}
            onClick={() => setValue("strategy", option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="text-[10px] font-bold text-muted-foreground">
        {STRATEGY_DESCRIPTIONS[strategy]}
      </p>

      <div className="space-y-4 pt-1">
        <StrategyFields register={register} strategy={strategy} watch={watch} />
      </div>

      {errors.strategy ? (
        <p className="text-xs text-destructive">{errors.strategy.message}</p>
      ) : null}
      {error ? <ErrorAlert message={getErrorMessage(error)} /> : null}

      <div className="pt-2">
        <Button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-primary/30 text-xs font-black tracking-widest text-primary uppercase hover:bg-primary/10"
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
