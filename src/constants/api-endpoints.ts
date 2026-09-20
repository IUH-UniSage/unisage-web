export const API_ENDPOINTS = {
  // unisage-agent (Python) routes, reached via aiHttpClient - distinct from
  // `documents` below, which is backend-java's `/documents` via httpClient.
  agentDocuments: {
    chunks: (documentId: string) => `/documents/${documentId}/chunks`,
  },
  aiChat: {
    stream: "/chat/stream",
  },
  auditLogs: {
    auditLogs: "/audit-logs",
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
    chatModels: "/chat-models",
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
  users: {
    me: "/users/me",
    myPassword: "/users/me/password",
    user: (userId: string) => `/users/${userId}`,
    userRecover: (userId: string) => `/users/${userId}/recover`,
    users: "/users",
    usersBulkDelete: "/users/bulk",
    usersBulkRecover: "/users/bulk/recover",
  },
} as const
