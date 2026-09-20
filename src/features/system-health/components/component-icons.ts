import type { LucideIcon } from "lucide-react"
import { Bot, Database, HardDrive, Network, Puzzle } from "lucide-react"

import type { KnownComponentKey } from "@/features/system-health/schemas/system-health-schemas"

// `Puzzle` is the fallback for a component key the FE doesn't recognize yet
// (see KNOWN_COMPONENT_KEYS's doc comment) - still renders a card with a
// generic icon rather than crashing or silently dropping it. Exposed as a
// plain Record (not a lookup function) so callers do `COMPONENT_ICONS[key]
// ?? Puzzle` directly in JSX - eslint-plugin-react-hooks's
// static-components rule flags `const Icon = someFn(key)` as "creating a
// component during render" even when the function only indexes a static
// map, but doesn't flag indexing the map inline (see
// system-settings-dashboard.tsx's SYSTEM_CONFIG_CATEGORY_ICONS for the same
// pattern).
export const COMPONENT_ICONS: Record<KnownComponentKey, LucideIcon> = {
  agent: Bot,
  db: Database,
  gateway: Network,
  minio: HardDrive,
}

export const FALLBACK_COMPONENT_ICON: LucideIcon = Puzzle
