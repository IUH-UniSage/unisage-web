import { describe, expect, it } from "vitest"
import { z } from "zod"

import {
  ApiResponseError,
  apiResponseSchema,
  readApiResponse,
  readSuccessData,
} from "@/lib/api-response"

describe("API response helpers", () => {
  const dataSchema = z.object({ id: z.uuid() })
  const data = { id: "a76398bd-c8ac-4fa8-803e-0a91e207347c" }

  it("exposes a reusable generic response schema", () => {
    expect(
      apiResponseSchema(dataSchema).parse({
        code: 1000,
        data,
        message: "Successful",
      }).data
    ).toEqual(data)
  })

  it("returns validated data from a successful response", () => {
    expect(
      readSuccessData(
        {
          code: 1000,
          data,
          message: "Successful",
        },
        dataSchema
      )
    ).toEqual(data)
  })

  it("preserves Backend code and field errors when a response fails", () => {
    let thrownError: unknown

    try {
      readApiResponse(
        {
          code: 1006,
          data: null,
          errors: { code: "Mã tài khoản không tồn tại." },
          message: "Đăng nhập thất bại.",
        },
        dataSchema
      )
    } catch (error) {
      thrownError = error
    }

    expect(thrownError).toBeInstanceOf(ApiResponseError)
    expect(thrownError).toMatchObject({
      code: 1006,
      errors: { code: "Mã tài khoản không tồn tại." },
      message: "Đăng nhập thất bại.",
    })
  })
})
