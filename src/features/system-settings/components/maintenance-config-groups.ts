import type { ConfigGroup } from "@/features/system-settings/components/ingest-config-groups"
import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"

// Card title -> its keys in display order. The API returns rows in insert
// order, which scatters the backup schedule; this reads top to bottom:
// switch on, then each backup type's frequency, time and retention.
const MAINTENANCE_GROUPS: [string, string[]][] = [
  [
    "Dữ liệu hội thoại",
    [
      "maintenance.conversation.max_per_user",
      "maintenance.guest_session.ttl_days",
    ],
  ],
  [
    "Sao lưu cơ sở dữ liệu (Postgres)",
    [
      "maintenance.backup.enabled",
      "maintenance.backup.full.frequency",
      "maintenance.backup.full.time",
      "maintenance.backup.retention.full_count",
      "maintenance.backup.differential.frequency",
      "maintenance.backup.differential.time",
      "maintenance.backup.wal.interval_minutes",
    ],
  ],
  [
    "Snapshot vector (Qdrant)",
    [
      "maintenance.backup.qdrant.frequency",
      "maintenance.backup.qdrant.time",
      "maintenance.backup.qdrant.retention_count",
    ],
  ],
]

/**
 * Splits the MAINTENANCE tab into cards with a fixed order. A key the list
 * does not know yet still shows up: backup keys at the end of the Postgres
 * card, anything else at the end of the first card.
 */
export function groupMaintenanceConfigs(
  configs: SystemConfig[]
): ConfigGroup[] {
  const byKey = new Map(configs.map((config) => [config.configKey, config]))
  const listed = new Set(MAINTENANCE_GROUPS.flatMap(([, keys]) => keys))
  const unlisted = configs.filter((config) => !listed.has(config.configKey))

  const groups = MAINTENANCE_GROUPS.map(([title, keys], index) => {
    const extras = unlisted.filter((config) =>
      config.configKey.startsWith("maintenance.backup.")
        ? index === 1
        : index === 0
    )
    return {
      configs: [
        ...keys.flatMap((key) => {
          const config = byKey.get(key)
          return config ? [config] : []
        }),
        ...extras,
      ],
      title,
    }
  })
  return groups.filter((group) => group.configs.length > 0)
}
