import { getErrorCode } from "@/utils/error-handler"

// ErrorCode.java, UNISAGE-107 (spec §5.2) + the existing CONVERSATION_NOT_FOUND.
export const SHARE_ERROR_CODES = {
  conversationNotFound: 2127,
  shareEmptyConversation: 2802,
  shareGuestConversation: 2803,
  shareNotFound: 2801,
} as const

export const SHARE_NOT_FOUND_MESSAGE =
  "Liên kết không tồn tại hoặc đã bị thu hồi"

const UNKNOWN_SHARE_ERROR = "Không thực hiện được, vui lòng thử lại sau."

const SHARE_ERROR_MESSAGES: Record<number, string> = {
  [SHARE_ERROR_CODES.conversationNotFound]:
    "Không tìm thấy đoạn chat này. Có thể nó đã bị xoá.",
  [SHARE_ERROR_CODES.shareEmptyConversation]:
    "Đoạn chat chưa có câu trả lời nào để chia sẻ.",
  [SHARE_ERROR_CODES.shareGuestConversation]:
    "Không chia sẻ được đoạn chat của khách. Đăng nhập rồi thử lại nhé.",
  [SHARE_ERROR_CODES.shareNotFound]: `${SHARE_NOT_FOUND_MESSAGE}.`,
}

/**
 * The Vietnamese text for an error of the sharing flow (R12): mapped from the
 * backend's numeric code, never the backend's own message.
 */
export function getShareErrorMessage(error: unknown): string {
  const code = getErrorCode(error)
  return (code != null && SHARE_ERROR_MESSAGES[code]) || UNKNOWN_SHARE_ERROR
}

export function isShareNotFound(error: unknown): boolean {
  return getErrorCode(error) === SHARE_ERROR_CODES.shareNotFound
}
