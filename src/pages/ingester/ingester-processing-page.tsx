import { useNavigate } from "react-router-dom"

import { ingesterIngestWizardPath } from "@/constants/paths"
import {
  DocumentStatusSync,
  IngesterProcessingList,
  useIngesterProcessing,
} from "@/features/ingestion"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"

export function IngesterProcessingPage() {
  const navigate = useNavigate()
  const processing = useIngesterProcessing()

  return (
    <div className="space-y-6">
      <div {...tourAnchor(TOUR_ANCHORS.pageHeader)}>
        <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          Vận hành tri thức
        </p>
        <h1 className="mt-2 text-2xl font-bold md:text-3xl">
          Hàng đợi xử lý tài liệu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Xem trước, chia đoạn và bắt đầu embedding cho từng tài liệu.
        </p>
      </div>

      <IngesterProcessingList
        documents={processing.documents}
        isPending={processing.isPending}
        onOpenWizard={(document) =>
          navigate(ingesterIngestWizardPath(document.id))
        }
        onPageChange={processing.setPage}
        page={processing.page}
        totalItems={processing.totalItems}
        totalPages={processing.totalPages}
      />

      <DocumentStatusSync documents={processing.documents} />
    </div>
  )
}
