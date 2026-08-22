import type { PropsWithChildren } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { BrowserRouter } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/features/auth/model/auth-provider"
import { queryClient } from "@/lib/query-client"
import { STORAGE_KEYS } from "@/utils/local-storage"

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={STORAGE_KEYS.theme}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              {children}
              <Toaster position="bottom-right" richColors />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
        {import.meta.env.DEV ? <ReactQueryDevtools /> : null}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
