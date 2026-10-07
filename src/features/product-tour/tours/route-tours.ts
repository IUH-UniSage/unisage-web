import { matchPath } from "react-router-dom"

import { ROUTES } from "@/constants/paths"
import { TOUR_ANCHORS } from "@/constants/tour-anchors"
import {
  actionsStep,
  fieldStep,
  FORM_FOOTER_STEP,
  headerStep,
  PAGINATION_STEP,
  type TourStep,
} from "@/features/product-tour/tours/tour-step"

export type RouteTour = {
  key: string
  // Absolute route patterns, checked in order: put `/new` before `/:id`.
  paths: readonly string[]
  steps: readonly TourStep[]
}

const PERMISSION_MATRIX_STEPS: TourStep[] = [
  fieldStep(
    TOUR_ANCHORS.permissionMatrixToolbar,
    "Tìm quyền hạn",
    "Tìm theo tên, mã hoặc mô tả quyền. Mở rộng tất cả / Thu gọn tất cả để xem nhanh mọi nhóm."
  ),
  fieldStep(
    TOUR_ANCHORS.permissionMatrixGroups,
    "Nhóm quyền theo tài nguyên",
    "Mỗi thẻ là một tài nguyên (người dùng, tài liệu...). Mở thẻ để tick từng hành động, hoặc dùng Chọn tất cả / Bỏ chọn cho cả nhóm.",
    "top"
  ),
]

const documentPaths = (suffix: string) => [
  `${ROUTES.adminDocuments}${suffix}`,
  `${ROUTES.ingesterDocuments}${suffix}`,
]

