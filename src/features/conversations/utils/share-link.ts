import { toast } from "sonner"

import { sharedConversationPath } from "@/constants/paths"

/** The full URL a recipient opens: `${origin}/share/{token}`. */
export function buildShareUrl(token: string): string {
  return `${window.location.origin}${sharedConversationPath(token)}`
}

export async function copyShareLink(token: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildShareUrl(token))
    toast.success("Đã sao chép liên kết")
    return true
  } catch {
    // Clipboard is unavailable (non-secure context, permission denied).
    toast.error("Không sao chép được. Hãy chọn và chép liên kết thủ công.")
    return false
  }
}
