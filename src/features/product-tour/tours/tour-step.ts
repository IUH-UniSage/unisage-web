import type { Side } from "driver.js"

import {
  TOUR_ANCHORS,
  tabPanelTourTarget,
  tabTourTarget,
  type TourTarget,
} from "@/constants/tour-anchors"

export type TourStep = {
  // Omit for a centered step not tied to any element. A list means "the
  // first of these that is on screen", e.g. the desktop table or the mobile
  // card list that replaces it below `md`.
  anchor?: TourTarget | readonly TourTarget[]
  description: string
  side?: Side
  title: string
}

export const headerStep = (title: string, description: string): TourStep => ({
  anchor: TOUR_ANCHORS.pageHeader,
  description,
  side: "bottom",
  title,
})

export const actionsStep = (title: string, description: string): TourStep => ({
  anchor: TOUR_ANCHORS.pageActions,
  description,
  side: "bottom",
  title,
})

export const toolbarStep = (description: string): TourStep => ({
  anchor: TOUR_ANCHORS.listToolbar,
  description,
  side: "bottom",
  title: "Tìm kiếm và lọc",
})

export const searchStep = (description: string): TourStep => ({
  anchor: TOUR_ANCHORS.listSearch,
  description,
  side: "bottom",
  title: "Ô tìm kiếm",
})

export const FILTER_ACTIONS_STEP: TourStep = {
  anchor: TOUR_ANCHORS.listFilterActions,
  description:
    "Bộ lọc chỉ được áp dụng khi bấm Lọc. Bấm Đặt lại để xoá mọi điều kiện và quay về danh sách đầy đủ.",
  side: "bottom",
  title: "Áp dụng bộ lọc",
}

export const tableStep = (description: string): TourStep => ({
  anchor: [TOUR_ANCHORS.dataTable, TOUR_ANCHORS.mobileList],
  description,
  side: "top",
  title: "Danh sách",
})

export const rowActionsStep = (description: string): TourStep => ({
  anchor: TOUR_ANCHORS.rowActions,
  description,
  side: "left",
  title: "Thao tác trên từng dòng",
})

export const bulkSelectStep = (description: string): TourStep => ({
  anchor: TOUR_ANCHORS.bulkSelect,
  description,
  side: "right",
  title: "Chọn nhiều dòng",
})

export const tabsStep = (description: string): TourStep => ({
  anchor: TOUR_ANCHORS.pageTabs,
  description,
  side: "bottom",
  title: "Các nhóm chức năng",
})

export const tabStep = (
  value: string,
  title: string,
  description: string
): TourStep => ({
  anchor: tabTourTarget(value),
  description,
  side: "bottom",
  title,
})

export const tabPanelStep = (
  value: string,
  title: string,
  description: string
): TourStep => ({
  anchor: tabPanelTourTarget(value),
  description,
  side: "top",
  title,
})

export const PAGINATION_STEP: TourStep = {
  anchor: TOUR_ANCHORS.pagination,
  description:
    "Chuyển trang khi danh sách dài. Số kết quả hiển thị luôn được cập nhật theo bộ lọc hiện tại.",
  side: "top",
  title: "Phân trang",
}

export const FORM_FOOTER_STEP: TourStep = {
  anchor: TOUR_ANCHORS.formFooterActions,
  description:
    "Lưu hoặc huỷ ngay cuối biểu mẫu, không cần cuộn lại lên đầu trang. Huỷ sẽ bỏ mọi thay đổi chưa lưu.",
  side: "top",
  title: "Lưu thay đổi",
}

export const dialogHeaderStep = (
  title: string,
  description: string
): TourStep => ({
  anchor: TOUR_ANCHORS.dialogHeader,
  description,
  side: "bottom",
  title,
})

export const dialogFooterStep = (description: string): TourStep => ({
  anchor: TOUR_ANCHORS.dialogFooter,
  description,
  side: "top",
  title: "Hoàn tất",
})

export const fieldStep = (
  anchor: TourTarget,
  title: string,
  description: string,
  side: Side = "bottom"
): TourStep => ({ anchor, description, side, title })
