// Khớp với ErrorCode (Python StrEnum) bên unisage-agent
// (app/core/error_codes.py) - string keys, khác domain với error-codes.ts
// (khoá theo ErrorCode.java, số nguyên). Message ở đây do FE tự viết, không
// phụ thuộc câu chữ backend trả về.
export const AI_ERROR_CODE_MESSAGES: Record<string, string> = {
  // 400x Client Errors
  UNISAGE_4001_INVALID_QUERY: "Câu hỏi không hợp lệ, kiểm tra lại giúp mình.",
  UNISAGE_4002_UNAUTHORIZED: "Bạn không có quyền dùng chức năng này.",
  UNISAGE_4003_MISSING_TRUSTED_CONTEXT:
    "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.",
  UNISAGE_4004_UNSUPPORTED_FILE_TYPE:
    "Định dạng file này chưa được hỗ trợ nạp liệu.",
  UNISAGE_4005_STRATEGY_FILE_TYPE_MISMATCH:
    "Chiến lược chia đoạn này không áp dụng được cho loại file này.",
  UNISAGE_4006_INVALID_TRUSTED_CONTEXT:
    "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.",
  UNISAGE_4007_FORBIDDEN_DOCUMENT_PERMISSION:
    "Bạn không có quyền xử lý tài liệu.",
  UNISAGE_4008_FORBIDDEN_DEPARTMENT_ACCESS:
    "Bạn không có quyền truy cập phòng ban của tài liệu này.",

  // 404x Not Found Errors
  UNISAGE_4041_OBJECT_NOT_FOUND: "Không tìm thấy file gốc của tài liệu này.",

  // 500x Server & LLM Errors
  UNISAGE_5000_INTERNAL_ERROR: "Có lỗi xảy ra, bạn thử lại sau nhé.",
  UNISAGE_5001_LLM_TIMEOUT: "Hệ thống AI phản hồi quá lâu, thử lại sau nhé.",
  UNISAGE_5002_LLM_PROVIDER_ERROR:
    "Hệ thống AI đang gặp sự cố, thử lại sau nhé.",
  UNISAGE_5003_DATABASE_ERROR: "Có lỗi xảy ra, bạn thử lại sau nhé.",
}

export function getAiErrorCodeMessage(errorCode: string): string | undefined {
  return AI_ERROR_CODE_MESSAGES[errorCode]
}
