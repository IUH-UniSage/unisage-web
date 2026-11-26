import { useParams } from "react-router-dom"

import { ChatPage } from "@/pages/user/chat-page"
import { SharedConversationView } from "@/features/conversations"

export function SharedConversationPage() {
  const { token = "" } = useParams<{ token: string }>()

  // The chat shell (history sidebar, header) around the snapshot; the composer
  // is replaced by the "continue in your own copy" bar. Keyed: another link
  // starts from a clean state (citation, mutation).
  return (
    <ChatPage
      sharedContent={<SharedConversationView key={token} token={token} />}
    />
  )
}
