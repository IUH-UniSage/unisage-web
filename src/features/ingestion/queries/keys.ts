export const ingestionKeys = {
  all: ["ingestion"] as const,
  embeddingStatus: (taskId: string) =>
    [...ingestionKeys.all, "embedding-status", taskId] as const,
  job: (documentId: string) =>
    [...ingestionKeys.all, "job", documentId] as const,
}
