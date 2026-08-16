import axios from "axios"
import type { InternalAxiosRequestConfig } from "axios"

import { STORAGE_KEYS, storage } from "@/utils/local-storage"

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1"

export const httpClient = axios.create({
  baseURL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

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

let refreshRequest: Promise<unknown> | null = null

export function clearLegacyAuthentication(): void {
  storage.remove(STORAGE_KEYS.accessToken)
  storage.remove(STORAGE_KEYS.refreshToken)
}

httpClient.interceptors.request.use((config) => {
  const locale = storage.get<string>(STORAGE_KEYS.locale, "vi")

  config.headers["Accept-Language"] = locale

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error)
    }

    const config = error.config as RetryableRequestConfig
    const isAuthRequest = config.url?.includes("/auth/") ?? false

    if (error.response?.status !== 401 || config._authRetry || isAuthRequest) {
      return Promise.reject(error)
    }

    config._authRetry = true

    try {
      refreshRequest ??= refreshClient.post("/auth/refresh").finally(() => {
        refreshRequest = null
      })

      await refreshRequest
      return httpClient.request(config)
    } catch (refreshError) {
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
      return Promise.reject(refreshError)
    }
  }
)
