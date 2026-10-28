// Web Speech API (speech-to-text) - not in TypeScript's lib.dom yet. Chrome/Edge/Safari expose
// it, Safari and older Chrome only as `webkitSpeechRecognition`; Firefox has neither.
export {}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number

    onend: ((this: SpeechRecognition, ev: Event) => void) | null
    onerror:
      | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
      | null
    onresult:
      ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null

    abort(): void
    start(): void
    stop(): void
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean
    readonly length: number
    item(index: number): SpeechRecognitionAlternative
    readonly [index: number]: SpeechRecognitionAlternative
  }

  interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
    readonly [index: number]: SpeechRecognitionResult
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number
    readonly results: SpeechRecognitionResultList
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error:
      | "aborted"
      | "audio-capture"
      | "bad-grammar"
      | "language-not-supported"
      | "network"
      | "no-speech"
      | "not-allowed"
      | "service-not-allowed"
    readonly message: string
  }
}
