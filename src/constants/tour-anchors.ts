// `data-tour` values the product tour (src/features/product-tour) points its
// steps at. Lives in constants rather than the feature so shared layout/list
// components can carry an anchor without importing a feature module.
export const TOUR_ANCHORS = {
  // Staff workspace shell
  accountMenu: "account-menu",
  sidebarNav: "sidebar-nav",
  themeToggle: "theme-toggle",
  tourButton: "tour-button",
  workspaceSearch: "workspace-search",

  // Shared page building blocks
  dataTable: "data-table",
  listToolbar: "list-toolbar",
  pageActions: "page-actions",
  pageHeader: "page-header",
  pageTabs: "page-tabs",
  pagination: "pagination",

  // Page-specific
  departmentViewMode: "department-view-mode",
  healthHistory: "health-history",
  healthLive: "health-live",
  ingesterActivity: "ingester-activity",
  ingesterMetrics: "ingester-metrics",
  ingesterQueue: "ingester-queue",
  overviewActivity: "overview-activity",
  overviewHealth: "overview-health",
  overviewMetrics: "overview-metrics",
  overviewShortcuts: "overview-shortcuts",
  processingList: "processing-list",
} as const

export type TourAnchor = (typeof TOUR_ANCHORS)[keyof typeof TOUR_ANCHORS]

export function tourAnchor(anchor: TourAnchor) {
  return { "data-tour": anchor } as const
}

export function tourAnchorSelector(anchor: TourAnchor): string {
  return `[data-tour="${anchor}"]`
}
