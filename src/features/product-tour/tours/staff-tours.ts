import type { Side } from "driver.js"

import { TOUR_ANCHORS, type TourAnchor } from "@/constants/tour-anchors"
import type { StaffWorkspace } from "@/routes/feature-registry"

export type TourStep = {
  // Omit for a centered step not tied to any element.
  anchor?: TourAnchor
  description: string
  side?: Side
  title: string
}

const headerStep = (title: string, description: string): TourStep => ({
  anchor: TOUR_ANCHORS.pageHeader,
  description,
  side: "bottom",
  title,
})

const toolbarStep = (description: string): TourStep => ({
  anchor: TOUR_ANCHORS.listToolbar,
  description,
  side: "bottom",
  title: "Tìm kiếm và lọc",
})

const tableStep = (description: string): TourStep => ({
  anchor: TOUR_ANCHORS.dataTable,
  description,
  side: "top",
  title: "Danh sách",
})

const actionsStep = (title: string, description: string): TourStep => ({
  anchor: TOUR_ANCHORS.pageActions,
  description,
  side: "bottom",
  title,
})

const tabsStep = (description: string): TourStep => ({
  anchor: TOUR_ANCHORS.pageTabs,
  description,
  side: "bottom",
  title: "Các nhóm chức năng",
})

const PAGINATION_STEP: TourStep = {
  anchor: TOUR_ANCHORS.pagination,
  description:
    "Chuyển trang khi danh sách dài. Số kết quả hiển thị luôn được cập nhật theo bộ lọc hiện tại.",
  side: "top",
  title: "Phân trang",
}

// Shown once per workspace, ahead of whichever page the staff member lands
// on first, so every page tour can stay focused on its own content.
export const WORKSPACE_INTRO_STEPS: Record<StaffWorkspace, TourStep[]> = {
  ingester: [
    {
      description:
        "Đây là nơi bạn tải tài liệu lên, theo dõi quá trình xử lý và quản lý nội dung tri thức. Hướng dẫn ngắn này giới thiệu các khu vực chính.",
      title: "Chào mừng đến không gian Nạp tài liệu",
    },
    {
      anchor: TOUR_ANCHORS.sidebarNav,
      description:
        "Chuyển giữa các trang quản lý. Bạn chỉ thấy những mục mà vai trò của mình được phép truy cập.",
      side: "right",
      title: "Thanh điều hướng",
    },
    {
      anchor: TOUR_ANCHORS.workspaceSearch,
      description:
        "Gõ tên trang hoặc chức năng để nhảy tới nhanh. Phím tắt: Ctrl + K.",
      side: "bottom",
      title: "Tìm kiếm nhanh",
    },
    {
      anchor: TOUR_ANCHORS.tourButton,
      description:
        "Bấm biểu tượng ? bất cứ lúc nào để xem lại hướng dẫn của trang đang mở.",
      side: "bottom",
      title: "Xem lại hướng dẫn",
    },
  ],
  "system-admin": [
    {
      description:
        "Đây là nơi bạn quản lý người dùng, phân quyền, nội dung, mô hình AI và cấu hình hệ thống UniSage. Hướng dẫn ngắn này giới thiệu các khu vực chính.",
      title: "Chào mừng đến không gian Quản trị hệ thống",
    },
    {
      anchor: TOUR_ANCHORS.sidebarNav,
      description:
        "Chuyển giữa các trang quản lý. Bạn chỉ thấy những mục mà vai trò của mình được phép truy cập.",
      side: "right",
      title: "Thanh điều hướng",
    },
    {
      anchor: TOUR_ANCHORS.workspaceSearch,
      description:
        "Gõ tên trang hoặc chức năng để nhảy tới nhanh. Phím tắt: Ctrl + K.",
      side: "bottom",
      title: "Tìm kiếm nhanh",
    },
    {
      anchor: TOUR_ANCHORS.accountMenu,
      description:
        "Xem thông tin cá nhân, đổi mật khẩu, về trang chủ hoặc đăng xuất.",
      side: "bottom",
      title: "Tài khoản",
    },
    {
      anchor: TOUR_ANCHORS.tourButton,
      description:
        "Bấm biểu tượng ? bất cứ lúc nào để xem lại hướng dẫn của trang đang mở.",
      side: "bottom",
      title: "Xem lại hướng dẫn",
    },
  ],
}

