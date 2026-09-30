// Real per-request costs are fractions of a cent, so sub-dollar amounts keep
// their significant digits instead of rounding to $0.00.
export function formatUsd(value: number): string {
  const abs = Math.abs(value)
  if (abs > 0 && abs < 1) return formatUsdPrecise(value)
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    maximumFractionDigits: abs >= 100 ? 0 : 2,
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
  const abs = Math.abs(value)
  const digits =
    abs > 0 && abs < 0.01
      ? { maximumSignificantDigits: 3 }
      : { maximumFractionDigits: 4, minimumFractionDigits: 2 }
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    ...digits,
  }).format(value)
}
