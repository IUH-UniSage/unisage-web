import { useEffect, useMemo, useRef, useState } from "react"

const REST_LEVEL = 0.05

/**
 * Bar heights (0..1) for a mirrored, live waveform of a mic stream: the louder frequencies
 * sit in the middle and fade to the edges. Returns resting bars while there is no stream.
 */
export function useAudioWaveform(stream: MediaStream | null, numBars = 61) {
  const restBars = useMemo(
    () => new Array<number>(numBars).fill(REST_LEVEL),
    [numBars]
  )
  const [bars, setBars] = useState<number[]>(restBars)
  const smoothed = useRef<number[]>([])

  useEffect(() => {
    if (!stream) return

    const halfCount = Math.ceil(numBars / 2)
    smoothed.current = new Array<number>(halfCount).fill(REST_LEVEL)

    const audioCtx = new AudioContext()
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.75
    audioCtx.createMediaStreamSource(stream).connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const data = new Uint8Array(bufferLength)
    let rafId = 0

    const tick = () => {
      analyser.getByteFrequencyData(data)
      const half: number[] = []
      for (let i = 0; i < halfCount; i += 1) {
        const freqIndex = Math.floor((i / halfCount) * (bufferLength * 0.5))
        const raw = (data[freqIndex] ?? 0) / 255
        const bell = Math.exp(-((i / (halfCount * 0.45)) ** 2))
        const target = Math.max(raw * bell * 1.5, REST_LEVEL)
        smoothed.current[i] += (target - smoothed.current[i]) * 0.25
        half.push(Math.min(smoothed.current[i], 1))
      }
      setBars([...half.slice(1).reverse(), ...half])
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      audioCtx.close().catch(() => {})
    }
  }, [stream, numBars])

  return stream ? bars : restBars
}
