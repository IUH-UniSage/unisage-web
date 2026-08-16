import { HttpResponse, http } from "msw"
import { setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"

import { AUTH_SESSION_REFRESHED_EVENT, httpClient } from "@/lib/axios-client"

const server = setupServer()
const defaultAdapter = httpClient.defaults.adapter

beforeAll(() => {
  httpClient.defaults.adapter = "fetch"
  server.listen({ onUnhandledRequest: "error" })
})
afterEach(() => server.resetHandlers())
afterAll(() => {
  httpClient.defaults.adapter = defaultAdapter
  server.close()
})

describe("HTTP client authentication recovery", () => {
  it("When a request is refreshed, then the new session is published", async () => {
    let protectedRequestCount = 0
    let refreshedPayload: unknown
    const refreshResponse = {
      code: 1000,
      data: { userId: "a76398bd-c8ac-4fa8-803e-0a91e207347c" },
      message: "Successful",
    }
    window.addEventListener(
      AUTH_SESSION_REFRESHED_EVENT,
      (event) => {
        refreshedPayload = (event as CustomEvent).detail
      },
      { once: true }
    )
    server.use(
      http.get("*/protected", () => {
        protectedRequestCount += 1
        return protectedRequestCount === 1
          ? HttpResponse.json({}, { status: 401 })
          : HttpResponse.json({ ok: true })
      }),
      http.post("*/auth/refresh", () => HttpResponse.json(refreshResponse))
    )

    await httpClient.get("/protected")

    expect(refreshedPayload).toEqual(refreshResponse)
    expect(protectedRequestCount).toBe(2)
  })
})