// Keyed by FEATURE_REGISTRY entry key. A feature with no entry here (e.g. a
// placeholder page) simply has no tour and no "Hướng dẫn" button.
export const PAGE_TOURS: Partial<Record<string, TourStep[]>> = {
  "admin-overview": [
    headerStep(
      "Tổng quan hệ thống",
      "Bức tranh nhanh về mức sử dụng, nội dung tri thức, yêu cầu hỗ trợ và tình trạng dịch vụ."
    ),
    {
      anchor: TOUR_ANCHORS.overviewMetrics,
      description:
        "Các chỉ số chính: người dùng hoạt động, câu trả lời AI hôm nay, tài liệu đã xuất bản và yêu cầu hỗ trợ đang mở.",
      side: "bottom",
      title: "Chỉ số chính",
    },
    {
      anchor: TOUR_ANCHORS.overviewActivity,
      description:
        "Số câu hỏi trợ lý AI đã trả lời trong 7 ngày gần nhất, giúp nhận ra xu hướng sử dụng.",
      side: "top",
      title: "Hoạt động nền tảng",
    },
    {
      anchor: TOUR_ANCHORS.overviewHealth,
      description:
        "Trạng thái thời gian thực của các dịch vụ phụ thuộc. Mở trang Tình trạng dịch vụ để xem chi tiết và lịch sử.",
      side: "left",
      title: "Tình trạng dịch vụ",
    },
    {
      anchor: TOUR_ANCHORS.overviewShortcuts,
      description:
        "Lối tắt tới các việc quản trị thường gặp: người dùng, nhà cung cấp AI và yêu cầu hỗ trợ.",
      side: "top",
      title: "Lối tắt",
    },
  ],
  "ingester-overview": [
    headerStep(
      "Tổng quan nạp tài liệu",
      "Theo dõi tài liệu đầu vào, chất lượng trích xuất và mức độ sẵn sàng xuất bản."
    ),
    {
      anchor: TOUR_ANCHORS.ingesterMetrics,
      description:
        "Tổng số tài liệu, số đang xử lý, số sẵn sàng xuất bản và số tác vụ thất bại cần xử lý lại.",
      side: "bottom",
      title: "Chỉ số nạp liệu",
    },
    {
      anchor: TOUR_ANCHORS.ingesterQueue,
      description:
        "Các tác vụ tài liệu mới nhất từ các đơn vị cùng trạng thái xử lý của từng tài liệu.",
      side: "top",
      title: "Hàng đợi xử lý",
    },
    {
      anchor: TOUR_ANCHORS.ingesterActivity,
      description: "Tiến độ theo mục tiêu tuần và các hoạt động gần đây.",
      side: "left",
      title: "Tiến độ & hoạt động",
    },
  ],
  departments: [
    headerStep(
      "Phòng ban",
      "Quản lý cây phân cấp các phòng ban, khoa viện và đơn vị trực thuộc. Phòng ban dùng để gán người dùng và giới hạn phạm vi tài liệu."
    ),
    actionsStep(
      "Thêm đơn vị",
      "Tạo phòng ban mới. Bạn cũng có thể thêm đơn vị con trực tiếp từ một phòng ban trong danh sách."
    ),
    toolbarStep(
      "Tìm theo tên hoặc mô tả, lọc theo loại đơn vị và trạng thái, rồi bấm Lọc để áp dụng."
    ),
    {
      anchor: TOUR_ANCHORS.departmentViewMode,
      description:
        "Chuyển giữa dạng Sơ đồ tổ chức (cây phân cấp) và dạng Danh sách (bảng).",
      side: "bottom",
      title: "Chế độ xem",
    },
  ],
  "admin-users": [
    headerStep(
      "Quản lý người dùng",
      "Quản lý tài khoản, vai trò và phòng ban của người dùng trong UniSage."
    ),
    actionsStep(
      "Thêm người dùng",
      "Tạo tài khoản mới và gán vai trò, phòng ban ngay khi tạo."
    ),
    toolbarStep(
      "Tìm theo tên, email hoặc mã GV/SV và lọc theo trạng thái tài khoản."
    ),
    tableStep(
      "Menu ở cuối mỗi dòng có các thao tác xem chi tiết, sửa và đổi trạng thái. Đánh dấu nhiều dòng để vô hiệu hoá hoặc khôi phục hàng loạt."
    ),
    PAGINATION_STEP,
  ],
  "admin-rbac": [
    headerStep(
      "Vai trò & phân quyền",
      "Định nghĩa vai trò và các quyền hạn đi kèm. Quyền của người dùng được quyết định bởi vai trò của họ."
    ),
    actionsStep(
      "Thêm vai trò / quyền hạn",
      "Tạo vai trò mới hoặc khai báo quyền hạn mới cho hệ thống."
    ),
    tabsStep(
      "Tab Cấu hình vai trò để quản lý vai trò và quyền được gán; tab Cấu hình quyền hạn để xem toàn bộ danh mục quyền."
    ),
    toolbarStep(
      "Tìm vai trò theo tên, lọc theo quyền hạn được gán và trạng thái."
    ),
    tableStep(
      "Mở một vai trò để xem chi tiết và chỉnh sửa tập quyền của vai trò đó."
    ),
  ],
  "admin-access-levels": [
    headerStep(
      "Cấp độ truy cập",
      "Các ngưỡng cấp độ dùng để giới hạn ai được truy cập tài liệu nào. Tài liệu có cấp độ cao hơn người dùng sẽ bị ẩn với họ."
    ),
    actionsStep("Thêm cấp độ mới", "Khai báo một ngưỡng cấp độ truy cập mới."),
    tableStep("Xem, sửa hoặc vô hiệu hoá từng cấp độ truy cập."),
    PAGINATION_STEP,
  ],
  "admin-tickets": [
    headerStep(
      "Yêu cầu hỗ trợ",
      "Các câu trả lời của trợ lý mà người dùng đã báo cáo. Xem chi tiết, cập nhật trạng thái và phản hồi người dùng tại đây."
    ),
    toolbarStep(
      "Tìm yêu cầu theo tiêu đề, lọc theo trạng thái xử lý hoặc loại báo cáo."
    ),
    tableStep(
      "Mở một yêu cầu để xem đoạn hội thoại liên quan và đổi trạng thái xử lý."
    ),
    PAGINATION_STEP,
  ],
  "admin-usage-limits": [
    headerStep(
      "Cấu hình hạn mức",
      "Quản lý các gói hạn mức token theo 24 giờ và 7 ngày, rồi gắn gói cho vai trò để kiểm soát mức sử dụng AI."
    ),
    actionsStep("Thêm gói hạn mức", "Tạo một gói hạn mức token mới."),
    toolbarStep("Tìm gói hạn mức theo tên và lọc theo loại gói."),
    tableStep("Xem, sửa hoặc vô hiệu hoá từng gói hạn mức."),
    PAGINATION_STEP,
  ],
  categories: [
    headerStep(
      "Danh mục tài liệu",
      "Danh mục dùng để phân loại tài liệu, giúp tìm kiếm và trả lời chính xác hơn."
    ),
    actionsStep("Thêm danh mục mới", "Tạo một danh mục tài liệu mới."),
    tableStep("Xem, sửa hoặc vô hiệu hoá từng danh mục."),
    PAGINATION_STEP,
  ],
  documents: [
    headerStep(
      "Quản trị tài liệu",
      "Tất cả tài liệu đã nạp vào hệ thống, phân loại theo danh mục và phòng ban."
    ),
    actionsStep(
      "Thêm tài liệu mới",
      "Tải tài liệu lên, chọn danh mục, phòng ban, cấp độ truy cập rồi đưa vào quy trình xử lý."
    ),
    tableStep(
      "Mở một tài liệu để xem chi tiết, các đoạn đã chia (chunk) hoặc tiếp tục quy trình nạp liệu."
    ),
    PAGINATION_STEP,
  ],
  "admin-logs": [
    headerStep(
      "Nhật ký hệ thống",
      "Toàn bộ thao tác thêm, sửa, xoá dữ liệu: ai đã làm gì, vào lúc nào."
    ),
    toolbarStep(
      "Tìm theo mã người thực hiện, lọc theo đối tượng, hành động và ngày thực hiện."
    ),
    tableStep("Mở một bản ghi để xem chi tiết dữ liệu trước và sau thay đổi."),
    PAGINATION_STEP,
  ],
  "admin-models": [
    headerStep(
      "Cấu hình AI",
      "Quản lý các mô hình ngôn ngữ dùng cho trò chuyện và nạp liệu, cùng thông tin xác thực của nhà cung cấp."
    ),
    actionsStep(
      "Thêm mô hình chat",
      "Khai báo mô hình mới, nhà cung cấp, khoá API và mục đích sử dụng."
    ),
    tabsStep(
      "Tab Mô hình để quản lý danh sách mô hình; tab Jobs xác minh để xem kết quả kiểm tra kết nối tới nhà cung cấp."
    ),
    toolbarStep(
      "Lọc mô hình theo trạng thái hoạt động, mục đích sử dụng, trạng thái xác minh và sắp xếp theo độ ưu tiên."
    ),
  ],
  "admin-cost-management": [
    headerStep(
      "Chi phí AI",
      "Theo dõi chi phí AI theo mục đích, nhà cung cấp và mô hình; quản lý ngân sách và cảnh báo vượt ngưỡng."
    ),
    tabsStep(
      "Tổng quan chi phí, Ngân sách, Cảnh báo, Mô hình và Bảng giá, và Lịch sử sử dụng chi tiết."
    ),
  ],
  "admin-health": [
    headerStep(
      "Tình trạng dịch vụ",
      "Trạng thái hiện tại của cơ sở dữ liệu, cổng API, trợ lý AI và các dịch vụ lưu trữ."
    ),
    {
      anchor: TOUR_ANCHORS.healthLive,
      description:
        "Kết quả kiểm tra mới nhất của từng dịch vụ kèm thời gian phản hồi.",
      side: "bottom",
      title: "Trạng thái hiện tại",
    },
    {
      anchor: TOUR_ANCHORS.healthHistory,
      description:
        "Kết quả kiểm tra được ghi nhận định kỳ, giúp truy lại thời điểm dịch vụ gặp sự cố.",
      side: "top",
      title: "Lịch sử kiểm tra",
    },
  ],
  "admin-settings": [
    headerStep(
      "Cài đặt hệ thống",
      "Các tham số cấu hình toàn hệ thống, chia theo nhóm."
    ),
    tabsStep(
      "Chung, Bảo mật, Trò chuyện, Nạp liệu, Nhật ký và Bảo trì. Mỗi nhóm có mô tả và các giá trị có thể chỉnh sửa."
    ),
  ],
  "ingester-processing": [
    headerStep(
      "Hàng đợi xử lý tài liệu",
      "Xem trước, chia đoạn và bắt đầu embedding cho từng tài liệu."
    ),
    {
      anchor: TOUR_ANCHORS.processingList,
      description:
        "Bấm Xử lý nạp liệu ở một tài liệu để mở trình hướng dẫn: xem trước nội dung, kiểm tra các đoạn đã chia rồi bắt đầu embedding.",
      side: "top",
      title: "Tài liệu chờ xử lý",
    },
    PAGINATION_STEP,
  ],
}
