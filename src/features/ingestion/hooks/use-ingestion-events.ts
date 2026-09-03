import { useEffect, useRef, useState } from "react"

import {
  ingestionEventSchema,
  type IngestionEvent,
} from "@/features/ingestion/schemas/ingestion-schemas"
import { aiHttpClient } from "@/lib/ai-client"

const RECONNECT_BASE_MS = 1000
const RECONNECT_MAX_MS = 15_000

// Confirmed live (Task 8 spike): backend-java sets `accessToken` as an
// httpOnly cookie at login, api-gateway's AuthenticationFilter (a
// GlobalFilter, applies to the WS upgrade too) reads it and injects the
// JWT-derived X-User-* headers plus X-Internal-Secret. A browser's native
// WebSocket sends matching-domain cookies automatically on the handshake,
// so this authenticates the same way any other request does - no token
// plumbing here.
function eventsWsUrl(): string {
  const base =
    aiHttpClient.defaults.baseURL ?? "http://localhost:8400/api/v1/ai"
  return `${base.replace(/^http/, "ws")}/ingestion/events`
}

export type IngestionEventsConnection = {
  /**
   * Bumps on every reconnect (not the first connect) so a consumer can
   * re-run its reconciliation sweep for events missed while disconnected.
   */
  reconnectNonce: number
}

/**
 * One WebSocket to the broadcast `/ingestion/events` channel, shared by
 * whatever screen mounts it. Auto-reconnects with capped exponential
 * backoff. Frames are zod-validated before reaching `onEvent`.
 */
export function useIngestionEvents(
  onEvent: (event: IngestionEvent) => void,
  { enabled = true }: { enabled?: boolean } = {}
): IngestionEventsConnection {
  const onEventRef = useRef(onEvent)
  useEffect(() => {
    onEventRef.current = onEvent
  })

  const [reconnectNonce, setReconnectNonce] = useState(0)

  useEffect(() => {
    if (!enabled) return

    let socket: WebSocket | null = null
    let reconnectTimer: number | undefined
    let attempt = 0
    let hasConnectedOnce = false
    let closedByUnmount = false

    const connect = () => {
      socket = new WebSocket(eventsWsUrl())

      socket.onopen = () => {
        attempt = 0
        if (hasConnectedOnce) setReconnectNonce((nonce) => nonce + 1)
        hasConnectedOnce = true
      }

      socket.onmessage = (message: MessageEvent<string>) => {
        let parsed: unknown
        try {
          parsed = JSON.parse(message.data)
        } catch {
          return
        }
        const result = ingestionEventSchema.safeParse(parsed)
        if (result.success) onEventRef.current(result.data)
      }

      socket.onclose = () => {
        if (closedByUnmount) return
        const delay = Math.min(
          RECONNECT_BASE_MS * 2 ** attempt,
          RECONNECT_MAX_MS
        )
        attempt += 1
        reconnectTimer = window.setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      closedByUnmount = true
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [enabled])

  return { reconnectNonce }
}
