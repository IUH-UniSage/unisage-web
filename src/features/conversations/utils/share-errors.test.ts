import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios"
import { describe, expect, it } from "vitest"

import {
  getShareErrorMessage,
  isShareNotFound,
} from "@/features/conversations/utils/share-errors"
import { ApiResponseError } from "@/utils/api-response"

function axiosError(code: number | undefined, status = 400) {
  const response = {
    config: { headers: new AxiosHeaders() },
    data: { code, message: "RAW BACKEND MESSAGE" },
    headers: {},
    status,
    statusText: "",
  } as AxiosResponse
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    response
  )
}

describe("getShareErrorMessage", () => {
  it.each([
    [2801, "Liên kết không tồn tại hoặc đã bị thu hồi."],
    [2802, "Đoạn chat chưa có câu trả lời nào để chia sẻ."],
    [
      2803,
      "Không chia sẻ được đoạn chat của khách. Đăng nhập rồi thử lại nhé.",
    ],
    [2127, "Không tìm thấy đoạn chat này. Có thể nó đã bị xoá."],
  ])("maps backend code %i to Vietnamese", (code, message) => {
    expect(getShareErrorMessage(axiosError(code))).toBe(message)
  })

  it("never shows the backend message for an unknown code or a network error", () => {
    expect(getShareErrorMessage(axiosError(9999, 500))).toBe(
      "Không thực hiện được, vui lòng thử lại sau."
    )
    expect(getShareErrorMessage(axiosError(undefined, 502))).toBe(
      "Không thực hiện được, vui lòng thử lại sau."
    )
    expect(getShareErrorMessage(new Error("boom"))).toBe(
      "Không thực hiện được, vui lòng thử lại sau."
    )
  })

  it("reads the code of a non-success envelope on a 2xx response too", () => {
    const error = new ApiResponseError({ code: 2802, message: "raw" })
    expect(getShareErrorMessage(error)).toBe(
      "Đoạn chat chưa có câu trả lời nào để chia sẻ."
    )
  })
})

describe("isShareNotFound", () => {
  it("is true only for SHARE_NOT_FOUND", () => {
    expect(isShareNotFound(axiosError(2801, 404))).toBe(true)
    expect(isShareNotFound(axiosError(2127, 404))).toBe(false)
  })
})
