export const ingestionKeys = {
  all: ["ingestion"] as const,
  job: (documentId: string) =>
    [...ingestionKeys.all, "job", documentId] as const,
}
