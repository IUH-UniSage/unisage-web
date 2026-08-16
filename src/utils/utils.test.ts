import { AxiosError, type AxiosResponse } from "axios"
import { afterEach, describe, expect, it } from "vitest"
import { z } from "zod"

import { getErrorMessage, getFieldErrors } from "@/utils/error-handler"
import { formatFileSize } from "@/utils/file-size"
import { STORAGE_KEYS, storage } from "@/utils/local-storage"
import { generateUuid } from "@/utils/uuid"

afterEach(() => {
  window.localStorage.clear()
})

describe("shared utilities", () => {
  it("stores typed values under UniSage keys", () => {
    storage.set(STORAGE_KEYS.userProfile, { id: "user-1" })

    expect(storage.get(STORAGE_KEYS.userProfile)).toEqual({ id: "user-1" })
    expect(
      storage.getValid(STORAGE_KEYS.userProfile, z.object({ id: z.string() }))
    ).toEqual({ id: "user-1" })
  })

  it("formats file sizes", () => {
    expect(formatFileSize(0)).toBe("0 B")
    expect(formatFileSize(1536)).toBe("1.5 KB")
  })

  it("extracts API messages and field errors", () => {
    const response = {
      data: {
        errors: { email: "Email is already in use." },
        message: "Validation failed.",
      },
      status: 422,
    } as AxiosResponse
    const error = new AxiosError(
      "Request failed",
      "422",
      undefined,
      {},
      response
    )

    expect(getErrorMessage(error)).toBe("Validation failed.")
    expect(getFieldErrors(error)).toEqual({
      email: "Email is already in use.",
    })
  })

  it("generates RFC 4122 version 4 UUIDs", () => {
    expect(generateUuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    )
  })
})
