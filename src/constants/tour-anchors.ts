// `data-tour` values the product tour (src/features/product-tour) points its
// steps at. Lives in constants rather than the feature so shared layout/list
// components can carry an anchor without importing a feature module.
export const TOUR_ANCHORS = {
  // Staff workspace shell
  accountMenu: "account-menu",
  sidebarNav: "sidebar-nav",
  tourButton: "tour-button",
  workspaceSearch: "workspace-search",

  // Shared page building blocks
  bulkSelect: "bulk-select",
  dataTable: "data-table",
  dialogFooter: "dialog-footer",
  dialogHeader: "dialog-header",
  formFooterActions: "form-footer-actions",
  listFilterActions: "list-filter-actions",
  listSearch: "list-search",
  listToolbar: "list-toolbar",
  mobileList: "mobile-list",
  pageActions: "page-actions",
  pageHeader: "page-header",
  pageTabs: "page-tabs",
  pagination: "pagination",
  rowActions: "row-actions",

  // User workspace (home, chat, tickets) - open to guests too
  chatAccount: "chat-account",
  chatComposer: "chat-composer",
  chatGuestSignIn: "chat-guest-sign-in",
  chatHistory: "chat-history",
  chatHistoryToggle: "chat-history-toggle",
  chatNewConversation: "chat-new-conversation",
  chatReplyActions: "chat-reply-actions",
  chatReplyCitations: "chat-reply-citations",
  chatSearch: "chat-search",
  chatSources: "chat-sources",
  homeAsk: "home-ask",
  homeSuggestions: "home-suggestions",
  homeSupport: "home-support",
  homeTopics: "home-topics",
  myTicketFilter: "my-ticket-filter",
  myTicketList: "my-ticket-list",
  ticketDetailResolution: "ticket-detail-resolution",
  ticketFormDescription: "ticket-form-description",
  ticketFormTitle: "ticket-form-title",
  ticketFormType: "ticket-form-type",
  userMobileMenu: "user-mobile-menu",
  userNav: "user-nav",
  userSignIn: "user-sign-in",

  // Page-, form- and dialog-specific
  accessLevelFormDescription: "access-level-form-description",
  accessLevelFormLevel: "access-level-form-level",
  auditLogDetailChanges: "audit-log-detail-changes",
  auditLogDetailSummary: "audit-log-detail-summary",
  budgetFormAction: "budget-form-action",
  budgetFormEnabled: "budget-form-enabled",
  budgetFormPeriod: "budget-form-period",
  budgetFormScope: "budget-form-scope",
  categoryFormDescription: "category-form-description",
  categoryFormName: "category-form-name",
  categoryFormStatus: "category-form-status",
  chatModelDetailConfig: "chat-model-detail-config",
  chatModelDetailErrors: "chat-model-detail-errors",
  chatModelDetailVerification: "chat-model-detail-verification",
  chatModelFormApiKey: "chat-model-form-api-key",
  chatModelFormConnection: "chat-model-form-connection",
  chatModelFormLimits: "chat-model-form-limits",
  chatModelFormSource: "chat-model-form-source",
  chunkCard: "chunk-card",
  chunkDelete: "chunk-delete",
  chunkTabs: "chunk-tabs",
  costAlertHistory: "cost-alert-history",
  costAlertSettings: "cost-alert-settings",
  costHistoryFilters: "cost-history-filters",
  costOverviewCharts: "cost-overview-charts",
  costOverviewFilters: "cost-overview-filters",
  costOverviewKpis: "cost-overview-kpis",
  costTabActions: "cost-tab-actions",
  departmentViewMode: "department-view-mode",
  deptDetailChildren: "dept-detail-children",
  deptDetailDescription: "dept-detail-description",
  deptFormDescription: "dept-form-description",
  deptFormName: "dept-form-name",
  deptFormParent: "dept-form-parent",
  deptFormType: "dept-form-type",
  deptLayoutToggle: "dept-layout-toggle",
  deptNodeActions: "dept-node-actions",
  deptOrgChart: "dept-org-chart",
  documentDetailAudit: "document-detail-audit",
  documentDetailChunks: "document-detail-chunks",
  documentDetailFile: "document-detail-file",
  documentDetailInfo: "document-detail-info",
  documentDetailVersions: "document-detail-versions",
  documentFormBasic: "document-form-basic",
  documentFormClassification: "document-form-classification",
  documentFormScope: "document-form-scope",
  documentFormSource: "document-form-source",
  healthHistory: "health-history",
  healthLive: "health-live",
  ingestChunkConfig: "ingest-chunk-config",
  ingestChunkEditor: "ingest-chunk-editor",
  ingestChunkList: "ingest-chunk-list",
  ingestConfirm: "ingest-confirm",
  ingestEmbedding: "ingest-embedding",
  ingestPreview: "ingest-preview",
  ingestStepper: "ingest-stepper",
  ingesterActivity: "ingester-activity",
  ingesterMetrics: "ingester-metrics",
  ingesterQueue: "ingester-queue",
  overviewActivity: "overview-activity",
  overviewHealth: "overview-health",
  overviewMetrics: "overview-metrics",
  overviewShortcuts: "overview-shortcuts",
  passwordConfirm: "password-confirm",
  passwordCurrent: "password-current",
  passwordNew: "password-new",
  permissionFormActive: "permission-form-active",
  permissionFormName: "permission-form-name",
  permissionMatrixGroups: "permission-matrix-groups",
  permissionMatrixToolbar: "permission-matrix-toolbar",
  priceFormModel: "price-form-model",
  priceFormRates: "price-form-rates",
  processingAction: "processing-action",
  processingList: "processing-list",
  profileAccount: "profile-account",
  profileBasic: "profile-basic",
  profileUsage: "profile-usage",
  roleDetailOverview: "role-detail-overview",
  roleFormActiveToggle: "role-form-active-toggle",
  roleFormName: "role-form-name",
  roleFormSystemToggle: "role-form-system-toggle",
  roleFormUsagePlan: "role-form-usage-plan",
  rolePermissions: "role-permissions",
  settingsSave: "settings-save",
  ticketDetailContent: "ticket-detail-content",
  ticketFormResolution: "ticket-form-resolution",
  ticketFormStatus: "ticket-form-status",
  usageLogMessages: "usage-log-messages",
  usageLogProviderCalls: "usage-log-provider-calls",
  usageLogSummary: "usage-log-summary",
  usagePlanFormDefault: "usage-plan-form-default",
  usagePlanFormLimits: "usage-plan-form-limits",
  usagePlanFormName: "usage-plan-form-name",
  userDetailDepartments: "user-detail-departments",
  userDetailHistory: "user-detail-history",
  userDetailProfile: "user-detail-profile",
  userDetailUsage: "user-detail-usage",
  userFormAccount: "user-form-account",
  userFormContact: "user-form-contact",
  userFormDepartments: "user-form-departments",
  userFormName: "user-form-name",
  userFormRole: "user-form-role",
  verificationJobCandidate: "verification-job-candidate",
  verificationJobStatus: "verification-job-status",
} as const

export type TourAnchor = (typeof TOUR_ANCHORS)[keyof typeof TOUR_ANCHORS]

// Tabs are anchored by their value so a tour can explain every tab without a
// constant per tab: `tab-<value>` on the trigger, `tab-panel-<value>` on the
// panel (only the active panel is mounted, so its steps drop out otherwise).
export type TabTourTarget = `tab-${string}`

export type TourTarget = TabTourTarget | TourAnchor

export function tourAnchor(anchor: TourAnchor) {
  return { "data-tour": anchor } as const
}

export function tabTourAnchor(value: string) {
  return { "data-tour": tabTourTarget(value) } as const
}

export function tabPanelTourAnchor(value: string) {
  return { "data-tour": tabPanelTourTarget(value) } as const
}

export function tabTourTarget(value: string): TabTourTarget {
  return `tab-${value}`
}

export function tabPanelTourTarget(value: string): TabTourTarget {
  return `tab-panel-${value}`
}

export function tourAnchorSelector(target: TourTarget): string {
  return `[data-tour="${target}"]`
}
