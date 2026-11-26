import { z } from "zod"

// `metadata.grounding` on an ASSISTANT message (unisage-agent GroundingCheck): numbers of
// the answer that are not in the source they cite. `ungrounded` are in no source shown to
// the model; a `miscited` value is in another source (`sources`, 1-based citation indexes) -
// often the next row of the same table.
export const groundingMetadataSchema = z
  .object({
    miscited: z
      .array(
        z
          .object({
            sources: z.array(z.number().int().positive()).min(1),
            value: z.string().min(1),
          })
          .strict()
      )
      .optional(),
    schema_version: z.literal(1),
    ungrounded: z.array(z.string().min(1)).optional(),
  })
  .strict()

export type GroundingMetadata = z.infer<typeof groundingMetadataSchema>
