import { describe, expect, it } from "vitest"

import { getDocumentTitle } from "@/routes/document-title"

describe("getDocumentTitle", () => {
  it.each([
    ["/admin", "Tổng quan · UniSage"],
    ["/admin/users", "Quản lý người dùng · UniSage"],
    ["/admin/users/", "Quản lý người dùng · UniSage"],
    ["/admin/users/new", "Thêm mới · Quản lý người dùng · UniSage"],
    ["/admin/users/abc/edit", "Chỉnh sửa · Quản lý người dùng · UniSage"],
    ["/admin/users/abc", "Chi tiết · Quản lý người dùng · UniSage"],
    ["/admin/profile", "Thông tin cá nhân · UniSage"],
    ["/chat", "Trò chuyện · UniSage"],
    ["/chat/123", "Trò chuyện · UniSage"],
    ["/login", "Đăng nhập · UniSage"],
    ["/does-not-exist", "UniSage"],
  ])("%s → %s", (pathname, expected) => {
    expect(getDocumentTitle(pathname)).toBe(expected)
  })
})
