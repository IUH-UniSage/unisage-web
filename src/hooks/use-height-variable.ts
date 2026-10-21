import { type RefObject, useEffect } from "react"

/**
 * Writes the height of `sourceRef` to the CSS custom property `name` on
 * `targetRef`, kept current as it resizes - for content that must leave room
 * under an element floating over it (a chat composer over the messages).
 */
export function useHeightVariable(
  sourceRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  name: `--${string}`
) {
  useEffect(() => {
    const source = sourceRef.current
    const target = targetRef.current
    if (!source || !target) return

    const observer = new ResizeObserver(() => {
      target.style.setProperty(name, `${source.offsetHeight}px`)
    })
    observer.observe(source)
    return () => {
      observer.disconnect()
      target.style.removeProperty(name)
    }
  }, [sourceRef, targetRef, name])
}
