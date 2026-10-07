import { matchPath } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import { TOUR_ANCHORS } from "@/constants/tour-anchors"
import {
  actionsStep,
  fieldStep,
  headerStep,
  PAGINATION_STEP,
  type TourStep,
} from "@/features/product-tour/tours/tour-step"
import type { PageTour } from "@/features/product-tour/utils/resolve-page-tour"

// Tours for the student-facing side (home, chat, tickets, profile). Home and
// chat are open to guests, so steps that only make sense when signed in
// (history, account, tickets) or only for guests (sign-in prompts) sit on
// elements rendered for that audience alone and drop out for the other.

const TOUR_BUTTON_STEP: TourStep = {
  anchor: TOUR_ANCHORS.tourButton,
  description:
    "Bấm vào đây bất cứ lúc nào để xem lại hướng dẫn của trang đang mở.",
  side: "bottom",
  title: "Xem lại hướng dẫn",
}

// Shown after the first answer arrives (see useChatReplyTour) and at the end
// of the chat tour when it is replayed over a conversation.
export const CHAT_REPLY_STEPS: readonly TourStep[] = [
  fieldStep(
    TOUR_ANCHORS.chatReplyCitations,
    "Nguồn của câu trả lời",
    "Mỗi thẻ là một tài liệu UniSage đã dùng. Bấm để xem đoạn trích gốc và kiểm chứng trước khi làm theo.",
    "top"
  ),
  fieldStep(
    TOUR_ANCHORS.chatSources,
    "Tất cả nguồn tham chiếu",
    "Mở bảng bên phải để xem toàn bộ tài liệu được trích dẫn trong cuộc trò chuyện.",
    "bottom"
  ),
  fieldStep(
    TOUR_ANCHORS.chatReplyActions,
    "Sao chép hoặc báo cáo",
    "Sao chép câu trả lời, hoặc bấm biểu tượng lá cờ nếu câu trả lời sai. Báo cáo trở thành một yêu cầu hỗ trợ để cán bộ xem xét (cần đăng nhập).",
    "top"
  ),
]

export const CHAT_REPLY_TOUR_KEY = "chat-reply"

export type ClientPageTour = PageTour & {
  paths: readonly string[]
}

