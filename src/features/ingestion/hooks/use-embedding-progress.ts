import { useEffect, useState } from "react"

// Confirmed live (Task 8 spike, not just read from code): backend-java sets
// `accessToken` as an httpOnly cookie at login, api-gateway's
// AuthenticationFilter (a GlobalFilter, applies to every route including
// this WS one) falls back to that cookie when there's no Authorization
// header, and a browser's native WebSocket sends matching-domain cookies
// automatically on the handshake - so this authenticates the same way any
// other request through the Gateway does, with zero extra code here.

export type EmbeddingProgressState =
  "connecting" | "PROGRESS" | "SUCCESS" | "FAILURE" | "error"

export type EmbeddingProgress = {
  percent: number
  state: EmbeddingProgressState
}

type ProgressFrame = {
  percent: number
  state: "PROGRESS" | "SUCCESS" | "FAILURE"
}

function isProgressFrame(value: unknown): value is ProgressFrame {
  return (
    typeof value === "object" &&
    value !== null &&
    "percent" in value &&
    "state" in value &&
    typeof (value as ProgressFrame).percent === "number" &&
    typeof (value as ProgressFrame).state === "string"
  )
}

const TERMINAL_STATES: ReadonlySet<string> = new Set(["SUCCESS", "FAILURE"])
const CONNECTING: EmbeddingProgress = { percent: 0, state: "connecting" }

const aiApiBaseURL =
  import.meta.env.VITE_AI_API_BASE_URL ?? "http://localhost:8400/api/v1/ai"
const wsBaseURL = aiApiBaseURL.replace(/^http/, "ws")

/**
 * Opens a WebSocket to the embedding task's progress route and exposes its
 * live {percent, state}. Closes itself once a terminal frame (SUCCESS or
 * FAILURE) arrives, and on unmount - never leaves a connection open behind
 * a closed wizard.
 */
export function useEmbeddingProgress(
  taskId: string | undefined
): EmbeddingProgress {
  const [progress, setProgress] = useState<EmbeddingProgress>(CONNECTING)
  // "Adjusting state when a prop changes" (React docs) - resets synchronously
  // during render when taskId changes, instead of via a setState call inside
  // the effect body (which would cascade an extra render).
  const [trackedTaskId, setTrackedTaskId] = useState(taskId)

  if (taskId !== trackedTaskId) {
    setTrackedTaskId(taskId)
    setProgress(CONNECTING)
  }

  useEffect(() => {
    if (!taskId) return

    const socket = new WebSocket(
      `${wsBaseURL}/ingestion/embedding/${taskId}/progress`
    )

    socket.onmessage = (event: MessageEvent<string>) => {
      let parsed: unknown
      try {
        parsed = JSON.parse(event.data)
      } catch {
        return
      }

      if (!isProgressFrame(parsed)) return

      setProgress({ percent: parsed.percent, state: parsed.state })

      if (TERMINAL_STATES.has(parsed.state)) {
        socket.close()
      }
    }

    socket.onerror = () => {
      setProgress((current) =>
        TERMINAL_STATES.has(current.state)
          ? current
          : { ...current, state: "error" }
      )
    }

    return () => {
      socket.close()
    }
  }, [taskId])

  return progress
}
