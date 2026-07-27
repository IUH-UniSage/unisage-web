import type { ZodType } from "zod"

const APP_PREFIX = "unisage_"

export const STORAGE_KEYS = {
  accessToken: `${APP_PREFIX}access_token`,
  locale: `${APP_PREFIX}locale`,
  refreshToken: `${APP_PREFIX}refresh_token`,
  theme: `${APP_PREFIX}theme`,
  userProfile: `${APP_PREFIX}user_profile`,
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

export const storage = {
  clear(): void {
    if (typeof window === "undefined") return

    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(APP_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key))
  },

  get<T>(key: StorageKey, defaultValue?: T): T | null {
    if (typeof window === "undefined") return defaultValue ?? null

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) return defaultValue ?? null

      try {
        return JSON.parse(item) as T
      } catch {
        return item as T
      }
    } catch {
      return defaultValue ?? null
    }
  },

  getValid<T>(key: StorageKey, schema: ZodType<T>, defaultValue?: T): T | null {
    const result = schema.safeParse(storage.get(key))

    if (result.success) return result.data

    storage.remove(key)
    return defaultValue ?? null
  },

  remove(key: StorageKey): void {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(key)
  },

  set<T>(key: StorageKey, value: T): void {
    if (typeof window === "undefined") return

    const serialized = typeof value === "string" ? value : JSON.stringify(value)
    window.localStorage.setItem(key, serialized)
  },
}
