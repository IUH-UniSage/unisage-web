import type { useIngestWizard } from "@/features/ingestion/hooks/use-ingest-wizard"

export type StepProps = { wizard: ReturnType<typeof useIngestWizard> }

/** Rough char-count → token estimate, good enough for the wizard's UI hints. */
export const estimateTokens = (text: string) => Math.ceil(text.length / 4)
