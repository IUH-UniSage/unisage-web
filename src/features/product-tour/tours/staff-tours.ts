import { TOUR_ANCHORS } from "@/constants/tour-anchors"
import {
  actionsStep,
  bulkSelectStep,
  FILTER_ACTIONS_STEP,
  headerStep,
  PAGINATION_STEP,
  rowActionsStep,
  searchStep,
  tabPanelStep,
  tabsStep,
  tabStep,
  tableStep,
  toolbarStep,
  type TourStep,
} from "@/features/product-tour/tours/tour-step"
import type { StaffWorkspace } from "@/routes/feature-registry"

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

const TOUR_BUTTON_STEP: TourStep = {
  anchor: TOUR_ANCHORS.tourButton,
  description:
    "Bấm biểu tượng ? bất cứ lúc nào để xem lại hướng dẫn của trang đang mở. Các hộp thoại cũng có biểu tượng ? riêng ở góc trên.",
  side: "bottom",
  title: "Xem lại hướng dẫn",
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
    SIDEBAR_STEP,
    SEARCH_STEP,
    TOUR_BUTTON_STEP,
  ],
  "system-admin": [
    {
      description:
        "Đây là nơi bạn quản lý người dùng, phân quyền, nội dung, mô hình AI và cấu hình hệ thống UniSage. Hướng dẫn ngắn này giới thiệu các khu vực chính.",
      title: "Chào mừng đến không gian Quản trị hệ thống",
    },
    SIDEBAR_STEP,
    SEARCH_STEP,
    {
      anchor: TOUR_ANCHORS.accountMenu,
      description:
        "Xem thông tin cá nhân, đổi mật khẩu, về trang chủ hoặc đăng xuất.",
      side: "bottom",
      title: "Tài khoản",
    },
    TOUR_BUTTON_STEP,
  ],
}

