import { Badge } from "@/components/ui/badge"
import type { RegionType } from "@/features/ingestion/schemas/ingestion-schemas"

const REGION_TYPE_LABELS: Record<RegionType, string> = {
  excel_row: "Dòng Excel",
  table: "Bảng",
  text: "Văn bản",
}

const REGION_TYPE_BADGE_CLASSNAME: Record<RegionType, string> = {
  excel_row: "border-transparent bg-sky/10 text-sky font-bold text-[9px]",
  table:
    "border-transparent bg-knowledge/10 text-knowledge font-bold text-[9px]",
  text: "border-transparent bg-muted text-foreground font-bold text-[9px]",
}

export function RegionBadge({ type }: { type: RegionType }) {
  return (
    <Badge className={REGION_TYPE_BADGE_CLASSNAME[type]} variant="outline">
      {REGION_TYPE_LABELS[type]}
    </Badge>
  )
}
