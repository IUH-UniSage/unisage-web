import { ROUTES } from "@/constants/paths"
import {
  getWorkspaceNavItems,
  type StaffWorkspace,
} from "@/routes/feature-registry"

const APP_NAME = "UniSage"

const WORKSPACE_ROOTS: Record<StaffWorkspace, string> = {
  ingester: ROUTES.ingester,
  "system-admin": ROUTES.admin,
}

// Pages outside the staff sidebars (client workspace, account, auth).
const STATIC_TITLES: Record<string, string> = {
  [ROUTES.adminProfile]: "Thông tin cá nhân",
  [ROUTES.chat]: "Trò chuyện",
  [ROUTES.home]: "Trang chủ",
  [ROUTES.knowledge]: "Thư viện tri thức",
  [ROUTES.legacySignIn]: "Đăng nhập",
  [ROUTES.login]: "Đăng nhập",
  [ROUTES.notifications]: "Thông báo",
  [ROUTES.profile]: "Thông tin cá nhân",
  [ROUTES.share]: "Cuộc trò chuyện được chia sẻ",
  [ROUTES.sharedLinks]: "Liên kết đã chia sẻ",
  [ROUTES.tickets]: "Yêu cầu hỗ trợ",
}

/** What the trailing segment(s) under a list page mean. */
function subPageLabel(rest: string[]): string | null {
  if (rest.length === 0) return null
  if (rest[0] === "new") return "Thêm mới"
  const last = rest[rest.length - 1]
  if (last === "edit") return "Chỉnh sửa"
  if (last === "chunks") return "Các đoạn"
  if (last === "ingest") return "Nạp liệu"
  return "Chi tiết"
}

function pageTitle(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "") || "/"

  if (STATIC_TITLES[path]) return STATIC_TITLES[path]

  for (const [workspace, root] of Object.entries(WORKSPACE_ROOTS)) {
    if (path !== root && !path.startsWith(`${root}/`)) continue
    // Longest match first so "/admin/users" wins over "/admin".
    const items = getWorkspaceNavItems(workspace as StaffWorkspace).sort(
      (a, b) => b.to.length - a.to.length
    )
    const item = items.find(
      (candidate) =>
        path === candidate.to || path.startsWith(`${candidate.to}/`)
    )
    if (!item) return null
    if (item.to === root && path !== root) return null
    const sub = subPageLabel(
      path.slice(item.to.length).split("/").filter(Boolean)
    )
    return sub ? `${sub} · ${item.label}` : item.label
  }

  // /chat/<id>, /share/<token>, /tickets/<id>
  const [, first] = path.split("/")
  const base = STATIC_TITLES[`/${first}`]
  return base ?? null
}

/**
 * "Quản lý người dùng · UniSage" instead of the same "UniSage" on every tab,
 * so open tabs and browser history can be told apart.
 */
export function getDocumentTitle(pathname: string): string {
  const title = pageTitle(pathname)
  return title ? `${title} · ${APP_NAME}` : APP_NAME
}
