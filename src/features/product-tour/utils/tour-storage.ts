import { z } from "zod"

import { STORAGE_KEYS, storage } from "@/utils/local-storage"

const seenToursSchema = z.array(z.string())

export function workspaceIntroTourKey(workspace: string): string {
  return `intro:${workspace}`
}

// A FEATURE_REGISTRY key for list pages, or a route tour key
// ("user-form", "document-detail", ...) for detail and form screens.
export function pageTourKey(tourKey: string): string {
  return `page:${tourKey}`
}

export function dialogTourKey(tourKey: string): string {
  return `dialog:${tourKey}`
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
export function markToursSeen(tourKeys: readonly string[]): void {
  const seen = new Set(readSeenTours())
  tourKeys.forEach((key) => seen.add(key))

  try {
    storage.set(STORAGE_KEYS.productTourSeen, [...seen])
  } catch {
    return
  }
}
