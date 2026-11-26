import { TriangleAlert } from "lucide-react"
import { Fragment } from "react"

import type { GroundingMetadata } from "@/features/chat/schemas/grounding-schemas"

type GroundingWarningProps = {
  grounding: GroundingMetadata
  // Citation index -> the number its marker shows (sources are grouped by document).
  numbers: Record<number, number>
  onOpenSource: (index: number) => void
}

const MAX_VALUES = 5

function valueList(values: string[]) {
  const shown = values.slice(0, MAX_VALUES).join(", ")
  return values.length > MAX_VALUES ? `${shown}, ...` : shown
}

// Shown under an answer whose figures the grounding check could not match with the
// source they cite, so the user checks them against the original document.
export function GroundingWarning({
  grounding,
  numbers,
  onOpenSource,
}: GroundingWarningProps) {
  const { miscited = [], ungrounded = [] } = grounding

  return (
    <div
      className="flex gap-2 rounded-lg border border-caution-foreground/30 bg-caution px-3 py-2 text-sm text-caution-foreground"
      role="note"
    >
      <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-1">
        {ungrounded.length ? (
          <p>
            Con số {valueList(ungrounded)} không tìm thấy trong tài liệu được
            trích dẫn. Vui lòng đối chiếu với văn bản gốc trước khi sử dụng.
          </p>
        ) : null}
        {miscited.map((item) => (
          <p key={item.value}>
            Con số {item.value} không có trong nguồn được trích mà nằm ở{" "}
            {item.sources.map((index, position) => (
              <Fragment key={index}>
                {position ? ", " : null}
                <button
                  className="font-medium underline underline-offset-2"
                  onClick={() => onOpenSource(index)}
                  type="button"
                >
                  nguồn {numbers[index] ?? index}
                </button>
              </Fragment>
            ))}
            . Vui lòng mở nguồn để đối chiếu đúng dòng, đúng khóa trước khi sử
            dụng.
          </p>
        ))}
      </div>
    </div>
  )
}
