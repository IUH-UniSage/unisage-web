import { useParams } from "react-router-dom"

import { SharedConversationView } from "@/features/conversations"

export function SharedConversationPage() {
  const { token = "" } = useParams<{ token: string }>()

  // Keyed: another link starts from a clean state (citation, mutation).
  return <SharedConversationView key={token} token={token} />
}
