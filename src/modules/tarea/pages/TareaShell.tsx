import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';
import { getDeviceId, getSessionId } from '@/shared/lib/deviceId';

const CURSO_KEY = 'lumi_tarea_curso';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const CURSOS = ['3° básico', '4° básico', '5° básico', '6° básico', '7° básico', '8° básico'];

function LumiFace({ className }: { className: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}img/lumi/logo.png`}
      alt="Lumi"
      className={`rounded-full object-cover flex-shrink-0 ${className}`}
    />
  );
}

interface Message {
  id: string;
  role: 'user' | 'lumi';
  text: string;
  time: string;
}

function now() {
  return new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function welcomeMessage(curso: string): Message {
  return {
    id: 'welcome',
    role: 'lumi',
    time: now(),
    text: `¡Genial! Ya sé que estás en ${curso} 🌱 Ahora cuéntame: ¿en qué tarea o tema necesitas ayuda?`,
  };
}

async function askTutor(message: string, curso: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/tutor-ai`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      session_id: getSessionId(),
      device_id: getDeviceId(),
      grade: curso,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.reply as string;
}

export default function TareaShell() {
  const [curso, setCurso] = useState<string | null>(() => localStorage.getItem(CURSO_KEY));
  const [messages, setMessages] = useState<Message[]>(() =>
    curso ? [welcomeMessage(curso)] : []
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const elegirCurso = (elegido: string) => {
    localStorage.setItem(CURSO_KEY, elegido);
    setCurso(elegido);
    setMessages([welcomeMessage(elegido)]);
  };

  const cambiarCurso = () => {
    localStorage.removeItem(CURSO_KEY);
    setCurso(null);
    setMessages([]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !curso || loading || offline) return;

    setInput('');
    setMessages(p => [...p, { id: `u-${Date.now()}`, role: 'user', text, time: now() }]);
    setLoading(true);

    try {
      const reply = await askTutor(text, curso);
      setMessages(p => [...p, { id: `l-${Date.now()}`, role: 'lumi', text: reply, time: now() }]);
    } catch {
      setMessages(p => [...p, {
        id: `e-${Date.now()}`,
        role: 'lumi',
        text: '¡Ups! Algo salió mal. Intenta de nuevo en un momento. 🔧',
        time: now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex-shrink-0 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LumiFace className="w-9 h-9" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Lumi — Ayúdame con mi tarea</h1>
            <p className="text-xs text-green-500 font-medium">
              {curso ? `● ${curso}` : '● En línea'}
            </p>
          </div>
        </div>
        {curso && (
          <button
            onClick={cambiarCurso}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 whitespace-nowrap"
          >
            Cambiar curso
          </button>
        )}
      </header>

      {!curso ? (
        /* Selección de curso */
        <main className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center text-center gap-6">
          <LumiFace className="w-16 h-16" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">¡Hola! Soy Lumi 🌱</h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-sm">
              Para ayudarte mejor con tu tarea, cuéntame primero: ¿en qué curso estás?
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-sm">
            {CURSOS.map(c => (
              <button
                key={c}
                onClick={() => elegirCurso(c)}
                className="rounded-2xl border border-violet-200 bg-white px-3 py-3 text-sm font-semibold text-violet-700 shadow-sm hover:bg-violet-50 active:scale-95 transition"
              >
                {c}
              </button>
            ))}
          </div>
        </main>
      ) : (
        <>
          {/* Aviso sin conexión */}
          {offline && (
            <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm text-center py-2 px-4">
              📡 Sin conexión. Lumi estará lista cuando vuelvas a conectarte.
            </div>
          )}

          {/* Área de chat */}
          <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'lumi' && (
                  <LumiFace className="w-8 h-8 mr-2 self-end" />
                )}
                <div className={`max-w-[80%] sm:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">{msg.time}</span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-base ml-2 flex-shrink-0 self-end">👤🏻</div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <LumiFace className="w-8 h-8 mr-2 self-end" />
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </main>

          {/* Input inferior */}
          <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-violet-400 focus-within:border-transparent transition">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={offline ? 'Sin conexión...' : 'Escribe tu mensaje...'}
                disabled={loading || offline}
                maxLength={500}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading || offline}
                className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-violet-700 transition flex-shrink-0"
                aria-label="Enviar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.903 6.23H13.5a.75.75 0 010 1.5H4.182l-1.903 6.23a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
