import { Link } from "react-router-dom"

import { BrandMark } from "@/components/shared/brand/brand-mark"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ROUTES } from "@/constants/paths"

// Staff workspaces: a shortcut to the chat, pinned to the bottom-right corner of the
// screen, so trying the assistant on the loaded documents is one click from any page.
export function ChatAssistantBubble() {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            aria-label="Mở Trợ lý UniSage"
            className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 grid size-14 place-items-center rounded-full border border-primary/15 bg-card shadow-lg ring-4 ring-primary/10 transition-transform duration-200 hover:scale-105 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:scale-100 md:right-6 md:bottom-6"
            to={ROUTES.chat}
          >
            <BrandMark className="size-9" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={8}>
          Mở Trợ lý UniSage
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