const STATUS_ROW_ACTIONS =
  "Bấm biểu tượng ⋯ để Xem chi tiết, Chỉnh sửa hoặc Vô hiệu hoá. Mục đã vô hiệu hoá vẫn được giữ lại và có thể Khôi phục bất cứ lúc nào."

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
    searchStep("Tìm theo tên phòng ban hoặc nội dung mô tả."),
    toolbarStep(
      "Lọc theo loại đơn vị (trường, khoa, phòng, bộ môn...) và theo trạng thái hoạt động."
    ),
    FILTER_ACTIONS_STEP,
    {
      anchor: TOUR_ANCHORS.departmentViewMode,
      description:
        "Chuyển giữa dạng Sơ đồ tổ chức (cây phân cấp) và dạng Danh sách (bảng).",
      side: "bottom",
      title: "Chế độ xem",
    },
    {
      anchor: TOUR_ANCHORS.deptOrgChart,
      description:
        "Kéo để di chuyển, cuộn để phóng to/thu nhỏ. Bấm vào một đơn vị để xem chi tiết; bấm mũi tên cạnh tên để thu gọn hoặc mở rộng các đơn vị con.",
      side: "top",
      title: "Sơ đồ tổ chức",
    },
    {
      anchor: TOUR_ANCHORS.deptLayoutToggle,
      description: "Đổi hướng trình bày sơ đồ: theo chiều ngang hoặc dọc.",
      side: "right",
      title: "Bố cục sơ đồ",
    },
    {
      anchor: TOUR_ANCHORS.deptNodeActions,
      description:
        "Menu của từng đơn vị: xem chi tiết, thêm đơn vị trực thuộc, chỉnh sửa hoặc vô hiệu hoá.",
      side: "right",
      title: "Thao tác trên đơn vị",
    },
    tableStep(
      "Ở chế độ Danh sách, mỗi dòng là một đơn vị kèm đơn vị cha, loại và trạng thái."
    ),
    rowActionsStep(STATUS_ROW_ACTIONS),
  ],
  "admin-users": [
    headerStep(
      "Quản lý người dùng",
      "Quản lý tài khoản, vai trò và phòng ban của người dùng trong UniSage."
    ),
    actionsStep(
      "Thêm người dùng",
      "Mở trang tạo tài khoản mới: nhập thông tin cá nhân, mật khẩu khởi tạo, vai trò và phòng ban được truy cập."
    ),
    searchStep("Tìm theo họ tên, email hoặc mã GV/SV."),
    toolbarStep(
      "Lọc theo trạng thái tài khoản: đang hoạt động hoặc đã vô hiệu hoá."
    ),
    FILTER_ACTIONS_STEP,
    bulkSelectStep(
      "Đánh dấu ô này để chọn mọi người dùng trong trang, hoặc tick từng dòng. Khi có lựa chọn, thanh thao tác hàng loạt xuất hiện để vô hiệu hoá hoặc khôi phục cùng lúc."
    ),
    tableStep(
      "Mỗi dòng gồm họ tên, email, mã GV/SV, vai trò và trạng thái. Bấm vào dòng để mở trang chi tiết người dùng."
    ),
    rowActionsStep(
      "Xem chi tiết, chỉnh sửa thông tin và phân quyền, hoặc vô hiệu hoá / khôi phục tài khoản. Tài khoản bị vô hiệu hoá không thể đăng nhập."
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
      "Nút thêm thay đổi theo tab đang mở: tạo vai trò mới ở tab vai trò, khai báo quyền hạn mới ở tab quyền hạn."
    ),
    tabsStep("Hai nhóm cấu hình: vai trò và danh mục quyền hạn."),
    tabStep(
      "roles",
      "Cấu hình vai trò",
      "Danh sách vai trò, số quyền được gán và gói hạn mức của từng vai trò."
    ),
    tabStep(
      "permissions",
      "Cấu hình quyền hạn",
      "Toàn bộ quyền hạn hệ thống (dạng TÀI_NGUYÊN_HÀNH_ĐỘNG). Quyền bị vô hiệu hoá sẽ không còn tác dụng với mọi vai trò."
    ),
    // Only the active tab's panel is mounted, so this step shows up only
    // when the tour is replayed from the permissions tab.
    tabPanelStep(
      "permissions",
      "Danh mục quyền hạn",
      "Quyền hạn được nhóm theo tài nguyên. Chỉ quyền đang hoạt động mới có thể gán cho vai trò."
    ),
    searchStep("Tìm vai trò hoặc quyền hạn theo tên."),
    toolbarStep(
      "Ở tab vai trò, lọc theo quyền được gán và trạng thái; ở tab quyền hạn, lọc theo trạng thái."
    ),
    FILTER_ACTIONS_STEP,
    bulkSelectStep(
      "Chọn nhiều dòng để vô hiệu hoá hoặc khôi phục hàng loạt qua thanh thao tác xuất hiện phía trên bảng."
    ),
    tableStep(
      "Bấm vào một vai trò để mở trang chi tiết với đầy đủ quyền hạn được cấp."
    ),
    rowActionsStep(STATUS_ROW_ACTIONS),
    PAGINATION_STEP,
  ],
  "admin-access-levels": [
    headerStep(
      "Cấp độ truy cập",
      "Các ngưỡng cấp độ dùng để giới hạn ai được truy cập tài liệu nào. Tài liệu có cấp độ cao hơn người dùng sẽ bị ẩn với họ."
    ),
    actionsStep("Thêm cấp độ mới", "Khai báo một ngưỡng cấp độ truy cập mới."),
    tableStep(
      "Mỗi dòng là một cấp độ (số nguyên) kèm mô tả ý nghĩa. Số càng lớn, quyền truy cập càng cao."
    ),
    rowActionsStep(STATUS_ROW_ACTIONS),
    PAGINATION_STEP,
  ],
  "admin-tickets": [
    headerStep(
      "Yêu cầu hỗ trợ",
      "Các câu trả lời của trợ lý mà người dùng đã báo cáo. Xem chi tiết, cập nhật trạng thái và phản hồi người dùng tại đây."
    ),
    searchStep("Tìm yêu cầu theo tiêu đề."),
    toolbarStep(
      "Lọc theo trạng thái xử lý (Chờ xử lý, Đang xử lý, Đã giải quyết, Đã đóng) hoặc theo loại báo cáo, ví dụ AI không trả lời được hay nghi ngờ lộ thông tin bảo mật."
    ),
    FILTER_ACTIONS_STEP,
    tableStep(
      "Bấm vào một yêu cầu để xem đoạn hội thoại liên quan, cập nhật trạng thái và gửi phản hồi cho người dùng."
    ),
    PAGINATION_STEP,
  ],
  "admin-usage-limits": [
    headerStep(
      "Cấu hình hạn mức",
      "Quản lý các gói hạn mức token theo 24 giờ và 7 ngày, rồi gắn gói cho vai trò để kiểm soát mức sử dụng AI."
    ),
    actionsStep("Thêm gói hạn mức", "Tạo một gói hạn mức token mới."),
    searchStep("Tìm gói hạn mức theo tên."),
    toolbarStep(
      "Lọc theo loại gói: Mặc định, Có giới hạn hoặc Không giới hạn."
    ),
    FILTER_ACTIONS_STEP,
    tableStep(
      "Mỗi gói hiển thị hạn mức token cho 24 giờ và 7 ngày. Gói mặc định áp dụng cho khách và các vai trò chưa được gán gói."
    ),
    rowActionsStep(
      "Xem chi tiết, chỉnh sửa hoặc vô hiệu hoá gói. Muốn gán gói cho vai trò, mở trang sửa vai trò ở mục Vai trò & phân quyền."
    ),
    PAGINATION_STEP,
  ],
  categories: [
    headerStep(
      "Danh mục tài liệu",
      "Danh mục dùng để phân loại tài liệu, giúp tìm kiếm và trả lời chính xác hơn."
    ),
    actionsStep("Thêm danh mục mới", "Tạo một danh mục tài liệu mới."),
    tableStep("Mỗi dòng gồm tên, mô tả và trạng thái của danh mục."),
    rowActionsStep(STATUS_ROW_ACTIONS),
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
      "Mỗi dòng cho biết danh mục, phòng ban, trạng thái xử lý và phạm vi chia sẻ của tài liệu."
    ),
    rowActionsStep(
      "Xem chi tiết, Quản lý chunk đã lập chỉ mục, tiếp tục Xử lý nạp liệu (xem trước → chia đoạn → embedding) hoặc Chỉnh sửa thông tin và thay tệp."
    ),
    PAGINATION_STEP,
  ],
  "admin-logs": [
    headerStep(
      "Nhật ký hệ thống",
      "Toàn bộ thao tác thêm, sửa, xoá dữ liệu: ai đã làm gì, vào lúc nào."
    ),
    searchStep(
      "Tìm theo mã người thực hiện, ví dụ SA-001. Thao tác tự động được ghi là Hệ thống."
    ),
    toolbarStep(
      "Lọc theo đối tượng bị thay đổi (người dùng, vai trò, tài liệu...), loại hành động và ngày thực hiện."
    ),
    FILTER_ACTIONS_STEP,
    tableStep(
      "Bấm vào một bản ghi để xem chi tiết các trường đã thay đổi, giá trị trước và sau."
    ),
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
    tabsStep("Hai nhóm: danh sách mô hình và kết quả xác minh kết nối."),
    tabStep(
      "models",
      "Mô hình",
      "Các mô hình đã khai báo cùng trạng thái hoạt động, trạng thái xác minh và độ ưu tiên dùng khi chọn mô hình."
    ),
    tabStep(
      "jobs",
      "Jobs xác minh",
      "Mỗi lần thêm hoặc đổi cấu hình mô hình, hệ thống tạo một job gọi thử nhà cung cấp. Xem tại đây job nào thành công, đang thử lại hay thất bại và lý do."
    ),
    searchStep("Tìm theo tên mô hình, nhà cung cấp hoặc API Base URL."),
    toolbarStep(
      "Lọc theo trạng thái hoạt động, mục đích sử dụng, trạng thái xác minh và sắp xếp theo độ ưu tiên (0 là cao nhất)."
    ),
    FILTER_ACTIONS_STEP,
    tableStep(
      "Bấm vào một mô hình để xem cấu hình, lỗi gần đây và kết quả xác minh gần nhất."
    ),
    rowActionsStep(
      "Xem chi tiết, chỉnh sửa cấu hình (sẽ được xác minh lại) hoặc vô hiệu hoá mô hình."
    ),
    PAGINATION_STEP,
  ],
  "admin-cost-management": [
    headerStep(
      "Chi phí AI",
      "Theo dõi chi phí AI theo mục đích, nhà cung cấp và mô hình; quản lý ngân sách và cảnh báo vượt ngưỡng."
    ),
    tabsStep("Năm nhóm chức năng, mỗi tab có thể mở trực tiếp qua đường dẫn."),
    tabStep(
      "overview",
      "Tổng quan",
      "Chi phí tháng này, mức dùng ngân sách và biểu đồ chi phí theo mục đích, nhà cung cấp, mô hình và theo ngày."
    ),
    tabStep(
      "budgets",
      "Ngân sách",
      "Đặt giới hạn chi phí theo ngày/tháng cho toàn hệ thống, từng nhà cung cấp hoặc từng mục đích."
    ),
    tabStep(
      "alerts",
      "Cảnh báo",
      "Cấu hình ngưỡng cảnh báo khi chi phí sắp chạm ngân sách và xem lịch sử các cảnh báo đã gửi."
    ),
    tabStep(
      "pricing",
      "Mô hình và Bảng giá",
      "Giá theo triệu token của từng mô hình. Giá được đồng bộ từ LiteLLM mỗi ngày; giá chỉnh tay không bị ghi đè."
    ),
    tabStep(
      "history",
      "Lịch sử",
      "Từng request gọi AI: ai gọi, mục đích, token, độ trễ và chi phí. Bấm vào một dòng để xem chi tiết."
    ),
    {
      anchor: TOUR_ANCHORS.costOverviewFilters,
      description:
        "Lọc toàn bộ số liệu bên dưới theo mục đích (trò chuyện, nạp liệu...) và nhà cung cấp. Nút làm mới tải lại dữ liệu mới nhất.",
      side: "bottom",
      title: "Bộ lọc tổng quan",
    },
    {
      anchor: TOUR_ANCHORS.costOverviewKpis,
      description:
        "Chi phí tháng này, thay đổi so với tháng trước và phần ngân sách còn lại.",
      side: "bottom",
      title: "Chỉ số chi phí",
    },
    {
      anchor: TOUR_ANCHORS.costOverviewCharts,
      description:
        "Tỷ trọng chi phí theo mục đích và phân rã theo nhà cung cấp hoặc mô hình.",
      side: "top",
      title: "Biểu đồ chi phí",
    },
    {
      anchor: TOUR_ANCHORS.costTabActions,
      description:
        "Thêm mục mới cho tab này. Ở tab Bảng giá, Đồng bộ ngay để lấy giá LiteLLM mới nhất.",
      side: "bottom",
      title: "Thao tác",
    },
    {
      anchor: TOUR_ANCHORS.costAlertSettings,
      description:
        "Đặt các ngưỡng phần trăm ngân sách sẽ kích hoạt cảnh báo và chọn kênh gửi: trong ứng dụng hoặc qua email.",
      side: "bottom",
      title: "Cài đặt cảnh báo",
    },
    {
      anchor: TOUR_ANCHORS.costAlertHistory,
      description: "Các cảnh báo đã được kích hoạt và thời điểm gửi.",
      side: "top",
      title: "Lịch sử cảnh báo",
    },
    {
      anchor: TOUR_ANCHORS.costHistoryFilters,
      description:
        "Lọc request theo mục đích, nhà cung cấp, mô hình, trạng thái hoặc email/IP người gọi.",
      side: "bottom",
      title: "Lọc lịch sử",
    },
    tableStep(
      "Bấm vào một dòng để xem chi tiết; menu ⋯ (nếu có) chứa các thao tác sửa hoặc xoá."
    ),
    PAGINATION_STEP,
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
    PAGINATION_STEP,
  ],
  "admin-settings": [
    headerStep(
      "Cài đặt hệ thống",
      "Các tham số cấu hình toàn hệ thống, chia theo nhóm."
    ),
    tabsStep("Mỗi tab là một nhóm tham số."),
    tabStep("GENERAL", "Chung", "Các thiết lập chung của toàn hệ thống."),
    tabStep(
      "SECURITY",
      "Bảo mật",
      "Các tham số liên quan đến bảo mật và đăng nhập."
    ),
    tabStep(
      "CHAT",
      "Trò chuyện",
      "Các tham số của trợ lý AI khi trò chuyện với người dùng."
    ),
    tabStep(
      "INGEST",
      "Nạp liệu",
      "Các tham số mặc định khi xử lý, chia đoạn và embedding tài liệu, được chia thành từng nhóm nhỏ."
    ),
    tabStep("AUDIT", "Nhật ký", "Các tham số về việc ghi nhật ký hệ thống."),
    tabStep("MAINTENANCE", "Bảo trì", "Các tham số phục vụ bảo trì hệ thống."),
    {
      anchor: TOUR_ANCHORS.settingsSave,
      description:
        "Nút lưu chỉ bật khi có thay đổi. Thay đổi có hiệu lực ngay cho toàn hệ thống, nên kiểm tra kỹ trước khi lưu.",
      side: "top",
      title: "Lưu thay đổi",
    },
  ],
  "ingester-processing": [
    headerStep(
      "Hàng đợi xử lý tài liệu",
      "Xem trước, chia đoạn và bắt đầu embedding cho từng tài liệu."
    ),
    {
      anchor: TOUR_ANCHORS.processingList,
      description:
        "Các tài liệu đang chờ xử lý cùng trạng thái hiện tại của từng tài liệu.",
      side: "top",
      title: "Tài liệu chờ xử lý",
    },
    {
      anchor: TOUR_ANCHORS.processingAction,
      description:
        "Mở trình hướng dẫn 3 bước: xem trước nội dung, kiểm tra/chỉnh các đoạn đã chia rồi bắt đầu embedding. Tiến trình dở dang được lưu lại.",
      side: "left",
      title: "Xử lý nạp liệu",
    },
    PAGINATION_STEP,
  ],
}
