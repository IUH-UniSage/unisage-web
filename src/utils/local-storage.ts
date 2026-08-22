export const STORAGE_KEYS = {
  accessToken: "unisage.access_token",
  refreshToken: "unisage.refresh_token",
  locale: "unisage.locale",
  theme: "unisage.theme",
} as const

export const storage = {
  get<T>(key: string, fallback?: T): T | null {
    if (typeof window === "undefined") {
      return fallback ?? null
    }

    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) {
        return fallback ?? null
      }
      return JSON.parse(raw) as T
    } catch {
      return fallback ?? null
    }
  },

  set(key: string, value: unknown): void {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable (private mode, quota exceeded) - ignore
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") {
      return
    }

    window.localStorage.removeItem(key)
  },
}
