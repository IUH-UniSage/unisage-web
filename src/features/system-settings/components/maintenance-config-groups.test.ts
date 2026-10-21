import { describe, expect, it } from "vitest"

import { groupMaintenanceConfigs } from "@/features/system-settings/components/maintenance-config-groups"
import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"

const config = (configKey: string) => ({ configKey }) as SystemConfig

describe("groupMaintenanceConfigs", () => {
  it("orders the scattered API rows into three cards", () => {
    const groups = groupMaintenanceConfigs(
      [
        "maintenance.backup.differential.time",
        "maintenance.backup.qdrant.retention_count",
        "maintenance.guest_session.ttl_days",
        "maintenance.backup.enabled",
        "maintenance.backup.full.frequency",
        "maintenance.conversation.max_per_user",
        "maintenance.backup.qdrant.frequency",
      ].map(config)
    )

    expect(
      groups.map((group) => [
        group.title,
        group.configs.map((item) => item.configKey),
      ])
    ).toEqual([
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
          "maintenance.backup.differential.time",
        ],
      ],
      [
        "Snapshot vector (Qdrant)",
        [
          "maintenance.backup.qdrant.frequency",
          "maintenance.backup.qdrant.retention_count",
        ],
      ],
    ])
  })

  it("still shows keys it does not know", () => {
    const groups = groupMaintenanceConfigs(
      ["maintenance.backup.new_flag", "maintenance.something_else"].map(config)
    )

    expect(
      groups.map((group) => group.configs.map((item) => item.configKey))
    ).toEqual([["maintenance.something_else"], ["maintenance.backup.new_flag"]])
  })

  it("drops empty cards", () => {
    expect(
      groupMaintenanceConfigs([config("maintenance.guest_session.ttl_days")])
    ).toHaveLength(1)
  })
})
