import { z } from "zod"

// Mirrors backend-java's DocumentVersionResponse (UNISAGE-86) - only PAST
// (replaced) file versions are returned by GET /documents/{id}/versions; the
// document's current live file stays on `documentSchema.fileUrl`.
export const documentVersionSchema = z.object({
  createdAt: z.string().nullish(),
  fileName: z.string().nullish(),
  fileType: z.string().nullish(),
  fileUrl: z.string().nullish(),
  id: z.uuid(),
  uploadedByName: z.string().nullish(),
  uploadedByUserId: z.uuid().nullish(),
  versionNumber: z.number().int(),
})

export type DocumentVersion = z.infer<typeof documentVersionSchema>
