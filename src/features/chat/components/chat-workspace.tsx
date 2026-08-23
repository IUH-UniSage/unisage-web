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
import { SourcePanel } from "@/features/chat/components/source-panel"
import { useChatWorkspace } from "@/features/chat/hooks/use-chat-workspace"
import { cn } from "@/lib/utils"

export function ChatPage() {
  const workspace = useChatWorkspace()
  const historyProps: ConversationHistoryProps = {
    activeConversationId: workspace.activeConversationId,
    conversations: workspace.conversations,
    onDeleteConversation: workspace.deleteConversation,
    onNewConversation: workspace.startNewConversation,
    onSearchQueryChange: workspace.setSearchQuery,
    onSelectConversation: workspace.selectConversation,
    searchLabel: "Tìm kiếm cuộc trò chuyện",
    searchQuery: workspace.searchQuery,
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <MobileChatHeader
        historyContent={
          <ConversationHistory
            {...historyProps}
            searchLabel="Tìm kiếm lịch sử trò chuyện"
          />
        }
      />
      <DesktopChatHeader
        activeConversation={workspace.activeConversation}
        desktopGridClass={workspace.desktopGridClass}
        isHistoryOpen={workspace.isHistoryOpen}
        isSourcesOpen={workspace.isSourcesOpen}
        onCloseSources={() => workspace.setIsSourcesOpen(false)}
        onOpenSources={() => workspace.setIsSourcesOpen(true)}
        onToggleHistory={() =>
          workspace.setIsHistoryOpen((current) => !current)
        }
      />

      <div
        className={cn(
          "grid min-h-0 flex-1 transition-[grid-template-columns]",
          workspace.desktopGridClass
        )}
      >
        <aside className="hidden min-h-0 border-r bg-muted/30 xl:block dark:border-white/[0.06] dark:bg-card">
          {workspace.isHistoryOpen ? (
            <ConversationHistory {...historyProps} />
          ) : (
            <CollapsedHistoryRail
              onExpand={() => workspace.setIsHistoryOpen(true)}
              onNewConversation={workspace.startNewConversation}
            />
          )}
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col bg-background">
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

        {workspace.isSourcesOpen ? <SourcePanel /> : null}
      </div>
    </div>
  )
}
