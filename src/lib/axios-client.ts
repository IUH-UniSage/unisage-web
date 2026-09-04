import axios from "axios"
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios"

import { STORAGE_KEYS, storage } from "@/utils/local-storage"

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081/api/v1"

const refreshClient = axios.create({
  baseURL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean
}

export const AUTH_SESSION_EXPIRED_EVENT = "unisage:auth-session-expired"
export const AUTH_SESSION_REFRESHED_EVENT = "unisage:auth-session-refreshed"

// Shared across every client this factory creates - the refresh cookie and
// the Java /auth/refresh endpoint are the same regardless of which backend
// (Java or the AI agent, via aiHttpClient) triggered the 401, so only one
// refresh should ever be in flight at a time.
let refreshRequest: Promise<unknown> | null = null

export function clearLegacyAuthentication(): void {
  storage.remove(STORAGE_KEYS.accessToken)
  storage.remove(STORAGE_KEYS.refreshToken)
}

/**
 * Creates an axios instance wired with the app's shared cross-cutting
 * concerns: `Accept-Language` on every request, and 401 -> refresh-token ->
 * retry-once on every response, reusing one in-flight refresh call across
 * whichever client (Java or AI agent) triggered it.
 */
export function createAuthenticatedClient(
  clientBaseURL: string
): AxiosInstance {
  const client = axios.create({
    baseURL: clientBaseURL,
    timeout: 30_000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  })

  client.interceptors.request.use((config) => {
    const locale = storage.get<string>(STORAGE_KEYS.locale, "vi")

    config.headers["Accept-Language"] = locale

    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || !error.config) {
        return Promise.reject(error)
      }

      const config = error.config as RetryableRequestConfig
      const isAuthRequest = config.url?.includes("/auth/") ?? false

      if (
        error.response?.status !== 401 ||
        config._authRetry ||
        isAuthRequest
      ) {
        return Promise.reject(error)
      }

      config._authRetry = true

      try {
        refreshRequest ??= refreshClient
          .post("/auth/refresh")
          .then((response) => {
            window.dispatchEvent(
              new CustomEvent(AUTH_SESSION_REFRESHED_EVENT, {
                detail: response.data,
              })
            )
            return response
          })
          .finally(() => {
            refreshRequest = null
          })

        await refreshRequest
        return client.request(config)
      } catch (refreshError) {
        window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
        return Promise.reject(refreshError)
      }
    }
  )

  return client
}

export const httpClient = createAuthenticatedClient(baseURL)
