import { TOUR_ANCHORS } from "@/constants/tour-anchors"
import {
  dialogFooterStep,
  dialogHeaderStep,
  fieldStep,
  PAGINATION_STEP,
  tableStep,
  type TourStep,
} from "@/features/product-tour/tours/tour-step"

export type DialogTour = {
  // Anchor that must be on screen before the tour auto-starts, for dialogs
  // that open on a skeleton while their data loads. Defaults to the header.
  readyAnchor?: (typeof TOUR_ANCHORS)[keyof typeof TOUR_ANCHORS]
  steps: readonly TourStep[]
}

const SAVE_FOOTER = dialogFooterStep(
  "Bấm nút lưu để áp dụng, hoặc Hủy / phím Esc để đóng mà không lưu thay đổi."
)

const DETAIL_FOOTER = dialogFooterStep(
  "Đóng hộp thoại, hoặc chuyển sang chỉnh sửa nếu bạn có quyền."
)

// Keyed by the `tourKey` each dialog passes to <DialogTourButton>.
export const DIALOG_TOURS = {
  "access-level-form": {
    steps: [
      dialogHeaderStep(
        "Cấp độ truy cập",
        "Tạo hoặc sửa một ngưỡng cấp độ truy cập tài liệu."
      ),
      fieldStep(
        TOUR_ANCHORS.accessLevelFormLevel,
        "Cấp độ",
        "Số nguyên không âm. Người dùng chỉ thấy tài liệu có cấp độ tối thiểu nhỏ hơn hoặc bằng cấp độ của họ ở phòng ban đó."
      ),
      fieldStep(
        TOUR_ANCHORS.accessLevelFormDescription,
        "Mô tả",
        "Giải thích ý nghĩa của cấp độ để người khác chọn đúng khi phân quyền, ví dụ “Giảng viên” hay “Trưởng khoa”."
      ),
      SAVE_FOOTER,
    ],
  },
  "audit-log-detail": {
    steps: [
      dialogHeaderStep(
        "Chi tiết nhật ký",
        "Một thao tác thay đổi dữ liệu và thời điểm thực hiện."
      ),
      fieldStep(
        TOUR_ANCHORS.auditLogDetailSummary,
        "Ai, làm gì, trên đối tượng nào",
        "Người thực hiện (hoặc Hệ thống), loại hành động, loại đối tượng kèm mã định danh có thể sao chép."
      ),
      fieldStep(
        TOUR_ANCHORS.auditLogDetailChanges,
        "Các trường đã thay đổi",
        "Giá trị trước và sau của từng trường. Thao tác tạo hoặc xoá cả đối tượng không có phần này.",
        "top"
      ),
    ],
  },
  "budget-form": {
    steps: [
      dialogHeaderStep(
        "Ngân sách",
        "Ngân sách là giới hạn mềm: request đang chạy có thể vượt nhẹ khi vừa chạm ngưỡng."
      ),
      fieldStep(
        TOUR_ANCHORS.budgetFormScope,
        "Phạm vi",
        "Áp dụng cho toàn hệ thống, một nhà cung cấp hoặc một mục đích sử dụng. Chọn nhà cung cấp / mục đích cụ thể khi phạm vi yêu cầu."
      ),
      fieldStep(
        TOUR_ANCHORS.budgetFormPeriod,
        "Chu kỳ & giới hạn",
        "Ngân sách tính Hàng ngày hoặc Hàng tháng, với giới hạn tính bằng USD."
      ),
      fieldStep(
        TOUR_ANCHORS.budgetFormAction,
        "Khi vượt ngân sách",
        "Chỉ cảnh báo, Giới hạn đồng thời (đặt số request chạy cùng lúc tối đa) hoặc Từ chối request mới. Hết ngân sách nhà cung cấp sẽ chuyển sang nhà cung cấp khác.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.budgetFormEnabled,
        "Kích hoạt",
        "Mỗi phạm vi + chu kỳ chỉ có một ngân sách được bật.",
        "top"
      ),
      SAVE_FOOTER,
    ],
  },
  "category-form": {
    steps: [
      dialogHeaderStep(
        "Danh mục tài liệu",
        "Tạo hoặc sửa một danh mục dùng để phân loại tài liệu."
      ),
      fieldStep(
        TOUR_ANCHORS.categoryFormName,
        "Tên danh mục",
        "Tên ngắn gọn, dễ nhận biết, hiển thị khi chọn danh mục cho tài liệu."
      ),
      fieldStep(
        TOUR_ANCHORS.categoryFormDescription,
        "Mô tả",
        "Mô tả nội dung thuộc danh mục để người tải tài liệu phân loại đúng."
      ),
      fieldStep(
        TOUR_ANCHORS.categoryFormStatus,
        "Ghi chú trạng thái",
        "Trường tự do, không ảnh hưởng đến việc danh mục có hoạt động hay không. Muốn tắt danh mục, dùng Vô hiệu hoá trong danh sách."
      ),
      SAVE_FOOTER,
    ],
  },
  "change-password": {
    steps: [
      dialogHeaderStep("Đổi mật khẩu", "Đổi mật khẩu đăng nhập của chính bạn."),
      fieldStep(
        TOUR_ANCHORS.passwordCurrent,
        "Mật khẩu hiện tại",
        "Nhập mật khẩu đang dùng để xác nhận đây là bạn."
      ),
      fieldStep(
        TOUR_ANCHORS.passwordNew,
        "Mật khẩu mới",
        "Tối thiểu 8 ký tự và nên khác mật khẩu cũ."
      ),
      fieldStep(
        TOUR_ANCHORS.passwordConfirm,
        "Nhập lại mật khẩu mới",
        "Phải trùng khớp với mật khẩu mới."
      ),
      SAVE_FOOTER,
    ],
  },
  "chat-model-detail": {
    steps: [
      dialogHeaderStep(
        "Chi tiết mô hình",
        "Tên, nhà cung cấp, trạng thái hoạt động và trạng thái xác minh của mô hình."
      ),
      fieldStep(
        TOUR_ANCHORS.chatModelDetailConfig,
        "Cấu hình mô hình",
        "Mục đích, nguồn, API Base URL, giới hạn RPM / đồng thời, độ ưu tiên và các thay đổi đang chờ xác minh."
      ),
      fieldStep(
        TOUR_ANCHORS.chatModelDetailErrors,
        "Lỗi gần đây",
        "Số lỗi đã ghi nhận và lỗi gần nhất khi gọi mô hình, giúp phát hiện khoá API hết hạn hay nhà cung cấp gặp sự cố.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.chatModelDetailVerification,
        "Xác minh gần nhất",
        "Kết quả lần gọi thử gần nhất tới nhà cung cấp, số lần thử và lý do thất bại (nếu có).",
        "top"
      ),
      DETAIL_FOOTER,
    ],
  },
  "chat-model-form": {
    steps: [
      dialogHeaderStep(
        "Mô hình chat",
        "Khai báo hoặc chỉnh sửa một mô hình ngôn ngữ. Mỗi lần lưu, hệ thống sẽ gọi thử nhà cung cấp để xác minh cấu hình."
      ),
      fieldStep(
        TOUR_ANCHORS.chatModelFormSource,
        "Cấu hình cơ bản",
        "Mục đích sử dụng (không đổi được sau khi tạo), nguồn mô hình và nhà cung cấp. Với mô hình tương thích OpenAI, chọn OpenAI rồi đổi API Base URL."
      ),
      fieldStep(
        TOUR_ANCHORS.chatModelFormConnection,
        "Thông tin mô hình & kết nối",
        "Tên mô hình theo đúng tên của nhà cung cấp (vd: gpt-4o-mini), tên gợi nhớ để phân biệt nhiều khoá, và API Base URL.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.chatModelFormApiKey,
        "API key",
        "Khoá API không hiển thị lại sau khi lưu. Khi chỉnh sửa, để trống để giữ nguyên khoá hiện tại."
      ),
      fieldStep(
        TOUR_ANCHORS.chatModelFormLimits,
        "Giới hạn & độ ưu tiên",
        "Giới hạn số request mỗi phút (RPM) và số request đồng thời; để trống nếu không giới hạn. Độ ưu tiên 0 là cao nhất khi hệ thống chọn mô hình.",
        "top"
      ),
      SAVE_FOOTER,
    ],
  },
  "create-ticket": {
    steps: [
      dialogHeaderStep(
        "Báo cáo câu trả lời",
        "Gửi câu trả lời này cho cán bộ xem xét. Câu hỏi và câu trả lời được đính kèm sẵn, bạn chỉ cần mô tả vấn đề."
      ),
      fieldStep(
        TOUR_ANCHORS.ticketFormType,
        "Loại vấn đề",
        "Chọn loại gần nhất, ví dụ AI trả lời sai hoặc AI không trả lời được, để yêu cầu đến đúng người xử lý."
      ),
      fieldStep(
        TOUR_ANCHORS.ticketFormTitle,
        "Tiêu đề",
        "Điền sẵn bằng câu hỏi của bạn. Sửa lại nếu muốn tóm tắt ngắn gọn hơn."
      ),
      fieldStep(
        TOUR_ANCHORS.ticketFormDescription,
        "Mô tả vấn đề",
        "Nói rõ câu trả lời sai ở đâu và bạn mong đợi điều gì, cán bộ sẽ xử lý nhanh hơn.",
        "top"
      ),
      dialogFooterStep(
        "Gửi yêu cầu. Mỗi câu trả lời chỉ báo cáo được một lần; theo dõi kết quả ở mục Yêu cầu hỗ trợ."
      ),
    ],
  },
  "department-detail": {
    steps: [
      dialogHeaderStep(
        "Chi tiết đơn vị",
        "Tên, loại, trạng thái và đơn vị cha của phòng ban."
      ),
      fieldStep(
        TOUR_ANCHORS.deptDetailDescription,
        "Chức năng",
        "Mô tả chức năng, nhiệm vụ của đơn vị."
      ),
      fieldStep(
        TOUR_ANCHORS.deptDetailChildren,
        "Đơn vị trực thuộc",
        "Các đơn vị con trực tiếp. Bấm Thêm trực thuộc ở cuối hộp thoại để tạo đơn vị con mới.",
        "top"
      ),
      dialogFooterStep(
        "Thêm đơn vị trực thuộc, chỉnh sửa đơn vị này hoặc đóng hộp thoại."
      ),
    ],
  },
  "department-form": {
    steps: [
      dialogHeaderStep(
        "Đơn vị",
        "Tạo đơn vị mới trong sơ đồ tổ chức hoặc chỉnh sửa vị trí phân cấp của đơn vị."
      ),
      fieldStep(
        TOUR_ANCHORS.deptFormType,
        "Loại đơn vị",
        "Loại đơn vị quyết định đơn vị có thể trực thuộc đơn vị nào. Đơn vị cấp cao nhất không cần đơn vị cha."
      ),
      fieldStep(
        TOUR_ANCHORS.deptFormName,
        "Tên đơn vị",
        "Tên đầy đủ của đơn vị, ví dụ “Phòng Công nghệ Thông tin”."
      ),
      fieldStep(
        TOUR_ANCHORS.deptFormParent,
        "Trực thuộc",
        "Chọn đơn vị cha. Danh sách chỉ gồm các đơn vị phù hợp với loại đã chọn."
      ),
      fieldStep(
        TOUR_ANCHORS.deptFormDescription,
        "Mô tả chức năng",
        "Chức năng, nhiệm vụ và phạm vi công tác của đơn vị.",
        "top"
      ),
      SAVE_FOOTER,
    ],
  },
  "my-ticket-detail": {
    readyAnchor: TOUR_ANCHORS.ticketDetailContent,
    steps: [
      dialogHeaderStep(
        "Chi tiết yêu cầu",
        "Trạng thái xử lý, nội dung bạn đã báo cáo và phản hồi của cán bộ."
      ),
      fieldStep(
        TOUR_ANCHORS.ticketDetailContent,
        "Nội dung đã gửi",
        "Loại vấn đề, mô tả của bạn, câu hỏi gốc và câu trả lời bị báo cáo."
      ),
      fieldStep(
        TOUR_ANCHORS.ticketDetailResolution,
        "Phản hồi từ cán bộ",
        "Hiện ở đây khi yêu cầu được giải quyết. Yêu cầu Đã đóng sẽ không được cập nhật thêm.",
        "top"
      ),
    ],
  },
  "permission-detail": {
    steps: [
      dialogHeaderStep(
        "Chi tiết quyền hạn",
        "Tên quyền, trạng thái và nhóm tài nguyên mà quyền thuộc về."
      ),
      DETAIL_FOOTER,
    ],
  },
  "permission-form": {
    steps: [
      dialogHeaderStep(
        "Quyền hạn",
        "Khai báo một quyền mới để có thể gán cho vai trò."
      ),
      fieldStep(
        TOUR_ANCHORS.permissionFormName,
        "Tên quyền",
        "Dạng TÀI_NGUYÊN_HÀNH_ĐỘNG, viết in hoa và dùng dấu gạch dưới, ví dụ DOCUMENT_READ. Phần tài nguyên quyết định quyền được xếp vào nhóm nào."
      ),
      fieldStep(
        TOUR_ANCHORS.permissionFormActive,
        "Kích hoạt quyền hạn",
        "Chỉ quyền đang kích hoạt mới có thể gán cho vai trò và có hiệu lực."
      ),
      SAVE_FOOTER,
    ],
  },
  "price-form": {
    steps: [
      dialogHeaderStep(
        "Giá mô hình",
        "Giá tính bằng USD cho mỗi 1 triệu token, chỉ áp dụng cho các lượt gọi sau khi lưu."
      ),
      fieldStep(
        TOUR_ANCHORS.priceFormModel,
        "Nhà cung cấp & mô hình",
        "Chọn đúng nhà cung cấp và tên mô hình như khi khai báo ở Cấu hình AI."
      ),
      fieldStep(
        TOUR_ANCHORS.priceFormRates,
        "Đơn giá",
        "Giá input, output và cache. Bỏ trống giá cache để tính theo giá input; bỏ trống output cho mô hình embedding. Giá chỉnh tay không bị LiteLLM ghi đè.",
        "top"
      ),
      SAVE_FOOTER,
    ],
  },
  "registered-models": {
    steps: [
      dialogHeaderStep(
        "Cấu hình đang đăng ký",
        "Các mô hình chat đang dùng mô hình này, cùng số lượng cấu hình."
      ),
      tableStep(
        "Tên gợi nhớ, mục đích và trạng thái của từng cấu hình dùng mô hình này."
      ),
      PAGINATION_STEP,
    ],
  },
  "ticket-detail": {
    readyAnchor: TOUR_ANCHORS.ticketDetailContent,
    steps: [
      dialogHeaderStep(
        "Yêu cầu hỗ trợ",
        "Một câu trả lời của trợ lý bị người dùng báo cáo."
      ),
      fieldStep(
        TOUR_ANCHORS.ticketDetailContent,
        "Nội dung báo cáo",
        "Người gửi, mô tả vấn đề, câu hỏi gốc của người dùng và câu trả lời bị báo cáo – đủ để bạn đánh giá mà không cần mở lại cuộc trò chuyện."
      ),
      fieldStep(
        TOUR_ANCHORS.ticketFormStatus,
        "Trạng thái xử lý",
        "Chuyển từ Chờ xử lý sang Đang xử lý khi bắt đầu xem xét. Yêu cầu Đã đóng không thể thay đổi nữa.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.ticketFormResolution,
        "Phản hồi cho người dùng",
        "Bắt buộc khi đánh dấu Đã giải quyết. Người dùng sẽ thấy phản hồi này trong mục yêu cầu của họ.",
        "top"
      ),
      dialogFooterStep(
        "Lưu cập nhật trạng thái và phản hồi, hoặc đóng hộp thoại."
      ),
    ],
  },
  "usage-limit-plan-form": {
    steps: [
      dialogHeaderStep(
        "Gói hạn mức",
        "Hạn mức tính bằng token, cho mỗi 24 giờ và mỗi 7 ngày kể từ lượt hỏi đầu tiên."
      ),
      fieldStep(
        TOUR_ANCHORS.usagePlanFormName,
        "Tên gói",
        "Đặt tên theo nhóm người dùng sẽ áp dụng, ví dụ “Giảng viên”."
      ),
      fieldStep(
        TOUR_ANCHORS.usagePlanFormLimits,
        "Hạn mức token",
        "Số token tối đa trong 24 giờ và trong 7 ngày. Để trống nếu không giới hạn."
      ),
      fieldStep(
        TOUR_ANCHORS.usagePlanFormDefault,
        "Gói mặc định",
        "Gói mặc định áp dụng cho khách chưa đăng nhập và vai trò chưa được gán gói. Đặt gói này làm mặc định sẽ thay thế gói mặc định hiện tại.",
        "top"
      ),
      SAVE_FOOTER,
    ],
  },
  "usage-log-detail": {
    steps: [
      dialogHeaderStep(
        "Chi tiết request",
        "Toàn bộ thông tin của một lượt gọi AI."
      ),
      fieldStep(
        TOUR_ANCHORS.usageLogSummary,
        "Tóm tắt",
        "Thời điểm, người gọi hoặc IP, mục đích, trạng thái, tổng chi phí, độ trễ và số token vào / ra / cache."
      ),
      fieldStep(
        TOUR_ANCHORS.usageLogMessages,
        "Câu hỏi & câu trả lời",
        "Nội dung trao đổi của request trò chuyện. Nội dung đã bị người dùng xoá sẽ không còn hiển thị.",
        "top"
      ),
      fieldStep(
        TOUR_ANCHORS.usageLogProviderCalls,
        "Các lượt gọi nhà cung cấp",
        "Một request có thể gọi nhiều mô hình (vd: embedding rồi chat, hoặc chuyển sang nhà cung cấp dự phòng). Mỗi dòng là một lượt gọi kèm token và chi phí.",
        "top"
      ),
    ],
  },
  "verification-job-detail": {
    steps: [
      dialogHeaderStep(
        "Job xác minh",
        "Một lần hệ thống gọi thử nhà cung cấp để kiểm tra cấu hình mô hình."
      ),
      fieldStep(
        TOUR_ANCHORS.verificationJobStatus,
        "Trạng thái",
        "Kết quả xác minh và số lần đã thử. Job thất bại tạm thời sẽ được tự động thử lại."
      ),
      fieldStep(
        TOUR_ANCHORS.verificationJobCandidate,
        "Cấu hình được kiểm tra",
        "Nhà cung cấp, tên mô hình, API Base URL và khoá API đang chờ xác minh, cùng thời điểm bắt đầu, kết thúc và lý do lỗi (nếu có).",
        "top"
      ),
    ],
  },
} satisfies Record<string, DialogTour>

export type DialogTourKey = keyof typeof DIALOG_TOURS