// Detail / create / edit screens that live under a list page but aren't in
// FEATURE_REGISTRY themselves.
export const ROUTE_TOURS: readonly RouteTour[] = [
  {
    key: "user-form",
    paths: [`${ROUTES.adminUsers}/new`, `${ROUTES.adminUsers}/:userId/edit`],
    steps: [
      headerStep(
        "Biểu mẫu người dùng",
        "Tạo tài khoản mới hoặc cập nhật thông tin, vai trò và phòng ban của một người dùng."
      ),
      fieldStep(
        TOUR_ANCHORS.userFormName,
        "Họ và tên",
        "Họ và Tên là bắt buộc, được dùng để hiển thị trong toàn hệ thống."
      ),
      fieldStep(
        TOUR_ANCHORS.userFormContact,
        "Email & số điện thoại",
        "Email là tên đăng nhập và phải là duy nhất. Số điện thoại không bắt buộc."
      ),
      fieldStep(
        TOUR_ANCHORS.userFormAccount,
        "Mã định danh & mật khẩu",
        "Mã GV/SV giúp tìm kiếm và đối chiếu. Khi tạo mới, nhập mật khẩu khởi tạo (bấm biểu tượng mắt để xem) rồi gửi cho người dùng; họ có thể tự đổi mật khẩu sau khi đăng nhập."
      ),
      fieldStep(
        TOUR_ANCHORS.userFormRole,
        "Vai trò hệ thống",
        "Vai trò quyết định người dùng được làm gì và hạn mức sử dụng AI. Chỉ vai trò đang hoạt động mới xuất hiện ở đây."
      ),
      fieldStep(
        TOUR_ANCHORS.userFormDepartments,
        "Quyền truy cập phòng ban",
        "Thêm các phòng ban người dùng được xem tài liệu và chọn cấp độ truy cập cho từng phòng ban. Đơn vị con tự động kế thừa cấp độ của đơn vị cha (Tự động (cha)) trừ khi bạn chỉnh riêng.",
        "top"
      ),
      actionsStep(
        "Lưu hoặc huỷ",
        "Bấm Tạo người dùng / Lưu thay đổi để lưu. Huỷ để quay lại mà không lưu."
      ),
    ],
  },
  {
    key: "user-detail",
    paths: [`${ROUTES.adminUsers}/:userId`],
    steps: [
      headerStep(
        "Chi tiết người dùng",
        "Toàn bộ thông tin của một tài khoản: danh tính, phân quyền, hạn mức và lịch sử hoạt động."
      ),
      actionsStep(
        "Chỉnh sửa",
        "Quay lại danh sách hoặc mở biểu mẫu chỉnh sửa người dùng (nếu bạn có quyền)."
      ),
      fieldStep(
        TOUR_ANCHORS.userDetailProfile,
        "Thông tin tài khoản & danh tính",
        "Email, số điện thoại, mã GV/SV, vai trò và trạng thái tài khoản."
      ),
      fieldStep(
        TOUR_ANCHORS.userDetailDepartments,
        "Quyền truy cập phòng ban",
        "Các phòng ban người dùng được xem tài liệu cùng cấp độ truy cập. Chuyển giữa dạng Cây và Danh sách ở góc phải.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.userDetailUsage,
        "Hạn mức sử dụng",
        "Lượng token đã dùng trong 24 giờ và 7 ngày so với hạn mức của vai trò. Hạn mức tự làm mới khi hết chu kỳ.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.userDetailHistory,
        "Lịch sử & hoạt động",
        "Lần đăng nhập gần nhất, ngày tạo và người cập nhật gần nhất.",
        "top"
      ),
    ],
  },
  {
    key: "role-form",
    paths: [`${ROUTES.adminRbac}/new`, `${ROUTES.adminRbac}/:roleId/edit`],
    steps: [
      headerStep(
        "Biểu mẫu vai trò",
        "Tạo vai trò mới hoặc chỉnh sửa thông tin và tập quyền của một vai trò."
      ),
      fieldStep(
        TOUR_ANCHORS.roleFormName,
        "Tên vai trò",
        "Viết IN_HOA, phân cách bằng dấu gạch dưới, ví dụ GIANG_VIEN."
      ),
      fieldStep(
        TOUR_ANCHORS.roleFormUsagePlan,
        "Gói hạn mức",
        "Số token người dùng thuộc vai trò này được dùng trong 24 giờ và 7 ngày. Bỏ trống để dùng gói mặc định."
      ),
      fieldStep(
        TOUR_ANCHORS.roleFormSystemToggle,
        "Vai trò hệ thống",
        "Đánh dấu cho các nhóm quyền lõi do hệ thống quản lý."
      ),
      fieldStep(
        TOUR_ANCHORS.roleFormActiveToggle,
        "Kích hoạt vai trò",
        "Chỉ vai trò đang kích hoạt mới có thể gán cho tài khoản."
      ),
      fieldStep(
        TOUR_ANCHORS.rolePermissions,
        "Gán quyền hạn",
        "Số bên cạnh tiêu đề cho biết đã chọn bao nhiêu quyền.",
        "top"
      ),
      ...PERMISSION_MATRIX_STEPS,
      FORM_FOOTER_STEP,
    ],
  },
  {
    key: "role-detail",
    paths: [`${ROUTES.adminRbac}/:roleId`],
    steps: [
      headerStep(
        "Chi tiết vai trò",
        "Trạng thái, loại vai trò và toàn bộ quyền hạn đang được cấp."
      ),
      actionsStep(
        "Chỉnh sửa vai trò",
        "Mở biểu mẫu để đổi thông tin, gói hạn mức hoặc tập quyền của vai trò."
      ),
      fieldStep(
        TOUR_ANCHORS.roleDetailOverview,
        "Thông tin tổng quan",
        "Mô tả vai trò và gói hạn mức đang áp dụng cho người dùng thuộc vai trò này."
      ),
      fieldStep(
        TOUR_ANCHORS.rolePermissions,
        "Quyền hạn được cấp",
        "Các quyền vai trò đang có, nhóm theo tài nguyên.",
        "top"
      ),
      ...PERMISSION_MATRIX_STEPS,
    ],
  },
  {
    key: "document-form",
    paths: [...documentPaths("/new"), ...documentPaths("/:documentId/edit")],
    steps: [
      headerStep(
        "Biểu mẫu tài liệu",
        "Tải tài liệu mới hoặc cập nhật thông tin, phân loại và phạm vi chia sẻ của tài liệu."
      ),
      fieldStep(
        TOUR_ANCHORS.documentFormBasic,
        "Thông tin cơ bản",
        "Tiêu đề hiển thị trong danh sách và trong trích dẫn câu trả lời của trợ lý."
      ),
      fieldStep(
        TOUR_ANCHORS.documentFormSource,
        "Nguồn tài liệu & tệp tin",
        "Bấm hoặc kéo thả để chọn tệp. Khi chỉnh sửa, bạn xem trước tệp hiện tại; tải tệp mới sẽ thay thế và tệp cũ được lưu trong lịch sử phiên bản.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.documentFormClassification,
        "Phân loại & cấp độ truy cập",
        "Chọn danh mục, phòng ban sở hữu và cấp độ truy cập tối thiểu. Tài liệu cần có phòng ban và cấp độ trước khi đưa vào xử lý nạp liệu.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.documentFormScope,
        "Phạm vi chia sẻ",
        "Bật Công khai tài liệu để mọi người dùng truy cập được mà không cần đăng nhập hay cấp độ truy cập.",
        "top"
      ),
      FORM_FOOTER_STEP,
    ],
  },
  {
    key: "document-chunks",
    paths: documentPaths("/:documentId/chunks"),
    steps: [
      headerStep(
        "Quản lý chunk",
        "Toàn bộ các đoạn (chunk) của tài liệu đang được lập chỉ mục để trợ lý tìm kiếm và trả lời."
      ),
      actionsStep("Quay lại", "Trở về trang chi tiết tài liệu."),
      fieldStep(
        TOUR_ANCHORS.chunkCard,
        "Một chunk",
        "Mỗi thẻ là một đoạn kèm số thứ tự và loại vùng nội dung (văn bản, bảng...).",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.chunkTabs,
        "Nội dung, tìm kiếm & metadata",
        "Nội dung gốc là phần văn bản được trích; Tìm kiếm nội bộ là tóm tắt và câu hỏi gợi ý dùng để tìm đúng đoạn; Metadata là thông tin vị trí và nguồn."
      ),
      fieldStep(
        TOUR_ANCHORS.chunkDelete,
        "Xóa khỏi chỉ mục",
        "Gỡ một đoạn sai hoặc không cần thiết để trợ lý không dùng nó nữa. Bản nháp chia đoạn gốc không bị ảnh hưởng.",
        "left"
      ),
      PAGINATION_STEP,
    ],
  },
  {
    key: "ingest-wizard",
    paths: [
      ...documentPaths("/:documentId/ingest"),
      `${ROUTES.ingesterProcessing}/:documentId`,
    ],
    steps: [
      headerStep(
        "Xử lý nạp liệu",
        "Đưa tài liệu vào kho tri thức qua 3 bước. Tiến trình được lưu, bạn có thể rời trang và quay lại sau."
      ),
      fieldStep(
        TOUR_ANCHORS.ingestStepper,
        "Các bước",
        "Xem trước → Chia đoạn → Embedding. Bấm ? ở mỗi bước để xem hướng dẫn riêng cho bước đó."
      ),
      fieldStep(
        TOUR_ANCHORS.ingestPreview,
        "Xem trước nội dung",
        "Kiểm tra văn bản trích được từ tệp. Nếu trống, có thể đây là bản scan chỉ có ảnh – hãy tải lên bản có thể chọn chữ. Bấm Tiếp tục để sang bước chia đoạn.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.ingestChunkConfig,
        "Chiến lược phân đoạn",
        "Chọn cách chia đoạn và tham số đi kèm, rồi bấm Áp dụng để tạo bản nháp các đoạn.",
        "right"
      ),
      fieldStep(
        TOUR_ANCHORS.ingestChunkList,
        "Bản đồ đoạn",
        "Danh sách các đoạn đã chia. Đoạn có dấu cảnh báo có thể bị trích xuất sai, nên kiểm tra lại. Bấm một đoạn để mở trong khung chỉnh sửa.",
        "left"
      ),
      fieldStep(
        TOUR_ANCHORS.ingestChunkEditor,
        "Chỉnh sửa đoạn",
        "Chuyển giữa Xem trước và Chỉnh sửa, sửa nội dung rồi Lưu thay đổi, hoặc Xóa đoạn không cần thiết.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.ingestConfirm,
        "Bắt đầu embedding",
        "Khi các đoạn đã ổn, bấm Bắt đầu embedding để lập chỉ mục cho trợ lý.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.ingestEmbedding,
        "Theo dõi embedding",
        "Tiến độ cập nhật trực tiếp. Rời khỏi trang không huỷ tiến trình – embedding vẫn chạy ở máy chủ.",
        "top"
      ),
    ],
  },
  {
    key: "document-detail",
    paths: documentPaths("/:documentId"),
    steps: [
      headerStep(
        "Chi tiết tài liệu",
        "Hồ sơ tài liệu, tệp gốc, các đoạn đã chia và lịch sử thay đổi."
      ),
      actionsStep(
        "Chỉnh sửa tài liệu",
        "Quay lại danh sách hoặc mở biểu mẫu để đổi thông tin, phân loại hay thay tệp."
      ),
      fieldStep(
        TOUR_ANCHORS.documentDetailInfo,
        "Thông tin & phân loại",
        "Danh mục, phòng ban sở hữu, loại tệp và phiên bản, phạm vi và cấp độ truy cập, người tải lên."
      ),
      fieldStep(
        TOUR_ANCHORS.documentDetailFile,
        "Tệp tin & xem trước",
        "Xem trực tiếp nội dung tệp, tải tệp gốc về máy hoặc mở đường dẫn nguồn.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.documentDetailChunks,
        "Các đoạn đã chia",
        "Xem nhanh các đoạn được chia ở bước nạp liệu. Mở trang Quản lý chunk để xem đầy đủ và gỡ đoạn khỏi chỉ mục.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.documentDetailVersions,
        "Lịch sử phiên bản",
        "Các tệp cũ đã bị thay thế bởi bản tải lên mới hơn.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.documentDetailAudit,
        "Thông tin kiểm toán",
        "Ai tạo, ai cập nhật tài liệu và vào lúc nào.",
        "top"
      ),
    ],
  },
  {
    key: "admin-profile",
    paths: [ROUTES.adminProfile],
    steps: [
      headerStep(
        "Hồ sơ của bạn",
        "Thông tin tài khoản quản trị đang đăng nhập."
      ),
      actionsStep(
        "Đổi mật khẩu",
        "Nhập mật khẩu hiện tại và mật khẩu mới (tối thiểu 8 ký tự)."
      ),
      fieldStep(
        TOUR_ANCHORS.profileBasic,
        "Hồ sơ cơ bản",
        "Mã định danh, họ tên, email, số điện thoại và giới tính. Liên hệ quản trị viên nếu cần chỉnh sửa."
      ),
      fieldStep(
        TOUR_ANCHORS.profileAccount,
        "Tài khoản",
        "Vai trò và phạm vi truy cập hiện tại của bạn.",
        "top"
      ),
    ],
  },
]

export function getRouteTourForPath(pathname: string): RouteTour | null {
  return (
    ROUTE_TOURS.find((tour) =>
      tour.paths.some((path) => matchPath(path, pathname))
    ) ?? null
  )
}
