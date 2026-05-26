// src/components/HomeworkTutor.tsx
// Tutor de tareas de Lumi — flujo de 5 fases
// Fase 1: Datos del alumno → Fase 2: Info opcional → Fase 3: Explicación + formato
// Fase 4: Chat ping-pong guiado sección a sección → Fase 5: Resumen final

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';
import { getDeviceId, getSessionId } from '@/shared/lib/deviceId';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ChatMsg {
  id: string;
  role: 'lumi' | 'user';
  text: string;
  showTTS?: boolean;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const CURSOS = [
  '1° básico', '2° básico', '3° básico', '4° básico',
  '5° básico', '6° básico', '7° básico', '8° básico',
  '1° medio', '2° medio', '3° medio', '4° medio',
];

const ASIGNATURAS = [
  'Lenguaje', 'Matemáticas', 'Historia', 'Ciencias',
  'Inglés', 'Artes', 'Música', 'Ed. Física', 'Tecnología', 'Otra',
];

const FORMATOS = [
  { label: 'Trabajo escrito', icon: '📝' },
  { label: 'Tríptico', icon: '📰' },
  { label: 'Informe', icon: '📋' },
  { label: 'Mapa conceptual', icon: '🗺️' },
  { label: 'Presentación', icon: '📊' },
  { label: 'Otro', icon: '✏️' },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callTutorAI(message: string, topic: string): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    const res = await fetch(`${SUPABASE_URL}/functions/v1/tutor-ai`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        trigger_type: 'solicitud_niño',
        session_id: getSessionId(),
        device_id: getDeviceId(),
        topic,
      }),
    });
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const data = await res.json() as { reply?: string };
    return data.reply ?? '¡Ups! No pude responder en este momento. 😅';
  } catch {
    return '¡Ups! Algo salió mal. Revisa tu conexión e intenta de nuevo. 🔧';
  }
}

