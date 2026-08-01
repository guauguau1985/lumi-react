import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowLeft, IconMicrophone2 } from '@tabler/icons-react'
import { SpeakButton } from '@/shared/components/voice/SpeakButton'
import { VOICE_OPTIONS, type SpeechContext } from '@/shared/config/voice'

/**
 * Pantalla de prueba interna (no es un módulo para el niño): permite
 * escuchar exactamente el mismo texto con distintas voces de OpenAI antes
 * de fijar la definitiva en src/shared/config/voice.ts (DEFAULT_VOICE_ID).
 *
 * Protegida con role="parent" en App.tsx: no aparece en la navegación del
 * estudiante ni en Home.tsx, se entra escribiendo la URL directamente.
 */

const SAMPLE_TEXTS: Array<{ context: SpeechContext; label: string; text: string }> = [
  {
    context: 'explanation',
    label: 'Explicación',
    text: 'Para resolver 24 dividido por 6, podemos preguntarnos cuántas veces cabe el 6 dentro del 24. Vamos a contar de a poco, paso a paso, sin apuro.',
  },
  {
    context: 'encouragement',
    label: 'Ánimo',
    text: 'Te equivocaste, y está bien. Inténtalo de nuevo con calma, yo te acompaño.',
  },
  {
    context: 'instruction',
    label: 'Instrucción',
    text: 'Escribe tu respuesta en el cuadro y presiona el botón para enviarla.',
  },
  {
    context: 'story',
    label: 'Relato',
    text: 'Había una vez una niña que no entendía las fracciones, hasta que descubrió que eran solo pedazos de una misma pizza.',
  },
]

export default function VoicePlayground() {
  const [customText, setCustomText] = useState(SAMPLE_TEXTS[0].text)
  const [customContext, setCustomContext] = useState<SpeechContext>('explanation')

  return (
    <div className="min-h-svh bg-[#f7f7fc] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/reporte-padres"
          className="inline-flex items-center gap-2 text-sm font-bold text-violet-700"
        >
          <IconArrowLeft size={18} /> Volver
        </Link>

        <header className="mt-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <IconMicrophone2 size={22} />
          </span>
          <div>
            <h1 className="text-xl font-black sm:text-2xl">Probar voces de Lumi</h1>
            <p className="text-sm text-slate-500">
              Compara la misma frase con distintas voces antes de elegir la definitiva.
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
          <label className="block text-sm font-black text-violet-700">Texto a probar</label>
          <textarea
            value={customText}
            onChange={(event) => setCustomText(event.target.value)}
            className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.context}
                type="button"
                onClick={() => {
                  setCustomText(sample.text)
                  setCustomContext(sample.context)
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  customContext === sample.context
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : 'border-violet-100 bg-white text-violet-700 hover:bg-violet-50'
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-xs font-black text-slate-500">
            Estilo aplicado a la voz (context)
          </label>
          <select
            value={customContext}
            onChange={(event) => setCustomContext(event.target.value as SpeechContext)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:border-violet-400"
          >
            <option value="explanation">Explicación</option>
            <option value="encouragement">Ánimo</option>
            <option value="instruction">Instrucción</option>
            <option value="story">Relato</option>
          </select>
        </section>

        <section className="mt-4 space-y-3">
          {VOICE_OPTIONS.map((voice) => (
            <div
              key={voice.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-black">{voice.label}</p>
                <p className="text-xs text-slate-500">{voice.description}</p>
              </div>
              <SpeakButton
                text={customText}
                voice={voice.id}
                context={customContext}
                label={`Escuchar en ${voice.label}`}
              />
            </div>
          ))}
        </section>

        <p className="mt-6 text-xs text-slate-400">
          Cada reproducción nueva llama a la API de OpenAI y tiene un costo pequeño; el audio se
          reutiliza si repites la misma voz y texto en esta misma sesión.
        </p>
      </div>
    </div>
  )
}
