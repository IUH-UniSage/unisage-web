export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`
}

export function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${formatPercent(value)}`
}

// Per-token prices and single-request costs are often fractions of a cent.
export function formatUsdPrecise(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    maximumFractionDigits: 6,
    minimumFractionDigits: 2,
  }).format(value)
}
