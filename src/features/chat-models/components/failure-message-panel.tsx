import { AlertTriangle, Check, Copy } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { parseFailureMessage } from "@/features/chat-models/utils/chat-model-formatters"

type FailureMessagePanelProps = {
  message?: string | null
}

// Renders an admin failure message (credential health `lastErrorMessage`,
// verification job `errorMessage`): the cause first, then the provider's own
// status/model/message, with the full redacted log one click away.
export function FailureMessagePanel({ message }: FailureMessagePanelProps) {
  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)

  const view = parseFailureMessage(message)
  if (!view) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(view.rawMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasProviderDetail = Boolean(
    view.statusCode || view.errorStatus || view.modelName
  )

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs dark:bg-destructive/20">
        <div className="flex items-start gap-2">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <div className="min-w-0 space-y-2">
            <p className="leading-relaxed font-medium wrap-break-word whitespace-pre-wrap text-destructive">
              {view.summary}
            </p>
            {hasProviderDetail ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {view.statusCode ? (
                  <Badge
                    className="h-5 font-mono text-[10px] font-bold"
                    variant="destructive"
                  >
                    HTTP {view.statusCode}
                  </Badge>
                ) : null}
                {view.errorStatus ? (
                  <Badge
                    className="h-5 font-mono text-[10px]"
                    variant="outline"
                  >
                    {view.errorStatus}
                  </Badge>
                ) : null}
                {view.modelName ? (
                  <Badge
                    className="h-5 font-mono text-[10px]"
                    variant="outline"
                  >
                    {view.modelName}
                  </Badge>
                ) : null}
              </div>
            ) : null}
            {view.providerMessage ? (
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Phản hồi từ nhà cung cấp
                </p>
                <p className="leading-relaxed wrap-break-word whitespace-pre-wrap text-foreground/80">
                  {view.providerMessage}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          className="cursor-pointer text-[11px] font-medium text-muted-foreground underline hover:text-foreground"
          onClick={() => setShowRaw(!showRaw)}
          type="button"
        >
          {showRaw ? "Ẩn log kỹ thuật đầy đủ" : "Xem log kỹ thuật đầy đủ"}
        </button>
        {showRaw ? (
          <Button
            className="h-6 cursor-pointer gap-1 text-[11px]"
            onClick={handleCopy}
            size="sm"
            type="button"
            variant="ghost"
          >
            {copied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3" />
            )}
            {copied ? "Đã sao chép" : "Sao chép log"}
          </Button>
        ) : null}
      </div>

      {showRaw ? (
        <pre className="max-h-48 overflow-auto rounded-md border bg-muted/60 p-2.5 font-mono text-[11px] wrap-break-word whitespace-pre-wrap text-muted-foreground">
          {view.rawMessage}
        </pre>
      ) : null}
    </div>
  )
}
