export const departmentKeys = {
  accessSuggestion: (parentId: string, userId: string) =>
    [...departmentKeys.all, "access-suggestion", parentId, userId] as const,
  all: ["departments"] as const,
  list: () => [...departmentKeys.all, "list"] as const,
}
