import { z } from "zod"

import { chunkSchema } from "@/features/ingestion/schemas/ingestion-schemas"

// unisage-agent wraps list endpoints as ApiResponse<PageResponse<T>>, mirroring
// backend-java's PageResponse<T> shape (`data`, `page`, `totalPages`, `limit`,
// `totalItems`) but keeping unisage-agent's own snake_case wire convention -
// see ingestion-schemas.ts's note on why these schemas don't camelCase.
export const documentChunkPageResponseSchema = z.object({
  data: z.array(chunkSchema),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  total_items: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
})

export type DocumentChunkPageResponse = z.infer<
  typeof documentChunkPageResponseSchema
>
