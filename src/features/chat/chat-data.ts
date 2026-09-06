export type ChatSource = {
  meta: string
  title: string
}

// Placeholder content for SourcePanel's UI - not wired to a real message's
// `citations` field yet. Keep this file (and the panel) around as the
// intended slot for that; don't let it read as live data in the meantime -
// see the "Mẫu minh hoạ" badge in source-panel.tsx.
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
