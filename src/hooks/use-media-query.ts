import { useSyncExternalStore } from "react"

/**
 * `window.matchMedia(query).matches`, kept in sync with the viewport. False during
 * SSR / before mount and in environments without matchMedia (jsdom).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {}
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    () =>
      typeof window !== "undefined" && !!window.matchMedia
        ? window.matchMedia(query).matches
        : false,
    () => false
  )
}

/** Tailwind's `xl` breakpoint - where the chat page lays its columns out side by side. */
export const DESKTOP_MEDIA_QUERY = "(min-width: 1280px)"
