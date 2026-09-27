import { z } from "zod"

// Mirrors backend UNISAGE-62's Actuator-shaped status vocabulary
// (UP/DOWN/DEGRADED/OUT_OF_SERVICE) - see the UNISAGE-62/63 plan doc for why
// this piggybacks on Spring Boot Actuator's health-indicator conventions
// instead of a hand-rolled aggregator.
export const healthStatusSchema = z.enum([
  "UP",
  "DOWN",
  "DEGRADED",
  "OUT_OF_SERVICE",
])

export type HealthStatus = z.infer<typeof healthStatusSchema>

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  DEGRADED: "Suy giảm",
  DOWN: "Ngừng hoạt động",
  OUT_OF_SERVICE: "Ngoài dịch vụ",
  UP: "Hoạt động tốt",
}

const HEALTH_STATUS_BADGE_CLASSNAME: Record<HealthStatus, string> = {
  DEGRADED: "border-transparent bg-warning text-warning-foreground",
  DOWN: "border-transparent bg-destructive/10 text-destructive",
  OUT_OF_SERVICE: "border-transparent bg-muted text-muted-foreground",
  UP: "border-transparent bg-success/10 text-success",
}

export function getHealthStatusBadgeClassName(status: HealthStatus): string {
  return HEALTH_STATUS_BADGE_CLASSNAME[status]
}

const HEALTH_STATUS_DOT_CLASSNAME: Record<HealthStatus, string> = {
  DEGRADED: "bg-warning-foreground",
  DOWN: "bg-destructive",
  OUT_OF_SERVICE: "bg-muted-foreground",
  UP: "bg-success",
}

export function getHealthStatusDotClassName(status: HealthStatus): string {
  return HEALTH_STATUS_DOT_CLASSNAME[status]
}

export const componentHealthSchema = z.object({
  details: z.record(z.string(), z.unknown()).nullish(),
  responseTimeMs: z.number().nullish(),
  status: healthStatusSchema,
})

export type ComponentHealth = z.infer<typeof componentHealthSchema>

export const healthCheckResponseSchema = z.object({
  checkedAt: z.string(),
  components: z.record(z.string(), componentHealthSchema),
  overallStatus: healthStatusSchema,
})

export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>

