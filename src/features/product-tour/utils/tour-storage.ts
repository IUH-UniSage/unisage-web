import { z } from "zod"

import { STORAGE_KEYS, storage } from "@/utils/local-storage"

const seenToursSchema = z.array(z.string())

// Per account, so a second person signing in on the same browser still gets
// their own first-login walkthrough.
export function overviewTourKey(audience: string, userId: string): string {
  return `overview:${audience}:${userId}`
}

function readSeenTours(): string[] {
  return (
    storage.getValid(STORAGE_KEYS.productTourSeen, seenToursSchema, []) ?? []
  )
}

export function hasSeenTour(tourKey: string): boolean {
  return readSeenTours().includes(tourKey)
}

// Storage can be unavailable (private mode, blocked site data). Failing to
// remember a tour only means it shows again next visit, so swallow it.
export function markTourSeen(tourKey: string): void {
  const seen = new Set(readSeenTours())
  seen.add(tourKey)

  try {
    storage.set(STORAGE_KEYS.productTourSeen, [...seen])
  } catch {
    return
  }
}
