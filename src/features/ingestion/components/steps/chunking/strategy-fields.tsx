import type { UseFormRegister, UseFormWatch } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { STRATEGY_DEFAULTS } from "@/features/ingestion/components/steps/chunking/strategy-config"
import type {
  ChunkingFormValues,
  ChunkingStrategyName,
} from "@/features/ingestion/schemas/ingestion-schemas"

type NumericField = Exclude<keyof ChunkingFormValues, "strategy">

type FieldGroupProps = {
  register: UseFormRegister<ChunkingFormValues>
  watch: UseFormWatch<ChunkingFormValues>
}

function NumberField({
  fallback,
  id,
  label,
  max,
  min = 1,
  name,
  register,
  step,
  suffix,
  watch,
}: FieldGroupProps & {
  name: NumericField
  id: string
  label: string
  fallback: number
  suffix?: string
  min?: number
  max?: number
  step?: number
}) {
  const current = watch(name) ?? fallback

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-primary">
          {current}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </div>
      <Input
        className="h-10 rounded-xl border-border bg-muted text-xs font-bold text-foreground"
        defaultValue={fallback}
        id={id}
        max={max}
        min={min}
        step={step}
        type="number"
        {...register(name, { valueAsNumber: true })}
      />
    </div>
  )
}

function ExcelRowFields({ register, watch }: FieldGroupProps) {
  return (
    <NumberField
      fallback={STRATEGY_DEFAULTS.excel_row.rows_per_chunk}
      id="chunking-rows-per-chunk"
      label="Số dòng mỗi đoạn"
      name="rowsPerChunk"
      register={register}
      suffix="dòng"
      watch={watch}
    />
  )
}

function SemanticFields({ register, watch }: FieldGroupProps) {
  const d = STRATEGY_DEFAULTS.semantic
  return (
    <div className="space-y-4">
      <NumberField
        fallback={d.target_tokens}
        id="chunking-target-tokens"
        label="Token mục tiêu"
        name="targetTokens"
        register={register}
        watch={watch}
      />
      <NumberField
        fallback={d.overlap_ratio}
        id="chunking-overlap-ratio"
        label="Tỷ lệ chồng lấn"
        max={1}
        min={0}
        name="overlapRatio"
        register={register}
        step={0.1}
        watch={watch}
      />
      <NumberField
        fallback={d.similarity_threshold}
        id="chunking-similarity-threshold"
        label="Ngưỡng tương đồng"
        max={1}
        min={0}
        name="similarityThreshold"
        register={register}
        step={0.1}
        watch={watch}
      />
    </div>
  )
}

function TokenSizeFields({
  defaults,
  register,
  watch,
}: FieldGroupProps & { defaults: { chunk_size: number; overlap: number } }) {
  return (
    <div className="space-y-4">
      <NumberField
        fallback={defaults.chunk_size}
        id="chunking-chunk-size"
        label="Kích thước đoạn"
        name="chunkSize"
        register={register}
        watch={watch}
      />
      <NumberField
        fallback={defaults.overlap}
        id="chunking-overlap"
        label="Độ chồng lấn"
        min={0}
        name="overlap"
        register={register}
        watch={watch}
      />
    </div>
  )
}

export function StrategyFields({
  register,
  strategy,
  watch,
}: FieldGroupProps & { strategy: ChunkingStrategyName }) {
  switch (strategy) {
    case "excel_row":
      return <ExcelRowFields register={register} watch={watch} />
    case "semantic":
      return <SemanticFields register={register} watch={watch} />
    default:
      return (
        <TokenSizeFields
          defaults={STRATEGY_DEFAULTS[strategy]}
          register={register}
          watch={watch}
        />
      )
  }
}