function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'es-CL';
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function HomeworkTutor() {
  // ── Fase actual ──
  const [phase, setPhase] = useState<1 | 2 | 3 | 4 | 5>(1);

  // ── Fase 1 ──
  const [curso, setCurso] = useState('');
  const [asignatura, setAsignatura] = useState('');
  const [tema, setTema] = useState('');

  // ── Fase 2 ──
  const [textoInfo, setTextoInfo] = useState('');
  const [infoFileName, setInfoFileName] = useState('');
  const [pautaFileName, setPautaFileName] = useState('');

  // ── Fase 3 ──
  const [phase3Loading, setPhase3Loading] = useState(false);
  const [phase3Intro, setPhase3Intro] = useState('');

  // ── Fase 4 ──
  const [formato, setFormato] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Fase 5 ──
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const infoFileRef = useRef<HTMLInputElement>(null);
  const pautaFileRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Construye el topic/system prompt para el tutor ──
  const buildTopic = (fmt?: string) => {
    const f = fmt ?? formato;
    let t =
      `Tarea de ${asignatura} para ${curso} sobre "${tema}". ` +
      `INSTRUCCIONES PARA LUMI: Nunca escribas la tarea completa de una sola vez. ` +
      `Siempre pregunta antes de avanzar a la siguiente sección. ` +
      `Usa lenguaje simple y amigable adaptado a ${curso}. ` +
      `Máximo 4 oraciones por respuesta. ` +
      `Guía al estudiante sin darle la respuesta directa. ` +
      `Al terminar cada sección, pregunta siempre "¿Alguna duda?" antes de avanzar.`;
    if (f) t += ` Formato de la tarea: ${f}.`;
    if (textoInfo) t += ` Información del alumno sobre el tema: "${textoInfo}".`;
    if (infoFileName) t += ` Archivo informativo subido: ${infoFileName}.`;
    if (pautaFileName) t += ` Pauta del profesor subida: ${pautaFileName}.`;
    return t;
  };

  // ── Fase 2 → 3: Lumi explica el tema ──
  const goToPhase3 = async () => {
    setPhase(3);
    setPhase3Loading(true);
    const topic = buildTopic();
    const msg =
      `Hola Lumi! Soy de ${curso} y tengo que hacer una tarea de ${asignatura} sobre "${tema}"` +
      (textoInfo ? `. Información que me dieron: ${textoInfo}` : '') +
      `. Explícame brevemente de qué trata el tema en 2-3 oraciones simples para mi nivel de ${curso}.`;
    const reply = await callTutorAI(msg, topic);
    setPhase3Intro(reply);
    setPhase3Loading(false);
  };

  // ── Selección de formato → Fase 4 ──
  const selectFormato = async (fmt: string) => {
    setFormato(fmt);
    setPhase(4);
    setIsLoading(true);
    const topic = buildTopic(fmt);
    const initMsg =
      `Vamos a hacer un ${fmt} de ${asignatura} sobre "${tema}" para ${curso}. ` +
      `¿Cuáles son las secciones que debe tener? Empieza a guiarme por la primera sección.`;
    const reply = await callTutorAI(initMsg, topic);
    setMessages([{ id: `lumi-${Date.now()}`, role: 'lumi', text: reply, showTTS: true }]);
    setIsLoading(false);
  };

  // ── Enviar mensaje en Fase 4 ──
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const txt = input.trim();
    setInput('');
    const userMsg: ChatMsg = { id: `user-${Date.now()}`, role: 'user', text: txt };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    const reply = await callTutorAI(txt, buildTopic());
    setMessages(prev => [
      ...prev,
      { id: `lumi-${Date.now()}`, role: 'lumi', text: reply, showTTS: true },
    ]);
    setIsLoading(false);
  };

  // ── Fase 4 → 5: Resumen final ──
  const finishTask = async () => {
    setPhase(5);
    setSummaryLoading(true);
    const topic = buildTopic();
    const finalMsg =
      `Por favor, reúne y organiza todo el contenido que construimos juntos para el ${formato} ` +
      `de ${asignatura} sobre "${tema}". Preséntalo completo, sección por sección, bien organizado, listo para entregar.`;
    const reply = await callTutorAI(finalMsg, topic);
    setSummary(reply);
    setSummaryLoading(false);
  };

  // ── Reiniciar ──
  const reset = () => {
    setPhase(1);
    setCurso(''); setAsignatura(''); setTema('');
    setTextoInfo(''); setInfoFileName(''); setPautaFileName('');
    setFormato(''); setPhase3Intro(''); setMessages([]);
    setSummary(''); setCopied(false);
  };

  // ── Copiar tarea ──
  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: selección manual
    }
  };

  const phase1OK = !!(curso && asignatura && tema.trim());

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col font-sans"
      style={{
        // Fase 4 (chat) usa altura fija; resto hace scroll natural
        height: phase === 4 ? '100dvh' : undefined,
        minHeight: phase !== 4 ? '100dvh' : undefined,
        background: 'var(--color-background)',
      }}
    >
      {/* ══════════════════════════════════════════════
          Header global
      ══════════════════════════════════════════════ */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm flex-shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
          style={{ background: 'hsl(145 70% 90%)' }}
        >
          🌱
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">Lumi — Ayúdame con mi tarea</h1>
          <p className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>● En línea</p>
        </div>
        {/* Indicador de progreso */}
        <div className="ml-auto flex gap-1.5 items-center">
          {([1, 2, 3, 4, 5] as const).map(p => (
            <div
              key={p}
              className="w-2 h-2 rounded-full transition-colors duration-300"
              style={{ background: p <= phase ? 'var(--color-primary)' : '#d1d5db' }}
            />
          ))}
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          FASE 1 — Datos del alumno
      ══════════════════════════════════════════════ */}
      {phase === 1 && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center gap-6">
            {/* Avatar + bienvenida */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-md"
                style={{ background: 'hsl(145 70% 90%)' }}
              >
                🌱
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm border border-gray-100 max-w-xs">
                <p className="text-gray-800 text-sm leading-relaxed">
                  <strong>¡Hola! Soy Lumi 🌱</strong>
                  <br />
                  ¿Te ayudo con tu tarea?
                  <br />
                  <span className="text-gray-500">Cuéntame un poco primero:</span>
                </p>
              </div>
            </div>

            {/* Formulario */}
            <div className="w-full flex flex-col gap-4">
              {/* Curso */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  📚 ¿En qué curso estás? <span style={{ color: 'var(--color-primary)' }}>*</span>
                </label>
                <select
                  value={curso}
                  onChange={e => setCurso(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white outline-none transition appearance-none"
                  style={{ borderColor: curso ? 'var(--color-primary)' : undefined }}
                >
                  <option value="">Selecciona tu curso…</option>
                  {CURSOS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Asignatura */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  📖 ¿Qué asignatura? <span style={{ color: 'var(--color-primary)' }}>*</span>
                </label>
                <select
                  value={asignatura}
                  onChange={e => setAsignatura(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white outline-none transition appearance-none"
                  style={{ borderColor: asignatura ? 'var(--color-primary)' : undefined }}
                >
                  <option value="">Selecciona la asignatura…</option>
                  {ASIGNATURAS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Tema */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  ✏️ ¿Cuál es el tema o título de la tarea? <span style={{ color: 'var(--color-primary)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  placeholder="Ej: Los viajes de exploración del siglo XV"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white outline-none transition"
                  style={{ borderColor: tema.trim() ? 'var(--color-primary)' : undefined }}
                />
              </div>
            </div>

            {/* Botón continuar */}
            <button
              disabled={!phase1OK}
              onClick={() => setPhase(2)}
              className="w-full py-3.5 rounded-2xl font-bold text-base text-white transition-all duration-200 active:scale-95"
              style={{
                background: phase1OK ? 'var(--color-primary)' : '#d1d5db',
                cursor: phase1OK ? 'pointer' : 'not-allowed',
              }}
            >
              ¡Empecemos! →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          FASE 2 — Subida de información (opcional)
      ══════════════════════════════════════════════ */}
      {phase === 2 && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
            {/* Lumi saluda */}
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0 self-end"
                style={{ background: 'hsl(145 70% 90%)' }}
              >
                🌱
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-800">
                  ¡Genial! 🌟 Voy a ayudarte con tu tarea de{' '}
                  <strong>{asignatura}</strong> sobre <strong>"{tema}"</strong>.
                  <br />
                  <span className="text-gray-500">
                    Antes de empezar, ¿tienes más información? (es opcional)
                  </span>
                </p>
              </div>
            </div>

            {/* Bloque A: Información del tema */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  📄 ¿Tienes información para tu tarea?
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Puede ser una foto, texto o PDF.
                </p>
              </div>

              {/* Input file oculto */}
              <input
                ref={infoFileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) setInfoFileName(f.name);
                }}
              />

              <button
                onClick={() => infoFileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-all w-fit active:scale-95"
                style={{
                  borderColor: infoFileName ? 'var(--color-primary)' : '#d1d5db',
                  color: infoFileName ? 'var(--color-primary)' : '#6b7280',
                }}
              >
                📎{' '}
                {infoFileName ? (
                  <span className="truncate max-w-[180px]">✓ {infoFileName}</span>
                ) : (
                  'Subir información'
                )}
              </button>

              {/* Área de texto alternativa */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5">
                  O escríbeme aquí de qué se trata y yo averiguo 🔍
                </p>
                <textarea
                  value={textoInfo}
                  onChange={e => setTextoInfo(e.target.value)}
                  placeholder="Escribe aquí lo que sabes del tema, lo que te pidieron, cualquier info relevante…"
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 outline-none transition resize-none"
                  style={{ borderColor: textoInfo ? 'var(--color-primary)' : undefined }}
                />
              </div>
            </div>

            {/* Bloque B: Pauta del profe */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  📋 ¿Tu profe te dio una pauta o rúbrica?
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  ¡Sube el documento y la reviso junto contigo!
                </p>
              </div>

              <input
                ref={pautaFileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) setPautaFileName(f.name);
                }}
              />

              <button
                onClick={() => pautaFileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-all w-fit active:scale-95"
                style={{
                  borderColor: pautaFileName ? 'var(--color-primary)' : '#d1d5db',
                  color: pautaFileName ? 'var(--color-primary)' : '#6b7280',
                }}
              >
                📋{' '}
                {pautaFileName ? (
                  <span className="truncate max-w-[180px]">✓ {pautaFileName}</span>
                ) : (
                  'Subir pauta'
                )}
              </button>
            </div>

            {/* Continuar */}
            <button
              onClick={goToPhase3}
              className="w-full py-3.5 rounded-2xl font-bold text-base text-white transition-all duration-200 active:scale-95"
              style={{ background: 'var(--color-primary)' }}
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          FASE 3 — Explicación del tema + selección de formato
      ══════════════════════════════════════════════ */}
      {phase === 3 && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
            {/* Chips de contexto */}
            <div className="flex gap-2 flex-wrap text-xs">
              <span
                className="rounded-full px-3 py-1 font-medium"
                style={{ background: 'hsl(145 70% 90%)', color: 'var(--color-tarea-text)' }}
              >
                📚 {curso}
              </span>
              <span
                className="rounded-full px-3 py-1 font-medium"
                style={{ background: 'hsl(145 70% 90%)', color: 'var(--color-tarea-text)' }}
              >
                📖 {asignatura}
              </span>
              <span
                className="rounded-full px-3 py-1 font-medium"
                style={{ background: 'hsl(145 70% 90%)', color: 'var(--color-tarea-text)' }}
              >
                ✏️ {tema}
              </span>
            </div>

            {/* Explicación de Lumi */}
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0 self-end"
                style={{ background: 'hsl(145 70% 90%)' }}
              >
                🌱
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 flex-1">
                {phase3Loading ? (
                  /* Indicador de escritura */
                  <div className="flex gap-1 py-1">
                    <span
                      className="w-2 h-2 rounded-full inline-block animate-bounce"
                      style={{ background: 'var(--color-primary)', animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full inline-block animate-bounce"
                      style={{ background: 'var(--color-primary)', animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full inline-block animate-bounce"
                      style={{ background: 'var(--color-primary)', animationDelay: '300ms' }}
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                      {phase3Intro}
                    </p>
                    <button
                      onClick={() => speak(phase3Intro)}
                      className="mt-2 text-xs text-gray-400 hover:text-green-600 transition flex items-center gap-1"
                    >
                      🔊 Escuchar explicación
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Selección de formato */}
            {!phase3Loading && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                  🎨 ¿En qué formato vas a presentar tu tarea?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FORMATOS.map(f => (
                    <button
                      key={f.label}
                      onClick={() => selectFormato(f.label)}
                      className="flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-700 hover:text-green-800 transition-all active:scale-95"
                      style={{}}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          'var(--color-primary)';
                        (e.currentTarget as HTMLButtonElement).style.background =
                          'hsl(145 70% 97%)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                        (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                      }}
                    >
                      <span className="text-2xl">{f.icon}</span>
                      <span className="text-xs text-center leading-tight">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          FASE 4 — Chat ping-pong guiado (layout fijo)
      ══════════════════════════════════════════════ */}
      {phase === 4 && (
        <>
          {/* Barra de contexto */}
          <div
            className="flex-shrink-0 border-b px-4 py-2"
            style={{ background: 'hsl(145 70% 96%)', borderColor: 'hsl(145 70% 80%)' }}
          >
            <div className="max-w-lg mx-auto flex items-center gap-2 flex-wrap">
              <span
                className="text-xs rounded-full px-2.5 py-0.5 font-medium border"
                style={{
                  background: '#fff',
                  borderColor: 'hsl(145 70% 70%)',
                  color: 'var(--color-tarea-text)',
                }}
              >
                {curso}
              </span>
              <span
                className="text-xs rounded-full px-2.5 py-0.5 font-medium border"
                style={{
                  background: '#fff',
                  borderColor: 'hsl(145 70% 70%)',
                  color: 'var(--color-tarea-text)',
                }}
              >
                {asignatura}
              </span>
              <span
                className="text-xs rounded-full px-2.5 py-0.5 font-medium border"
                style={{
                  background: '#fff',
                  borderColor: 'hsl(145 70% 70%)',
                  color: 'var(--color-tarea-text)',
                }}
              >
                {formato}
              </span>
              {/* Botón terminar — activo con ≥ 4 mensajes */}
              <button
                onClick={finishTask}
                disabled={messages.length < 4}
                className="ml-auto text-xs font-bold px-3 py-1 rounded-full border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
              >
                Terminar tarea ✓
              </button>
            </div>
          </div>

          {/* Mensajes del chat */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4">
            <div className="max-w-lg mx-auto space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar Lumi (izquierda) */}
                  {msg.role === 'lumi' && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-base mr-2 flex-shrink-0 self-end"
                      style={{ background: 'hsl(145 70% 90%)' }}
                    >
                      🌱
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] sm:max-w-[72%] flex flex-col gap-1 ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Burbuja */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-violet-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Botón TTS en mensajes de Lumi */}
                    {msg.showTTS && (
                      <button
                        onClick={() => speak(msg.text)}
                        className="text-xs text-gray-400 hover:text-green-600 transition flex items-center gap-1 px-1"
                      >
                        🔊 ¿Te dicto esta parte?
                      </button>
                    )}
                  </div>

                  {/* Avatar usuario (derecha) */}
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-base ml-2 flex-shrink-0 self-end">
                      👤
                    </div>
                  )}
                </div>
              ))}

              {/* Indicador de carga */}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
                    style={{ background: 'hsl(145 70% 90%)' }}
                  >
                    🌱
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-100 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: 'var(--color-primary)', animationDelay: '0ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: 'var(--color-primary)', animationDelay: '150ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: 'var(--color-primary)', animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input de chat — fijo en la parte inferior */}
          <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
            <div className="max-w-lg mx-auto flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-2 transition focus-within:border-green-400">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Escribe tu respuesta…"
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-60"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-all active:scale-90 flex-shrink-0"
                style={{ background: 'var(--color-primary)' }}
                aria-label="Enviar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.903 6.23H13.5a.75.75 0 010 1.5H4.182l-1.903 6.23a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════
          FASE 5 — Resumen final + copiar
      ══════════════════════════════════════════════ */}
      {phase === 5 && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
            {/* Cabecera de celebración */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-5xl shadow-md"
                style={{ background: 'hsl(145 70% 90%)' }}
              >
                🌱
              </div>
              <h2 className="text-xl font-bold text-gray-900">¡Tu tarea está lista! 🎉</h2>
              <p className="text-sm text-gray-500 max-w-xs">
                Aquí está todo lo que construimos juntos, sección por sección.
              </p>
            </div>

            {/* Tags de contexto */}
            <div className="flex gap-2 flex-wrap justify-center text-xs">
              {[curso, asignatura, tema, formato].map(tag => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 font-medium"
                  style={{ background: 'hsl(145 70% 90%)', color: 'var(--color-tarea-text)' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Contenido del resumen */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {summaryLoading ? (
                <div className="flex justify-center items-center py-10 gap-3">
                  <span className="text-sm text-gray-500">Lumi está preparando tu tarea…</span>
                  <span
                    className="w-2 h-2 rounded-full animate-bounce inline-block"
                    style={{ background: 'var(--color-primary)', animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce inline-block"
                    style={{ background: 'var(--color-primary)', animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce inline-block"
                    style={{ background: 'var(--color-primary)', animationDelay: '300ms' }}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {summary}
                </p>
              )}
            </div>

            {/* Botones de acción */}
            {!summaryLoading && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={copySummary}
                  className="w-full py-3.5 rounded-2xl font-bold text-base text-white transition-all duration-200 active:scale-95"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {copied ? '✓ ¡Copiado!' : '📥 Copiar mi tarea'}
                </button>

                <button
                  onClick={() => speak(summary)}
                  className="w-full py-3 rounded-2xl font-bold text-base border-2 transition-all duration-200 active:scale-95 bg-transparent"
                  style={{
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-primary)',
                  }}
                >
                  🔊 Escuchar tarea completa
                </button>

                <button
                  onClick={reset}
                  className="text-center text-sm text-gray-400 hover:text-gray-700 transition py-2"
                >
                  ← Hacer otra tarea
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