export const healthHistoryPageSchema = z.object({
  data: z.array(healthCheckResponseSchema),
  limit: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export type HealthHistoryPage = z.infer<typeof healthHistoryPageSchema>

// Expected component keys per the UNISAGE-62 contract draft - Spring
// Actuator indicator bean names lowercased minus the `HealthIndicator`
// suffix (e.g. a `GatewayHealthIndicator` bean registers as `gateway`).
// UNCONFIRMED until the real backend branch lands; a component key present
// in the response but missing from this map still renders (see
// `getComponentLabel`/`getComponentIcon` fallbacks in
// `components/component-health-card.tsx`), so an unexpected key from the
// real backend degrades gracefully instead of disappearing.
export const KNOWN_COMPONENT_KEYS = ["db", "gateway", "agent", "minio"] as const

export type KnownComponentKey = (typeof KNOWN_COMPONENT_KEYS)[number]

export const COMPONENT_LABELS: Record<KnownComponentKey, string> = {
  agent: "Trợ lý AI",
  db: "Cơ sở dữ liệu",
  gateway: "Cổng API (Gateway)",
  minio: "Lưu trữ file",
}

// One-line explanation of what each dependency actually is, naming the real
// technology (not just a generic role) so "Cổng API"/"Trợ lý AI" aren't
// unexplained names on their own. Kept short enough for one line on a
// card (UNISAGE-93).
export const COMPONENT_DESCRIPTIONS: Record<KnownComponentKey, string> = {
  agent: "Dịch vụ Python trả lời câu hỏi (RAG).",
  db: "PostgreSQL - dữ liệu chính của hệ thống.",
  gateway: "Spring Cloud Gateway - định tuyến API.",
  minio: "MinIO - lưu file tài liệu tải lên.",
}

export function getComponentLabel(key: string): string {
  return COMPONENT_LABELS[key as KnownComponentKey] ?? key
}

export function getComponentDescription(key: string): string | null {
  return COMPONENT_DESCRIPTIONS[key as KnownComponentKey] ?? null
}

// The "agent" component's own `details.components` - unisage-agent's /health
// checks its OWN Postgres/Redis/Qdrant and reports them here (see
// unisage-backend's AgentHealthIndicator, which forwards this map as-is).
// Status strings are lowercase ("up"/"down"), unlike the top-level Actuator
// vocabulary (UP/DOWN) - a different service, a different convention.
const AGENT_SUB_COMPONENT_LABELS: Record<string, string> = {
  database: "PostgreSQL (riêng của Trợ lý AI)",
  qdrant: "Qdrant (vector database)",
  redis: "Redis",
}

export type ComponentFact = {
  label: string
  // Extra detail shown on hover (e.g. each agent dependency's latency).
  title?: string
  value: string
}

function stringAt(
  details: Record<string, unknown> | null | undefined,
  key: string
) {
  const value = details?.[key]
  return typeof value === "string" && value.trim() ? value : null
}

function mainFact(
  key: string,
  details: Record<string, unknown> | null | undefined
): ComponentFact {
  switch (key) {
    case "agent": {
      const subs = getAgentSubComponents(details)
      if (!subs) break
      const up = subs.filter((sub) => sub.up).length
      return {
        label: "Phụ thuộc",
        title: subs
          .map(
            (sub) =>
              `${sub.label}: ${sub.up ? "hoạt động" : "lỗi"}` +
              (sub.responseTimeMs !== null ? ` · ${sub.responseTimeMs}ms` : "")
          )
          .join("\n"),
        value: `${up}/${subs.length} hoạt động`,
      }
    }
    case "db":
      return {
        label: "Hệ quản trị",
        value: stringAt(details, "database") ?? "—",
      }
    case "gateway":
      return {
        label: "Địa chỉ",
        value: stringAt(details, "url")?.replace(/^https?:\/\//, "") ?? "—",
      }
    case "minio":
      return { label: "Bucket", value: stringAt(details, "bucket") ?? "—" }
  }
  return { label: "Chi tiết", value: "—" }
}

/**
 * The two rows every component card shows - its key detail and its response
 * time - always in the same shape so the cards line up with each other
 * instead of mixing a dependency list with label/value rows (UNISAGE-93).
 */
export function getComponentFacts(
  health: {
    details?: Record<string, unknown> | null
    responseTimeMs?: number | null
  },
  key: string
): ComponentFact[] {
  // Actuator indicators report latency inside `details`, not in the
  // top-level `responseTimeMs`; db reports none at all.
  const nested = health.details?.responseTimeMs
  const responseTimeMs =
    typeof health.responseTimeMs === "number"
      ? health.responseTimeMs
      : typeof nested === "number"
        ? nested
        : null

  return [
    mainFact(key, health.details),
    {
      label: "Thời gian phản hồi",
      value: responseTimeMs !== null ? `${responseTimeMs}ms` : "—",
    },
  ]
}

export type AgentSubComponent = {
  key: string
  label: string
  responseTimeMs: number | null
  up: boolean
}

/**
 * Parses the agent component's nested dependency breakdown out of its raw
 * `details.components` map, if present - returns null for every other
 * component (db/gateway/minio don't have this nested shape) or if the
 * backend hasn't forwarded it yet.
 */
export function getAgentSubComponents(
  details: Record<string, unknown> | null | undefined
): AgentSubComponent[] | null {
  const raw = details?.components
  if (!raw || typeof raw !== "object") return null

  return Object.entries(raw as Record<string, unknown>).map(([key, value]) => {
    const entry = (value ?? {}) as Record<string, unknown>
    return {
      key,
      label: AGENT_SUB_COMPONENT_LABELS[key] ?? key,
      responseTimeMs:
        typeof entry.response_time_ms === "number"
          ? entry.response_time_ms
          : null,
      up: entry.status === "up",
    }
  })
}
