import { Check, Copy, Link2, Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCreateShareMutation } from "@/features/conversations/queries/use-mutations"
import type { CreatedShare } from "@/features/conversations/schemas/share-schemas"
import {
  buildShareUrl,
  copyShareLink,
} from "@/features/conversations/utils/share-link"

type ShareConversationDialogProps = {
  /** The conversation to share; `null` keeps the dialog closed. */
  conversation: { id: string; title: string } | null
  onOpenChange: (open: boolean) => void
}

/**
 * "Chia sẻ" (UNISAGE-107): creates a snapshot link of the conversation. Each
 * click on "Tạo liên kết" makes a new link (spec R3), so the link is only
 * created on an explicit click, never just by opening the dialog.
 */
export function ShareConversationDialog({
  conversation,
  onOpenChange,
}: ShareConversationDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={conversation !== null}>
      {conversation ? (
        // Keyed so a different conversation starts without the previous link.
        <ShareDialogBody conversation={conversation} key={conversation.id} />
      ) : null}
    </Dialog>
  )
}

function ShareDialogBody({
  conversation,
}: {
  conversation: { id: string; title: string }
}) {
  const createShare = useCreateShareMutation()
  const [share, setShare] = useState<CreatedShare | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = () => {
    createShare.mutate(
      { conversationId: conversation.id },
      { onSuccess: (created) => setShare(created) }
    )
  }

  const handleCopy = async () => {
    if (!share) return
    if (await copyShareLink(share.token)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Chia sẻ đoạn chat</DialogTitle>
        <DialogDescription className="break-words">
          {conversation.title}
        </DialogDescription>
      </DialogHeader>

      {share ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            aria-label="Liên kết chia sẻ"
            className="min-w-0 flex-1 font-mono text-xs"
            onFocus={(event) => event.currentTarget.select()}
            readOnly
            value={buildShareUrl(share.token)}
          />
          <Button onClick={() => void handleCopy()} type="button">
            {copied ? (
              <Check aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            Sao chép
          </Button>
        </div>
      ) : null}

      <p className="rounded-lg bg-muted px-3 py-2.5 text-sm leading-6 text-muted-foreground">
        Người nhận cần đăng nhập. Tin nhắn bạn gửi sau khi tạo link sẽ không
        được chia sẻ.
      </p>

      {share ? null : (
        <DialogFooter>
          <Button
            disabled={createShare.isPending}
            onClick={handleCreate}
            type="button"
          >
            {createShare.isPending ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : (
              <Link2 aria-hidden="true" />
            )}
            {createShare.isPending ? "Đang tạo liên kết..." : "Tạo liên kết"}
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
  )
}
