import { ROUTES } from "@/constants/paths"
import { TOUR_ANCHORS, type TourAnchor } from "@/constants/tour-anchors"
import {
  actionsStep,
  fieldStep,
  headerStep,
  rowActionsStep,
  tableStep,
  type TourStep,
} from "@/features/product-tour/tours/tour-step"
import type { NavigationItem, StaffWorkspace } from "@/routes/feature-registry"

// The first-login walkthrough: a handful of the most important pages, visited
// in order, then it stops for good. Every page (and dialog) still has its own
// detailed tour behind its "?" button.

export type OverviewStop = {
  // Names the page on the previous page's "Tiếp: ..." button.
  label: string
  path: string
  // On screen once the page has finished loading (pages show a skeleton
  // while their first query is pending); the stop starts only then.
  readyAnchor: TourAnchor
  steps: readonly TourStep[]
}

type StaffOverviewStop = Omit<OverviewStop, "path"> & {
  // FEATURE_REGISTRY key; the stop is left out when the signed-in user
  // cannot see that page in the sidebar.
  featureKey: string
}

const SIDEBAR_STEP: TourStep = {
  anchor: TOUR_ANCHORS.sidebarNav,
  description:
    "Chuyển giữa các trang quản lý. Bạn chỉ thấy những mục mà vai trò của mình được phép truy cập.",
  side: "right",
  title: "Thanh điều hướng",
}

const SEARCH_STEP: TourStep = {
  anchor: TOUR_ANCHORS.workspaceSearch,
  description:
    "Gõ tên trang hoặc chức năng để nhảy tới nhanh. Phím tắt: Ctrl + K.",
  side: "bottom",
  title: "Tìm kiếm nhanh",
}

const ACCOUNT_STEP: TourStep = {
  anchor: TOUR_ANCHORS.accountMenu,
  description:
    "Xem thông tin cá nhân, đổi mật khẩu, về trang chủ hoặc đăng xuất.",
  side: "bottom",
  title: "Tài khoản",
}

const FINISH_STEP: TourStep = {
  anchor: TOUR_ANCHORS.tourButton,
  description:
    "Phần giới thiệu kết thúc tại đây. Mỗi trang và hộp thoại đều có biểu tượng ? riêng: bấm vào để xem hướng dẫn chi tiết của đúng màn hình đang mở.",
  side: "bottom",
  title: "Xem hướng dẫn từng trang",
}

const welcomeStep = (workspace: string): TourStep => ({
  description: `Hướng dẫn nhanh này đưa bạn qua vài trang quan trọng nhất của không gian ${workspace}, mỗi trang vài điểm chính. Bấm Bỏ qua bất cứ lúc nào để tự khám phá.`,
  title: "Chào mừng đến UniSage",
})

const DOCUMENTS_STOP: StaffOverviewStop = {
  featureKey: "documents",
  label: "Tài liệu",
  readyAnchor: TOUR_ANCHORS.pageHeader,
  steps: [
    headerStep(
      "Tài liệu",
      "Nguồn tri thức của trợ lý AI. Trợ lý chỉ dùng những tài liệu đã xử lý xong để trả lời."
    ),
    actionsStep(
      "Thêm tài liệu",
      "Tải tệp lên, chọn danh mục, phòng ban và cấp độ truy cập, rồi đưa vào quy trình xử lý: xem trước → chia đoạn → embedding."
    ),
    rowActionsStep(
      "Xem chi tiết, quản lý các đoạn đã lập chỉ mục, tiếp tục xử lý nạp liệu hoặc chỉnh sửa và thay tệp."
    ),
  ],
}

