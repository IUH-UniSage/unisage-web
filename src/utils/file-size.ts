const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return "0 B"

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    FILE_SIZE_UNITS.length - 1
  )
  const value = bytes / 1024 ** unitIndex

  return `${Number(value.toFixed(1))} ${FILE_SIZE_UNITS[unitIndex]}`
}
