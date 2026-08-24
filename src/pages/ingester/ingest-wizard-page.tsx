import { useParams } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import { ROUTES } from "@/constants/paths"
import { useDocumentQuery } from "@/features/documents/queries/use-queries"
import { IngestWizardPageContent } from "@/features/ingestion"

type IngestWizardPageProps = {
  backTo?: string
}

export function IngestWizardPage({
  backTo = ROUTES.ingesterProcessing,
}: IngestWizardPageProps) {
  const { documentId } = useParams<{ documentId: string }>()
  const documentQuery = useDocumentQuery(documentId)
  const document = documentQuery.data

  if (documentQuery.isPending) {
    return (
      <div aria-label="Đang tải tài liệu" className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!document) {
    return (
      <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
        Không tìm thấy tài liệu.
      </p>
    )
  }

  return <IngestWizardPageContent backTo={backTo} document={document} />
}
