// Tipos ambientales mínimos para la Web Speech API de reconocimiento de voz
// (SpeechRecognition / webkitSpeechRecognition).
//
// TypeScript (lib.dom.d.ts, incluido hasta TS 5.9) SÍ incluye los tipos de síntesis
// de voz (SpeechSynthesis, SpeechSynthesisUtterance), pero NO incluye los tipos de
// reconocimiento de voz porque esa parte de la spec nunca se estandarizó del todo.
// Estas declaraciones cubren solo lo que Lumi usa en `useSpeechRecognition`.
//
// Referencia: https://developer.mozilla.org/docs/Web/API/SpeechRecognition
//
// Todo va dentro de `declare global` porque este archivo es un módulo (tiene
// `export {}`); sin ese bloque, las interfaces quedarían con alcance local al
// módulo en vez de globales.

export {}

declare global {
  interface SpeechRecognitionEventMap {
    audiostart: Event
    audioend: Event
    end: Event
    error: SpeechRecognitionErrorEvent
    nomatch: SpeechRecognitionEvent
    result: SpeechRecognitionEvent
    soundstart: Event
    soundend: Event
    speechstart: Event
    speechend: Event
    start: Event
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
  }

  interface SpeechRecognitionResult {
    readonly length: number
    readonly isFinal: boolean
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
  }

  interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number
    readonly results: SpeechRecognitionResultList
  }

  type SpeechRecognitionErrorCode =
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported'

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode
    readonly message: string
  }

  interface SpeechRecognition extends EventTarget {
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number

    start(): void
    stop(): void
    abort(): void

    onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null
    onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null
    onend: ((this: SpeechRecognition, ev: Event) => void) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
    onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null
    onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null
    onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null
    onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null

    addEventListener<K extends keyof SpeechRecognitionEventMap>(
      type: K,
      listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => void,
    ): void
    removeEventListener<K extends keyof SpeechRecognitionEventMap>(
      type: K,
      listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => void,
    ): void
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition
  }

  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}
