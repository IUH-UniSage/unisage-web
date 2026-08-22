export type Conversation = {
  date: string
  id: string
  pinned: boolean
  title: string
}

export type ChatSource = {
  meta: string
  title: string
}

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    date: "Hôm nay",
    id: "graduation-requirements",
    pinned: false,
    title: "Điều kiện tốt nghiệp ngành Công nghệ thông tin",
  },
  {
    date: "Hôm nay",
    id: "course-retake",
    pinned: false,
    title: "Đăng ký học lại học phần",
  },
  {
    date: "Hôm qua",
    id: "student-health-insurance",
    pinned: false,
    title: "Bảo hiểm y tế sinh viên",
  },
  {
    date: "22/07",
    id: "tuition-extension",
    pinned: false,
    title: "Gia hạn đóng học phí",
  },
]

export const CHAT_SOURCES: ChatSource[] = [
  {
    meta: "Quyết định 1540/QĐ-ĐHCN · 2025",
    title: "Quy chế đào tạo đại học",
  },
  {
    meta: "Mục 4.2 · Cập nhật tháng 02/2026",
    title: "Sổ tay Khoa Công nghệ thông tin",
  },
  {
    meta: "Phòng Đào tạo",
    title: "Quy trình xét tốt nghiệp",
  },
]
