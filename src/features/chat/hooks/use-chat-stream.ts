import { useRef } from "react"

import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { aiHttpClient } from "@/lib/ai-client"
import { ApiResponseError } from "@/utils/api-response"
import { STORAGE_KEYS, storage } from "@/utils/local-storage"

export type ChatStreamErrorPayload = {
  code: string
  message: string
  retryable: boolean
}

// `event: warning` - something an AI admin should fix that did not stop the
// turn (e.g. web search failed, so the answer went on without the university
// website). The agent only sends it to AI admins.
export type ChatStreamWarningPayload = {
  code: string
  message: string
}

type ChatStreamCallbacks = {
  onChunk?: (token: string, fullText: string) => void
  onDone?: (fullText: string) => void
  onError?: (error: Error) => void
  /**
   * `event: error` - the backend's own SSE error contract (`code`/`message`/
   * `retryable`), always immediately followed by `event: done`. Fired
   * instead of `onDone` (never both) so the caller can mark the message
   * errored without a `done` handler also treating the turn as a normal
   * success. `fullText` is whatever streamed before the failure - kept, not
   * discarded.
   */
  onStreamError?: (payload: ChatStreamErrorPayload, fullText: string) => void
  onWarning?: (payload: ChatStreamWarningPayload) => void
}

type ChatStreamInput = {
  conversationId: string
  message: string
}

type ParsedSseEvent = {
  data?: string
  event?: string
}

function parseSseEvent(rawEvent: string): ParsedSseEvent {
  let event: string | undefined
  const dataLines: string[] = []

  for (const line of rawEvent.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim()
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trim())
    }
  }

  return { data: dataLines.length ? dataLines.join("\n") : undefined, event }
}

async function readStreamErrorMessage(response: Response): Promise<Error> {
  try {
    const body: unknown = await response.json()
    if (
      body &&
      typeof body === "object" &&
      "code" in body &&
      "message" in body
    ) {
      const payload = body as { code: number; message: string }
      const error = new ApiResponseError(payload)
      // Keep the backend's own message rather than ApiResponseError's generic
      // per-code text: the agent already tailors it to the caller (a plain
      // message plus a reference code for students/guests, the technical
      // cause for AI admins).
      if (typeof payload.message === "string" && payload.message) {
        error.message = payload.message
      }
      return error
    }
  } catch {
    // Response body wasn't the usual {code, message} envelope - fall through.
  }
  return new Error(`Yêu cầu thất bại (mã trạng thái ${response.status}).`)
}

/**
 * Consumes `POST /chat/stream` (unisage-agent, via the gateway's
 * `python-ai-agent-route`): an SSE response emitting `event: token` per
 * generated token, an optional `event: error` (`code`/`message`/`retryable`)
 * immediately before a terminal `event: done` when the turn failed. Uses a
 * raw `fetch` (not axios/EventSource) because the response body needs to be
 * read incrementally as a stream - see `useChatStream` in lisa-visa-web for
 * the same rationale.
 *
 * Auth is the browser's httpOnly session cookie (`credentials: "include"`),
 * same as every other request in this app - no manual bearer token.
 */
export function useChatStream() {
  const abortControllerRef = useRef<AbortController | null>(null)

  const stream = async (
    input: ChatStreamInput,
    callbacks: ChatStreamCallbacks
  ): Promise<void> => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    const locale = storage.get<string>(STORAGE_KEYS.locale, "vi")
    const baseURL =
      aiHttpClient.defaults.baseURL ?? "http://localhost:8400/api/v1/ai"

    let response: Response
    try {
      response = await fetch(`${baseURL}${API_ENDPOINTS.aiChat.stream}`, {
        body: JSON.stringify({
          conversation_id: input.conversationId,
          message: input.message,
        }),
        credentials: "include",
        headers: {
          "Accept-Language": locale ?? "vi",
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      callbacks.onError?.(
        error instanceof Error ? error : new Error("Không thể kết nối máy chủ.")
      )
      return
    }

    if (!response.ok || !response.body) {
      callbacks.onError?.(await readStreamErrorMessage(response))
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let fullText = ""
    // `event: error` (if any) always arrives immediately before the
    // terminal `event: done` - once seen, `done` must not also fire
    // `onDone` (that would tell the caller this turn succeeded).
    let sawError = false

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        let boundary = buffer.indexOf("\n\n")
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)

          const { data, event } = parseSseEvent(rawEvent)
          if (event === "token" && data !== undefined) {
            const token = JSON.parse(data) as string
            fullText += token
            callbacks.onChunk?.(token, fullText)
          } else if (event === "error" && data !== undefined) {
            sawError = true
            const payload = JSON.parse(data) as ChatStreamErrorPayload
            callbacks.onStreamError?.(payload, fullText)
          } else if (event === "warning" && data !== undefined) {
            callbacks.onWarning?.(JSON.parse(data) as ChatStreamWarningPayload)
          } else if (event === "done") {
            if (!sawError) callbacks.onDone?.(fullText)
          }

          boundary = buffer.indexOf("\n\n")
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      callbacks.onError?.(
        error instanceof Error
          ? error
          : new Error("Mất kết nối khi đang nhận phản hồi.")
      )
    }
  }

  const abort = () => {
    abortControllerRef.current?.abort()
  }

  return { abort, stream }
}
