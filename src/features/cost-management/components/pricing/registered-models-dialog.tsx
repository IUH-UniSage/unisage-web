import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getChatModelProviderOption } from "@/features/chat-models/constants/chat-model-providers"
import type { ChatModel } from "@/features/chat-models/schemas/chat-model-schemas"
import {
  getPurposeLabel,
  getStatusLabel,
  STATUS_BADGE_STYLES,
} from "@/features/chat-models/utils/chat-model-formatters"

type RegisteredModelsDialogProps = {
  modelName: string
  models: ChatModel[]
  onOpenChange: (open: boolean) => void
  provider: string
}

export function RegisteredModelsDialog({
  modelName,
  models,
  onOpenChange,
  provider,
}: RegisteredModelsDialogProps) {
  const providerLabel = getChatModelProviderOption(provider)?.label ?? provider

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">{modelName}</DialogTitle>
          <DialogDescription>
            {[providerLabel, `${models.length} cấu hình đang đăng ký`]
              .filter(Boolean)
              .join(" · ")}
          </DialogDescription>
        </DialogHeader>

        <ul className="divide-y rounded-lg border">
          {models.map((model) => (
            <li
              className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5"
              key={model.id}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {model.displayName || (
                    <span className="text-muted-foreground">
                      Chưa đặt tên gợi nhớ
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getPurposeLabel(model.modelPurpose)}
                </p>
              </div>
              <Badge className={STATUS_BADGE_STYLES[model.status]}>
                {getStatusLabel(model.status)}
              </Badge>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
