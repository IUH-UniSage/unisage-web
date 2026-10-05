// Search keywords for the staff-workspace header search, keyed by
// FeatureEntry.key (see feature-registry.tsx). Each sidebar item - and each
// tab inside its page - lists Vietnamese and English terms so an admin can
// find "Vai trò & phân quyền" by typing "rbac", "role" or "phan quyen".
//
// Matching is accent-insensitive (see workspace-search.ts), so a keyword only
// needs to be written once with proper Vietnamese diacritics. The item/tab
// label itself is always searchable and doesn't need repeating here.
//
// `tabs[].value` must equal the `?tab=` value the page reads from the URL.

export type WorkspaceSearchTab = {
  keywords: readonly string[]
  label: string
  value: string
}

export type WorkspaceSearchEntry = {
  keywords: readonly string[]
  tabs?: readonly WorkspaceSearchTab[]
}

export const WORKSPACE_SEARCH_KEYWORDS: Record<string, WorkspaceSearchEntry> = {
  "admin-overview": {
    keywords: [
      "tổng quan",
      "trang chủ",
      "bảng điều khiển",
      "thống kê",
      "overview",
      "dashboard",
      "home",
      "summary",
      "statistics",
    ],
  },
  "ingester-overview": {
    keywords: [
      "tổng quan",
      "trang chủ",
      "bảng điều khiển",
      "thống kê nạp liệu",
      "overview",
      "dashboard",
      "home",
      "summary",
    ],
  },
  departments: {
    keywords: [
      "phòng ban",
      "khoa",
      "bộ phận",
      "đơn vị",
      "tổ chức",
      "department",
      "faculty",
      "division",
      "unit",
      "organization",
    ],
  },
  "admin-users": {
    keywords: [
      "người dùng",
      "tài khoản",
      "thành viên",
      "sinh viên",
      "giảng viên",
      "nhân viên",
      "user",
      "users",
      "account",
      "member",
      "student",
      "staff",
    ],
  },
  "admin-rbac": {
    keywords: [
      "vai trò",
      "phân quyền",
      "quyền hạn",
      "quyền truy cập",
      "rbac",
      "role",
      "permission",
      "access control",
      "authorization",
    ],
    tabs: [
      {
        keywords: [
          "vai trò",
          "nhóm quyền",
          "danh sách vai trò",
          "role",
          "roles",
          "role list",
        ],
        label: "Cấu hình vai trò",
        value: "roles",
      },
      {
        keywords: [
          "quyền hạn",
          "quyền",
          "danh sách quyền",
          "permission",
          "permissions",
          "privilege",
        ],
        label: "Cấu hình quyền hạn",
        value: "permissions",
      },
    ],
  },
  "admin-access-levels": {
    keywords: [
      "cấp độ truy cập",
      "mức truy cập",
      "mức độ bảo mật",
      "phân loại tài liệu",
      "access level",
      "clearance",
      "security level",
      "confidentiality",
    ],
  },
  "admin-tickets": {
    keywords: [
      "yêu cầu hỗ trợ",
      "hỗ trợ",
      "phiếu hỗ trợ",
      "khiếu nại",
      "phản hồi",
      "ticket",
      "support",
      "helpdesk",
      "request",
      "feedback",
    ],
  },
  "admin-usage-limits": {
    keywords: [
      "hạn mức",
      "giới hạn",
      "giới hạn sử dụng",
      "định mức",
      "quota",
      "usage limit",
      "rate limit",
      "limit",
      "throttle",
    ],
  },
  categories: {
    keywords: [
      "danh mục",
      "danh mục tài liệu",
      "phân loại",
      "chủ đề",
      "thể loại",
      "category",
      "categories",
      "taxonomy",
      "topic",
      "tag",
    ],
  },
  documents: {
    keywords: [
      "tài liệu",
      "văn bản",
      "quản trị tài liệu",
      "tải lên",
      "kho tri thức",
      "document",
      "documents",
      "file",
      "upload",
      "knowledge base",
      "chunk",
    ],
  },
  "admin-logs": {
    keywords: [
      "nhật ký",
      "nhật ký hệ thống",
      "lịch sử thao tác",
      "kiểm toán",
      "log",
      "logs",
      "audit",
      "audit log",
      "activity",
      "history",
    ],
  },
  "admin-models": {
    keywords: [
      "cấu hình ai",
      "mô hình",
      "mô hình chat",
      "trí tuệ nhân tạo",
      "nhà cung cấp",
      "ai",
      "model",
      "llm",
      "chat model",
      "provider",
      "gpt",
      "claude",
    ],
    tabs: [
      {
        keywords: [
          "mô hình",
          "danh sách mô hình",
          "mô hình chat",
          "model",
          "models",
          "llm",
        ],
        label: "Mô hình",
        value: "models",
      },
      {
        keywords: [
          "jobs xác minh",
          "xác minh",
          "kiểm tra mô hình",
          "tác vụ",
          "verification",
          "verify",
          "job",
          "jobs",
        ],
        label: "Jobs xác minh",
        value: "jobs",
      },
    ],
  },
  "admin-cost-management": {
    keywords: [
      "chi phí",
      "chi phí ai",
      "tiền",
      "thanh toán",
      "cost",
      "costs",
      "billing",
      "spending",
      "expense",
      "token",
    ],
    tabs: [
      {
        keywords: [
          "tổng quan chi phí",
          "thống kê chi phí",
          "biểu đồ",
          "cost overview",
          "summary",
          "chart",
        ],
        label: "Tổng quan",
        value: "overview",
      },
      {
        keywords: ["ngân sách", "dự toán", "budget", "budgets", "allocation"],
        label: "Ngân sách",
        value: "budgets",
      },
      {
        keywords: [
          "cảnh báo",
          "vượt ngưỡng",
          "thông báo chi phí",
          "alert",
          "alerts",
          "threshold",
          "warning",
        ],
        label: "Cảnh báo",
        value: "alerts",
      },
      {
        keywords: [
          "bảng giá",
          "mô hình",
          "giá",
          "đơn giá",
          "giá token",
          "pricing",
          "price",
          "rate",
        ],
        label: "Mô hình và Bảng giá",
        value: "pricing",
      },
      {
        keywords: [
          "lịch sử",
          "lịch sử chi phí",
          "giao dịch",
          "history",
          "transactions",
          "usage history",
        ],
        label: "Lịch sử",
        value: "history",
      },
    ],
  },
  "admin-health": {
    keywords: [
      "tình trạng dịch vụ",
      "sức khỏe hệ thống",
      "trạng thái",
      "giám sát",
      "health",
      "status",
      "monitoring",
      "uptime",
      "service",
    ],
  },
  "admin-settings": {
    keywords: [
      "cài đặt",
      "cấu hình",
      "thiết lập",
      "cài đặt hệ thống",
      "settings",
      "configuration",
      "config",
      "preferences",
    ],
    tabs: [
      {
        keywords: [
          "chung",
          "thông tin chung",
          "tổ chức",
          "general",
          "organization",
        ],
        label: "Chung",
        value: "GENERAL",
      },
      {
        keywords: [
          "bảo mật",
          "phiên đăng nhập",
          "token",
          "security",
          "session",
          "jwt",
        ],
        label: "Bảo mật",
        value: "SECURITY",
      },
      {
        keywords: [
          "nạp liệu",
          "nạp tài liệu",
          "giới hạn tải lên",
          "ingest",
          "ingestion",
          "upload limit",
        ],
        label: "Nạp liệu",
        value: "INGEST",
      },
      {
        keywords: [
          "trò chuyện",
          "lịch sử trò chuyện",
          "hội thoại",
          "chat",
          "conversation",
        ],
        label: "Trò chuyện",
        value: "CHAT",
      },
      {
        keywords: ["nhật ký", "kiểm toán", "audit", "log", "logging"],
        label: "Nhật ký",
        value: "AUDIT",
      },
      {
        keywords: [
          "bảo trì",
          "chế độ bảo trì",
          "maintenance",
          "maintenance mode",
        ],
        label: "Bảo trì",
        value: "MAINTENANCE",
      },
    ],
  },
  "ingester-processing": {
    keywords: [
      "đang xử lý",
      "xử lý",
      "hàng đợi",
      "tiến trình nạp",
      "processing",
      "queue",
      "pipeline",
      "in progress",
      "ingest",
    ],
  },
  "ingester-quality": {
    keywords: [
      "kiểm tra chất lượng",
      "chất lượng",
      "đánh giá",
      "quality",
      "quality check",
      "qa",
      "review",
    ],
  },
  "ingester-settings": {
    keywords: [
      "cài đặt",
      "cài đặt nạp liệu",
      "cấu hình",
      "settings",
      "ingest settings",
      "configuration",
    ],
  },
}
