export const API_ENDPOINTS = {
  // unisage-agent (Python) routes, reached via aiHttpClient - distinct from
  // `documents` below, which is backend-java's `/documents` via httpClient.
  agentDocuments: {
    chunks: (documentId: string) => `/documents/${documentId}/chunks`,
    deleteIndexedChunk: (documentId: string, chunkId: string) =>
      `/documents/${documentId}/chunks/indexed/${encodeURIComponent(chunkId)}`,
    indexedChunks: (documentId: string) =>
      `/documents/${documentId}/chunks/indexed`,
  },
  aiChat: {
    stream: "/chat/stream",
  },
  auditLogs: {
    auditLogs: "/audit-logs",
  },
  systemHealth: {
    health: "/admin/health",
    history: "/admin/health/history",
  },
  dashboard: {
    summary: "/admin/dashboard/summary",
  },
  costManagement: {
    budget: (budgetId: string) => `/budgets/${budgetId}`,
    budgetAlertDismiss: (alertId: string) =>
      `/budget-alerts/${alertId}/dismiss`,
    budgetAlertSettings: "/budget-alert-settings",
    budgetAlerts: "/budget-alerts",
    budgetAlertsActive: "/budget-alerts/active",
    budgets: "/budgets",
    usageLog: (usageLogId: string) => `/usage-logs/${usageLogId}`,
    usageLogSummary: "/usage-logs/summary",
    usageLogs: "/usage-logs",
  },
  categories: {
    categories: "/categories",
    category: (categoryId: string) => `/categories/${categoryId}`,
  },
  documents: {
    documents: "/documents",
    document: (documentId: string) => `/documents/${documentId}`,
    documentCitation: (documentId: string) =>
      `/documents/${documentId}/citation`,
    documentStatus: (documentId: string) => `/documents/${documentId}/status`,
    documentVersions: (documentId: string) =>
      `/documents/${documentId}/versions`,
  },
  departments: {
    accessSuggestion: (parentId: string) =>
      `/departments/${parentId}/access-suggestion`,
    department: (departmentId: string) => `/departments/${departmentId}`,
    departmentRecover: (departmentId: string) =>
      `/departments/${departmentId}/recover`,
    departments: "/departments",
    departmentsRoots: "/departments/roots",
  },
  accessLevels: {
    accessLevel: (accessLevelId: string) => `/access-levels/${accessLevelId}`,
    accessLevels: "/access-levels",
  },
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  chatModels: {
    chatModel: (chatModelId: string) => `/chat-models/${chatModelId}`,
    chatModelRecover: (chatModelId: string) =>
      `/chat-models/${chatModelId}/recover`,
    chatModelStatus: (chatModelId: string) =>
      `/chat-models/${chatModelId}/status`,
    chatModelVerify: (chatModelId: string) =>
      `/chat-models/${chatModelId}/verify`,
    chatModels: "/chat-models",
    verificationJob: (jobId: string) => `/chat-models/verifications/${jobId}`,
    verificationJobs: "/chat-models/verifications",
  },
  conversations: {
    conversation: (conversationId: string) =>
      `/conversations/${conversationId}`,
    conversationClaim: (conversationId: string) =>
      `/conversations/${conversationId}/claim`,
    conversations: "/conversations",
    conversationsGuest: "/conversations/guest",
  },
  messages: {
    message: (messageId: string) => `/messages/${messageId}`,
    messages: "/messages",
    messagesByConversation: (conversationId: string) =>
      `/messages/conversation/${conversationId}`,
  },
  rbac: {
    roles: "/rbac/roles",
    role: (roleId: string) => `/rbac/roles/${roleId}`,
    roleRecover: (roleId: string) => `/rbac/roles/${roleId}/recover`,
    rolesBulkDelete: "/rbac/roles/bulk",
    rolesBulkRecover: "/rbac/roles/bulk/recover",
    permissions: "/rbac/permissions",
    permission: (permissionId: string) => `/rbac/permissions/${permissionId}`,
    permissionRecover: (permissionId: string) =>
      `/rbac/permissions/${permissionId}/recover`,
    permissionsBulkDelete: "/rbac/permissions/bulk",
    permissionsBulkRecover: "/rbac/permissions/bulk/recover",
  },
  ingestion: {
    chunking: "/ingestion/chunking",
    embedding: "/ingestion/embedding",
    events: "/ingestion/events",
    job: (documentId: string) => `/ingestion/jobs/${documentId}`,
    preview: "/ingestion/preview",
  },
  systemConfigs: {
    systemConfig: (configKey: string) => `/system-configs/${configKey}`,
    systemConfigs: "/system-configs",
  },
  tickets: {
    myTicket: (ticketId: string) => `/tickets/my/${ticketId}`,
    myTickets: "/tickets/my",
    ticket: (ticketId: string) => `/tickets/${ticketId}`,
    tickets: "/tickets",
  },
  usageLimitPlans: {
    plan: (planId: string) => `/usage-limit-plans/${planId}`,
    plans: "/usage-limit-plans",
  },
  usageLimits: {
    me: "/usage-limits/me",
  },
  users: {
    me: "/users/me",
    myPassword: "/users/me/password",
    user: (userId: string) => `/users/${userId}`,
    userRecover: (userId: string) => `/users/${userId}/recover`,
    userUsageLimit: (userId: string) => `/users/${userId}/usage-limit`,
    users: "/users",
    usersBulkDelete: "/users/bulk",
    usersBulkRecover: "/users/bulk/recover",
  },
} as const
