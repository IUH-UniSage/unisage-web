import axios from "axios"

import { STORAGE_KEYS, storage } from "@/utils/local-storage"

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export function getAccessToken(): string | null {
  return storage.get<string>(STORAGE_KEYS.accessToken)
}

export function setAccessToken(token: string | null): void {
  if (token) {
    storage.set(STORAGE_KEYS.accessToken, token)
    return
  }

  storage.remove(STORAGE_KEYS.accessToken)
}

export function clearAuthentication(): void {
  storage.remove(STORAGE_KEYS.accessToken)
  storage.remove(STORAGE_KEYS.refreshToken)
}

httpClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})