export const CLIENT_PAGE_TOURS: readonly ClientPageTour[] = [
  {
    key: "home",
    paths: [ROUTES.home],
    readyAnchor: TOUR_ANCHORS.homeAsk,
    steps: [
      {
        description:
          "UniSage trả lời câu hỏi về quy định, thủ tục và dịch vụ của trường dựa trên tài liệu chính thức. Hướng dẫn ngắn này giới thiệu cách bắt đầu.",
        title: "Chào mừng đến UniSage",
      },
      fieldStep(
        TOUR_ANCHORS.homeAsk,
        "Đặt câu hỏi",
        "Gõ câu hỏi và nhấn Enter, trợ lý sẽ mở khung trò chuyện và trả lời ngay. Không cần đăng nhập."
      ),
      fieldStep(
        TOUR_ANCHORS.homeSuggestions,
        "Câu hỏi gợi ý",
        "Chưa biết hỏi gì? Bấm một gợi ý để bắt đầu."
      ),
      fieldStep(
        TOUR_ANCHORS.homeTopics,
        "Chủ đề phổ biến",
        "Lối tắt tới các nhóm tài nguyên sinh viên hay tìm nhất.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.homeSupport,
        "Cần người hỗ trợ?",
        "Theo dõi các yêu cầu hỗ trợ bạn đã gửi khi một câu trả lời chưa giải quyết được vấn đề (cần đăng nhập).",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.userNav,
        "Điều hướng",
        "Chuyển nhanh giữa Trợ lý UniSage, Thư viện tri thức và Hỗ trợ sinh viên."
      ),
      fieldStep(
        TOUR_ANCHORS.userMobileMenu,
        "Menu",
        "Mở để chuyển trang, đăng nhập và đổi giao diện sáng/tối.",
        "left"
      ),
      fieldStep(
        TOUR_ANCHORS.userSignIn,
        "Đăng nhập",
        "Đăng nhập bằng tài khoản trường để lưu lịch sử trò chuyện và gửi yêu cầu hỗ trợ.",
        "left"
      ),
      fieldStep(
        TOUR_ANCHORS.accountMenu,
        "Tài khoản",
        "Hồ sơ, yêu cầu hỗ trợ và đăng xuất.",
        "left"
      ),
      TOUR_BUTTON_STEP,
    ],
  },
  {
    key: "chat",
    paths: [ROUTES.chat],
    readyAnchor: TOUR_ANCHORS.chatComposer,
    steps: [
      fieldStep(
        TOUR_ANCHORS.chatComposer,
        "Hỏi trợ lý",
        "Nhấn Enter để gửi, Shift + Enter để xuống dòng. Câu trả lời được lấy từ tài liệu chính thức của trường và có kèm nguồn.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.chatHistoryToggle,
        "Lịch sử trò chuyện",
        "Mở danh sách các cuộc trò chuyện, bắt đầu đoạn chat mới hoặc đăng nhập.",
        "bottom"
      ),
      fieldStep(
        TOUR_ANCHORS.chatNewConversation,
        "Đoạn chat mới",
        "Bắt đầu một chủ đề khác mà không lẫn ngữ cảnh cũ. Phím tắt Ctrl + Shift + O.",
        "right"
      ),
      fieldStep(
        TOUR_ANCHORS.chatSearch,
        "Tìm cuộc trò chuyện",
        "Tìm lại cuộc trò chuyện cũ theo tiêu đề. Phím tắt Ctrl + K.",
        "right"
      ),
      fieldStep(
        TOUR_ANCHORS.chatHistory,
        "Cuộc trò chuyện gần đây",
        "Bấm để mở lại. Rê chuột lên một dòng để xoá cuộc trò chuyện đó.",
        "right"
      ),
      fieldStep(
        TOUR_ANCHORS.chatGuestSignIn,
        "Đăng nhập để lưu lại",
        "Bạn đang dùng với tư cách khách: cuộc trò chuyện không được lưu. Đăng nhập để giữ lịch sử và báo cáo câu trả lời sai.",
        "right"
      ),
      fieldStep(
        TOUR_ANCHORS.chatAccount,
        "Tài khoản",
        "Về trang chủ, xem yêu cầu hỗ trợ, đổi mật khẩu hoặc đăng xuất.",
        "right"
      ),
      ...CHAT_REPLY_STEPS,
      TOUR_BUTTON_STEP,
    ],
  },
  {
    key: "my-tickets",
    paths: [ROUTES.tickets],
    steps: [
      headerStep(
        "Yêu cầu hỗ trợ của tôi",
        "Các câu trả lời bạn đã báo cáo và tình trạng xử lý của cán bộ."
      ),
      fieldStep(
        TOUR_ANCHORS.myTicketFilter,
        "Lọc theo trạng thái",
        "Xem riêng các yêu cầu Chờ xử lý, Đang xử lý, Đã giải quyết hoặc Đã đóng."
      ),
      fieldStep(
        TOUR_ANCHORS.myTicketList,
        "Danh sách yêu cầu",
        "Bấm một yêu cầu để xem chi tiết và phản hồi của cán bộ. Để tạo yêu cầu mới, bấm biểu tượng lá cờ dưới câu trả lời trong khung chat.",
        "top"
      ),
      PAGINATION_STEP,
      TOUR_BUTTON_STEP,
    ],
  },
  {
    key: "profile",
    paths: [ROUTES.profile],
    steps: [
      headerStep("Hồ sơ của bạn", "Thông tin tài khoản đang đăng nhập."),
      actionsStep(
        "Đổi mật khẩu",
        "Nhập mật khẩu hiện tại và mật khẩu mới (tối thiểu 8 ký tự)."
      ),
      fieldStep(
        TOUR_ANCHORS.profileBasic,
        "Hồ sơ cơ bản",
        "Mã sinh viên, họ tên, email, số điện thoại và giới tính. Liên hệ quản trị viên nếu cần chỉnh sửa."
      ),
      fieldStep(
        TOUR_ANCHORS.profileAccount,
        "Tài khoản",
        "Vai trò và cấp truy cập quyết định những tài liệu trợ lý được dùng để trả lời bạn.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.profileUsage,
        "Hạn mức sử dụng",
        "Số lượt bạn đã dùng trong 24 giờ và 7 ngày. Hết hạn mức thì phải chờ làm mới mới hỏi tiếp được.",
        "top"
      ),
      TOUR_BUTTON_STEP,
    ],
  },
]

export function getClientPageTour(pathname: string): ClientPageTour | null {
  return (
    CLIENT_PAGE_TOURS.find((tour) =>
      tour.paths.some((path) => matchPath(path, pathname))
    ) ?? null
  )
}
