import { useEffect, useState } from "react"

import {
  ActiveConversation,
  NewConversation,
} from "@/features/chat/components/chat-conversation-content"
import {
  DesktopChatHeader,
  MobileChatHeader,
} from "@/features/chat/components/chat-workspace-header"
import {
  CollapsedHistoryRail,
  ConversationHistory,
  type ConversationHistoryProps,
} from "@/features/chat/components/conversation-history"
import { SearchConversationDialog } from "@/features/chat/components/search-conversation-dialog"
import { SourcePanel } from "@/features/chat/components/source-panel"
import { useChatWorkspace } from "@/features/chat/hooks/use-chat-workspace"
import { cn } from "@/lib/utils"

export function ChatPage() {
  const workspace = useChatWorkspace()
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [isResizing, setIsResizing] = useState(false)
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)

  // Keyboard shortcuts: Ctrl+K (Search) and Ctrl+Shift+O (New Chat)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K or Cmd+K -> Open Search Dialog
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault()
        setIsSearchDialogOpen((prev) => !prev)
      }

      // Ctrl+Shift+O or Cmd+Shift+O -> Start New Conversation
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "o"
      ) {
        event.preventDefault()
        workspace.startNewConversation()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [workspace])

  const historyProps: ConversationHistoryProps = {
    activeConversationId: workspace.activeConversationId,
    conversations: workspace.conversations,
    onClose: () => workspace.setIsHistoryOpen(false),
    onDeleteConversation: workspace.deleteConversation,
    onNewConversation: workspace.startNewConversation,
    onOpenSearch: () => setIsSearchDialogOpen(true),
    onSelectConversation: workspace.selectConversation,
  }

  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault()
    setIsResizing(true)

    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      const newWidth = mouseMoveEvent.clientX
      if (newWidth < 140) {
        workspace.setIsHistoryOpen(false)
      } else {
        if (!workspace.isHistoryOpen) {
          workspace.setIsHistoryOpen(true)
        }
        setSidebarWidth(Math.min(Math.max(newWidth, 220), 450))
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <MobileChatHeader
        historyContent={<ConversationHistory {...historyProps} />}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar with Resizable Drag Handle (<->) */}
        <aside
          className={cn(
            "relative hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-border/40 bg-muted/40 transition-[width] duration-150 select-none xl:flex dark:border-white/[0.06] dark:bg-muted/15",
            isResizing && "transition-none"
          )}
          style={{
            width: workspace.isHistoryOpen ? `${sidebarWidth}px` : "56px",
          }}
        >
          {workspace.isHistoryOpen ? (
            <ConversationHistory {...historyProps} />
          ) : (
            <CollapsedHistoryRail
              activeConversationId={workspace.activeConversationId}
              onExpand={() => workspace.setIsHistoryOpen(true)}
              onNewConversation={workspace.startNewConversation}
              onOpenSearch={() => setIsSearchDialogOpen(true)}
            />
          )}

          {/* Drag Resize Border (<-> cursor on hover) */}
          <div
            aria-hidden="true"
            className={cn(
              "group absolute top-0 -right-1 z-20 h-full w-2.5 cursor-col-resize hover:bg-primary/20",
              isResizing && "bg-primary/30"
            )}
            onMouseDown={startResizing}
            title="Kéo để thay đổi kích thước thanh bên"
          >
            <div className="absolute top-0 right-1 h-full w-0.5 group-hover:bg-primary/50" />
          </div>
        </aside>

        {/* Center Main Chat Area */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          <DesktopChatHeader
            activeConversation={workspace.activeConversation}
            isSourcesOpen={workspace.isSourcesOpen}
            onOpenSources={() => workspace.setIsSourcesOpen(true)}
          />

          <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
            {workspace.activeConversation ? (
              <ActiveConversation
                isSending={workspace.isSendingMessage}
                messages={workspace.messages}
                onSendMessage={workspace.sendMessage}
              />
            ) : (
              <NewConversation
                isSending={workspace.isSendingMessage}
                onSendMessage={workspace.sendMessage}
              />
            )}
          </section>
        </div>

        {/* Right Source Panel (Pushed all the way to top level, matching Sidebar height) */}
        {workspace.isSourcesOpen ? (
          <SourcePanel
            onClose={() => workspace.setIsSourcesOpen(false)}
            width={sidebarWidth}
          />
        ) : null}
      </div>

      {/* Search Dialog Modal (Exact ChatGPT Command Palette) */}
      <SearchConversationDialog
        conversations={workspace.conversations}
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        onSelectConversation={workspace.selectConversation}
      />
    </div>
  )
}
