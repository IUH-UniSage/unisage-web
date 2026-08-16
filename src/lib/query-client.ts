import type { QueryKey } from "@tanstack/react-query"
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { QUERY_POLICIES } from "@/constants/query-policies"
import { getErrorMessage } from "@/utils/error-handler"

type UniSageQueryMeta = Record<string, unknown> & {
  suppressGlobalError?: boolean
}

type UniSageMutationMeta = UniSageQueryMeta & {
  invalidatesQuery?: QueryKey
  successMessage?: string
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: UniSageMutationMeta
    queryMeta: UniSageQueryMeta
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...QUERY_POLICIES.list,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (!mutation.meta?.suppressGlobalError) {
        toast.error(getErrorMessage(error))
      }
    },
    onSettled: (_data, error, _variables, _context, mutation) => {
      if (mutation.meta?.invalidatesQuery) {
        void queryClient.invalidateQueries({
          queryKey: mutation.meta.invalidatesQuery,
        })
      }
      if (!error && mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage)
      }
    },
  }),
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (!query.meta?.suppressGlobalError) {
        toast.error(getErrorMessage(error))
      }
    },
  }),
})
