// Khớp với ErrorCode.java bên backend. Message ở đây do FE tự viết,
// không phụ thuộc câu chữ backend trả về.
export const ERROR_CODE_MESSAGES: Record<number, string> = {
  // Auth (1xxx)
  1001: "Bạn cần đăng nhập để tiếp tục.",
  1002: "Bạn không có quyền dùng chức năng này.",
  1003: "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.",
  1004: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  1005: "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.",
  1006: "Mã số hoặc mật khẩu không đúng.",

  // User & tài khoản (2xxx)
  2002: "Tài khoản này đã bị khoá.",
  2004: "Không tìm thấy người dùng này.",
  2005: "Tài khoản chưa được kích hoạt hoặc đã bị khoá.",

  // Not found
  2101: "Không tìm thấy danh mục này.",
  2105: "Không tìm thấy phòng ban này.",
  2106: "Không tìm thấy tài liệu này.",
  2109: "Không tìm thấy vai trò này.",
  2112: "Không tìm thấy quyền này.",
  2121: "Không tìm thấy Chat Model này.",
  2125: "Không tìm thấy phân quyền phòng ban này.",
  2127: "Không tìm thấy hội thoại này.",
  2128: "Không tìm thấy tin nhắn này.",
  2139: "Không tìm thấy yêu cầu hỗ trợ này.",
  2131: "Không tìm thấy Access Level này.",

  // Business rule
  2115: "Email này đã được dùng rồi.",
  2116: "Số điện thoại này đã được dùng rồi.",
  2117: "Mã người dùng này đã tồn tại.",
  2119: "Vai trò này đã tồn tại.",
  2120: "Tên danh mục này đã tồn tại.",
  2126: "Phân quyền phòng ban này đã có rồi.",
  2129: "Hội thoại này đã có người khác nhận rồi.",
  2130: "Bạn đã dùng hết lượt chat miễn phí hôm nay. Quay lại sau 00:00 hoặc đăng nhập để tiếp tục nhé.",
  2132: "Access Level này đã tồn tại.",
  2138: "Mật khẩu hiện tại không đúng.",
  2140: "Tin nhắn này đã được báo cáo rồi.",
  2141: "Chỉ báo cáo được câu trả lời của trợ lý trong hội thoại của bạn.",
  2142: "Yêu cầu hỗ trợ này đã đóng, không thể thay đổi nữa.",
  2143: "Cần nhập nội dung phản hồi khi đánh dấu đã giải quyết.",

  // Validation
  2133: "Nhà cung cấp không được để trống khi nguồn là Cloud API.",
  2134: "API key không được để trống khi nguồn là Cloud API.",
  2300: "Thông tin nhập chưa hợp lệ, kiểm tra lại giúp mình.",
  2310: "Bạn không có quyền tạo tài liệu này.",

  // File storage (24xx)
  2401: "Tải file lên thất bại, thử lại nhé.",
  2402: "Xoá file thất bại, thử lại nhé.",
  2403: "Không tìm thấy file này.",
  2404: "Bạn không có quyền truy cập file này.",
  2405: "File vượt quá dung lượng cho phép.",
  2406: "Định dạng file này chưa được hỗ trợ.",
  2407: "Mỗi lần chỉ được gửi 1 file thôi.",

  // System
  9999: "Có lỗi xảy ra, bạn thử lại sau nhé.",

  // AI Agent (unisage-agent, 4xxx/5xxx) - Java never uses this range, so no
  // collision merging both backends' codes into one map.
  4001: "Câu hỏi không hợp lệ, kiểm tra lại giúp mình.",
  4002: "Bạn không có quyền dùng chức năng này.",
  4003: "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.",
  4004: "Định dạng file này chưa được hỗ trợ nạp liệu.",
  4005: "Chiến lược chia đoạn này không áp dụng được cho loại file này.",
  4006: "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.",
  4007: "Bạn không có quyền xử lý tài liệu.",
  4008: "Bạn không có quyền truy cập phòng ban của tài liệu này.",
  4009: "Thông tin nhập chưa hợp lệ, kiểm tra lại giúp mình.",
  4041: "Không tìm thấy file gốc của tài liệu này.",
  4042: "Tài liệu này chưa được chia đoạn.",
  4043: "Không tìm thấy bản nháp nạp liệu cho tài liệu này.",
  4221: "Không trích xuất được văn bản từ tài liệu này (có thể là bản scan). Hãy dùng bản có thể chọn chữ hoặc chạy OCR trước khi nạp.",
  5000: "Có lỗi xảy ra, bạn thử lại sau nhé.",
  5001: "Hệ thống AI phản hồi quá lâu, thử lại sau nhé.",
  5002: "Hệ thống AI đang gặp sự cố, thử lại sau nhé.",
  5003: "Có lỗi xảy ra, bạn thử lại sau nhé.",
}

export function getErrorMessage(code: number, fallback: string): string {
  return ERROR_CODE_MESSAGES[code] ?? fallback
}