const STAFF_OVERVIEW_STOPS: Record<StaffWorkspace, StaffOverviewStop[]> = {
  ingester: [
    {
      featureKey: "ingester-overview",
      label: "Tổng quan",
      readyAnchor: TOUR_ANCHORS.pageHeader,
      steps: [
        welcomeStep("Nạp tài liệu"),
        SIDEBAR_STEP,
        SEARCH_STEP,
        fieldStep(
          TOUR_ANCHORS.ingesterMetrics,
          "Chỉ số nạp liệu",
          "Tổng số tài liệu, số đang xử lý, số sẵn sàng xuất bản và số tác vụ thất bại cần xử lý lại."
        ),
        fieldStep(
          TOUR_ANCHORS.ingesterQueue,
          "Hàng đợi xử lý",
          "Các tài liệu mới nhất cùng trạng thái xử lý của từng tài liệu.",
          "top"
        ),
      ],
    },
    DOCUMENTS_STOP,
    {
      featureKey: "ingester-processing",
      label: "Hàng đợi xử lý",
      readyAnchor: TOUR_ANCHORS.pageHeader,
      steps: [
        headerStep(
          "Hàng đợi xử lý",
          "Nơi đưa tài liệu mới tải lên đến trạng thái sẵn sàng cho trợ lý AI."
        ),
        fieldStep(
          TOUR_ANCHORS.processingAction,
          "Xử lý nạp liệu",
          "Mở trình hướng dẫn 3 bước: xem trước nội dung, kiểm tra các đoạn đã chia rồi bắt đầu embedding. Tiến trình dở dang được lưu lại.",
          "left"
        ),
        FINISH_STEP,
      ],
    },
  ],
  "system-admin": [
    {
      featureKey: "admin-overview",
      label: "Tổng quan",
      readyAnchor: TOUR_ANCHORS.pageHeader,
      steps: [
        welcomeStep("Quản trị hệ thống"),
        SIDEBAR_STEP,
        SEARCH_STEP,
        fieldStep(
          TOUR_ANCHORS.overviewMetrics,
          "Chỉ số chính",
          "Câu trả lời AI, người đặt câu hỏi, thời gian trả lời và tỷ lệ có dẫn nguồn trong khoảng thời gian đã chọn, so với kỳ trước."
        ),
        fieldStep(
          TOUR_ANCHORS.overviewHealth,
          "Tình trạng dịch vụ",
          "Trạng thái thời gian thực của các dịch vụ phụ thuộc.",
          "top"
        ),
      ],
    },
    {
      featureKey: "admin-users",
      label: "Người dùng",
      readyAnchor: TOUR_ANCHORS.pageHeader,
      steps: [
        headerStep(
          "Người dùng",
          "Tài khoản của cán bộ, giảng viên và sinh viên cùng vai trò, phòng ban của họ."
        ),
        actionsStep(
          "Thêm người dùng",
          "Tạo tài khoản mới: thông tin cá nhân, mật khẩu khởi tạo, vai trò và phòng ban được truy cập."
        ),
        tableStep(
          "Bấm vào một dòng để mở trang chi tiết; menu ⋯ ở cuối dòng để chỉnh sửa hoặc vô hiệu hoá tài khoản."
        ),
      ],
    },
    DOCUMENTS_STOP,
    {
      featureKey: "admin-models",
      label: "Cấu hình AI",
      readyAnchor: TOUR_ANCHORS.pageHeader,
      steps: [
        headerStep(
          "Cấu hình AI",
          "Các mô hình ngôn ngữ dùng cho trò chuyện và nạp liệu. Mỗi mô hình được gọi thử để xác minh trước khi dùng."
        ),
        actionsStep(
          "Thêm mô hình",
          "Khai báo nhà cung cấp, khoá API và mục đích sử dụng của một mô hình mới."
        ),
        ACCOUNT_STEP,
        FINISH_STEP,
      ],
    },
  ],
}

// Signed-in students only: it ends on their support tickets.
export const CLIENT_OVERVIEW_STOPS: readonly OverviewStop[] = [
  {
    label: "Trang chủ",
    path: ROUTES.home,
    readyAnchor: TOUR_ANCHORS.homeAsk,
    steps: [
      {
        description:
          "UniSage trả lời câu hỏi về quy định, thủ tục và dịch vụ của trường dựa trên tài liệu chính thức. Hướng dẫn nhanh này giới thiệu vài trang chính; bấm Bỏ qua bất cứ lúc nào.",
        title: "Chào mừng đến UniSage",
      },
      fieldStep(
        TOUR_ANCHORS.homeAsk,
        "Đặt câu hỏi",
        "Gõ câu hỏi và nhấn Enter, trợ lý sẽ mở khung trò chuyện và trả lời ngay."
      ),
      fieldStep(
        TOUR_ANCHORS.homeSuggestions,
        "Câu hỏi gợi ý",
        "Chưa biết hỏi gì? Bấm một gợi ý để bắt đầu."
      ),
      fieldStep(
        TOUR_ANCHORS.userNav,
        "Điều hướng",
        "Chuyển nhanh giữa Trợ lý UniSage, Thư viện tri thức và Hỗ trợ sinh viên."
      ),
      fieldStep(
        TOUR_ANCHORS.userMobileMenu,
        "Menu",
        "Mở để chuyển trang và đổi giao diện sáng/tối.",
        "left"
      ),
    ],
  },
  {
    label: "Trợ lý",
    path: ROUTES.chat,
    readyAnchor: TOUR_ANCHORS.chatComposer,
    steps: [
      fieldStep(
        TOUR_ANCHORS.chatComposer,
        "Hỏi trợ lý",
        "Nhấn Enter để gửi, Shift + Enter để xuống dòng. Mỗi câu trả lời đều kèm nguồn tài liệu để bạn kiểm chứng.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.chatHistoryToggle,
        "Lịch sử trò chuyện",
        "Mở lại các cuộc trò chuyện trước hoặc bắt đầu đoạn chat mới.",
        "bottom"
      ),
      fieldStep(
        TOUR_ANCHORS.chatHistory,
        "Cuộc trò chuyện gần đây",
        "Các cuộc trò chuyện của bạn được lưu lại ở đây.",
        "right"
      ),
    ],
  },
  {
    label: "Yêu cầu hỗ trợ",
    path: ROUTES.tickets,
    readyAnchor: TOUR_ANCHORS.pageHeader,
    steps: [
      headerStep(
        "Yêu cầu hỗ trợ",
        "Khi một câu trả lời sai, bấm biểu tượng lá cờ dưới câu trả lời đó để báo cáo. Báo cáo được gửi tới cán bộ và theo dõi tại đây."
      ),
      fieldStep(
        TOUR_ANCHORS.myTicketList,
        "Danh sách yêu cầu",
        "Bấm một yêu cầu để xem chi tiết và phản hồi của cán bộ.",
        "top"
      ),
      FINISH_STEP,
    ],
  },
]

// The workspace's stops the user can actually open, at the paths the
// sidebar links them to.
export function resolveStaffOverviewStops(
  workspace: StaffWorkspace,
  visibleItems: readonly NavigationItem[]
): OverviewStop[] {
  return STAFF_OVERVIEW_STOPS[workspace].flatMap(({ featureKey, ...stop }) => {
    const item = visibleItems.find((navItem) => navItem.key === featureKey)
    return item ? [{ ...stop, path: item.to }] : []
  })
}
