import { z } from "zod"

// `event: status` (unisage-agent contracts/chat-sse.md §2): what the turn is
// doing now. `stage` is a free string, not an enum, and unknown fields are
// stripped rather than rejected: a stage this client does not know yet still
// parses (and reads as "thinking") instead of leaving the old status on screen.
export const chatStatusSchema = z.object({
  stage: z.string().min(1),
  url: z.string().min(1).optional(),
})

export type ChatStatus = z.infer<typeof chatStatusSchema>
