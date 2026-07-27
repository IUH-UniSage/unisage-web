export const QUERY_POLICIES = {
  detail: { gcTime: 30 * 60 * 1000, staleTime: 10 * 60 * 1000 },
  infinite: { gcTime: 30 * 60 * 1000, staleTime: 10 * 60 * 1000 },
  list: { gcTime: 10 * 60 * 1000, staleTime: 5 * 60 * 1000 },
  realtime: { gcTime: 2 * 60 * 1000, staleTime: 0 },
  static: { gcTime: Infinity, staleTime: Infinity },
} as const

export type QueryPolicyName = keyof typeof QUERY_POLICIES
