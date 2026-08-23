import { EntityStatusDialog } from "@/components/shared/dialog/entity-status-dialog"
import type { ChatModel } from "@/features/chat-models/schemas/chat-model-schemas"

type ChatModelStatusDialogProps = {
  chatModel: ChatModel
  isSubmitting: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
}

export function ChatModelStatusDialog({
  chatModel,
  isSubmitting,
  onConfirm,
  onOpenChange,
}: ChatModelStatusDialogProps) {
  return (
    <EntityStatusDialog
      assignedToNoun="cuộc trò chuyện"
      entityLabel={chatModel.llmModelName}
      entityNoun="mô hình chat"
      isActive={chatModel.isActive}
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  )
}
