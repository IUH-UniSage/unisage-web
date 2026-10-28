import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

// Browser speech-to-text (Web Speech API), Vietnamese. Chrome sends the audio to its own
// recognition service, so it needs a network connection; Firefox has no implementation.
const LANG = "vi-VN"
// Stop on our own after this long without a new word - Chrome otherwise keeps the mic open.
const SILENCE_AUTO_STOP_MS = 60_000

const MESSAGES = {
  notSupported:
    "Trình duyệt này không hỗ trợ nhập bằng giọng nói. Hãy dùng Chrome, Edge hoặc Safari.",
  permissionDenied:
    "Bạn đã từ chối quyền micro. Vui lòng cấp quyền và thử lại.",
  noMicrophone: "Không tìm thấy micro. Vui lòng kết nối micro và thử lại.",
  error: "Lỗi nhập bằng giọng nói. Vui lòng thử lại.",
} as const

function getRecognitionCtor() {
  if (typeof window === "undefined") return undefined
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

export function appendText(base: string, addition: string): string {
  const trimmed = addition.trim()
  if (!trimmed) return base
  const needsSpace = base.length > 0 && !/\s$/.test(base)
  return `${base}${needsSpace ? " " : ""}${trimmed}`
}

type UseSpeechToTextOptions = {
  /** Called once when listening ends normally (not cancelled), with the full text. */
  onFinish: (text: string) => void
}

/**
 * Dictation into the chat composer. `start(base)` begins after the text already typed;
 * `transcript` is that text plus everything heard so far (final + in-progress words), for live
 * display. `stop()` keeps the result (`onFinish`), `cancel()` drops it. `stream` is the mic
 * stream, only used to draw the waveform - recognition itself opens the mic on its own.
 */
export function useSpeechToText({ onFinish }: UseSpeechToTextOptions) {
  const [isSupported] = useState(() => Boolean(getRecognitionCtor()))
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [stream, setStream] = useState<MediaStream | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const baseRef = useRef("")
  const stoppingRef = useRef(false)
  const cancelledRef = useRef(false)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onFinishRef = useRef(onFinish)

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
  }, [])

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    silenceTimerRef.current = null
  }

  const stop = useCallback(() => {
    stoppingRef.current = true
    clearSilenceTimer()
    recognitionRef.current?.stop()
  }, [])

  const cancel = useCallback(() => {
    stoppingRef.current = true
    cancelledRef.current = true
    clearSilenceTimer()
    recognitionRef.current?.abort()
  }, [])

  const armSilenceTimer = useCallback(() => {
    clearSilenceTimer()
    silenceTimerRef.current = setTimeout(stop, SILENCE_AUTO_STOP_MS)
  }, [stop])

  const start = useCallback(
    async (base: string) => {
      const Ctor = getRecognitionCtor()
      if (!Ctor) {
        toast.error(MESSAGES.notSupported)
        return
      }
      if (recognitionRef.current) return

      // Mic stream for the waveform. Asking here also triggers the permission prompt once,
      // with a clear error, before recognition starts.
      try {
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = mic
        setStream(mic)
      } catch (error) {
        const name = (error as { name?: string } | null)?.name
        if (name === "NotAllowedError") toast.error(MESSAGES.permissionDenied)
        else if (name === "NotFoundError") toast.error(MESSAGES.noMicrophone)
        else toast.error(MESSAGES.error)
        return
      }

      const recognition = new Ctor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = LANG
      recognition.maxAlternatives = 1

      baseRef.current = base
      stoppingRef.current = false
      cancelledRef.current = false
      setTranscript(base)

      recognition.onstart = () => {
        setIsListening(true)
        armSilenceTimer()
      }

      recognition.onresult = (event) => {
        armSilenceTimer()
        let interim = ""
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i]
          const text = result[0]?.transcript ?? ""
          if (result.isFinal)
            baseRef.current = appendText(baseRef.current, text)
          else interim += text
        }
        setTranscript(appendText(baseRef.current, interim))
      }

      recognition.onerror = (event) => {
        if (event.error === "aborted" || event.error === "no-speech") return
        stoppingRef.current = true
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          toast.error(MESSAGES.permissionDenied)
        } else if (event.error === "audio-capture") {
          toast.error(MESSAGES.noMicrophone)
        } else {
          toast.error(MESSAGES.error)
        }
      }

      recognition.onend = () => {
        // Chrome ends a "continuous" session by itself after a pause - keep going until the
        // user (or the silence timer) stops it.
        if (!stoppingRef.current) {
          try {
            recognition.start()
            return
          } catch {
            // fall through and finish
          }
        }
        clearSilenceTimer()
        recognitionRef.current = null
        releaseStream()
        setIsListening(false)
        if (!cancelledRef.current) onFinishRef.current(baseRef.current.trim())
      }

      recognitionRef.current = recognition
      try {
        recognition.start()
      } catch {
        recognitionRef.current = null
        releaseStream()
        toast.error(MESSAGES.error)
      }
    },
    [armSilenceTimer, releaseStream]
  )

  // Leaving the page mid-dictation: drop everything, release the mic.
  useEffect(
    () => () => {
      clearSilenceTimer()
      const recognition = recognitionRef.current
      if (recognition) {
        recognition.onend = null
        recognition.abort()
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
    },
    []
  )

  return {
    isSupported,
    isListening,
    transcript,
    stream,
    start,
    stop,
    cancel,
  }
}
