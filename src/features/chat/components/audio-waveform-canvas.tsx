import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const BAR_WIDTH = 2
const BAR_GAP = 4.5
const MAX_BAR_HEIGHT = 28
const LOUD_THRESHOLD = 0.18
const QUIET_ALPHA = 0.55

/**
 * Draws waveform bars from `useAudioWaveform`. The color is the canvas's own CSS `color`
 * (`text-muted-foreground` by default), so it follows the theme tokens; quiet bars are drawn
 * lighter than loud ones.
 */
export function AudioWaveformCanvas({
  bars,
  className,
}: {
  bars: number[]
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = getComputedStyle(canvas).color

    const centerY = canvas.height / 2
    const totalWidth = bars.length * BAR_WIDTH + (bars.length - 1) * BAR_GAP
    const startX = (canvas.width - totalWidth) / 2

    bars.forEach((value, i) => {
      const x = startX + i * (BAR_WIDTH + BAR_GAP)
      const height = Math.max(value * MAX_BAR_HEIGHT, 2.5)
      ctx.globalAlpha = value > LOUD_THRESHOLD ? 1 : QUIET_ALPHA
      ctx.beginPath()
      ctx.roundRect(x, centerY - height / 2, BAR_WIDTH, height, BAR_WIDTH / 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }, [bars])

  return (
    <canvas
      aria-hidden="true"
      className={cn("h-7 w-full text-muted-foreground", className)}
      height={28}
      ref={canvasRef}
      width={600}
    />
  )
}
