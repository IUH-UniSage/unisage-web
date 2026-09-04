import { AlertTriangle } from "lucide-react"
import type { ReactNode } from "react"

export function StepActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
      {children}
    </div>
  )
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive shadow-sm"
      role="alert"
    >
      <AlertTriangle className="size-4 shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  )
}
