import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { LumiAvatar } from "@/shared/components/lumi/LumiAvatar";
import { getDeviceId, getSessionId } from "@/shared/lib/deviceId";
import { supabase } from "@/shared/lib/supabaseClient";

type Role = "user" | "model";

interface Message {
  id: string;
  role: Role;
  text: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const MAX_STORED_MESSAGES = 50;
const CHAT_STORAGE_VERSION = 1;

async function callTutor(
  text: string,
  conversation: Message[],
  grade?: string | null,
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Sin sesión");

  const recentConversation = conversation
    .filter((item) => item.id !== "welcome" && !item.id.startsWith("e-"))
    .slice(-10)
    .map((item) => ({
      role: item.role === "user" ? "user" : "assistant",
      content: item.text,
    }));

  const res = await fetch(`${SUPABASE_URL}/functions/v1/tutor-ai`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: text,
      grade,
      device_id: getDeviceId(),
      session_id: getSessionId(),
      conversation: recentConversation,
    }),
  });

  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json();
  if (typeof data.reply !== "string" || !data.reply.trim()) {
    throw new Error("Respuesta vacía");
  }
  return data.reply.trim();
}

const WELCOME: Message = {
  id: "welcome",
  role: "model",
  text: "¡Hola! Soy Lumi, tu tutora 🌟 ¿En qué materia te puedo ayudar hoy? Puedo explicarte matemáticas, ciencias, naturales… ¡lo que necesites!",
};

function messageId(prefix: "u" | "m" | "e") {
  return `${prefix}-${crypto.randomUUID()}`;
}

function storageKey(userId?: string) {
  return userId ? `lumi-ai-chat:${userId}` : "";
}

function readStoredMessages(userId?: string): Message[] {
  const key = storageKey(userId);
  if (!key) return [WELCOME];

  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "null") as {
      version?: number;
      messages?: unknown;
    } | null;
    if (saved?.version !== CHAT_STORAGE_VERSION || !Array.isArray(saved.messages)) {
      return [WELCOME];
    }

    const valid = saved.messages.filter((item): item is Message => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<Message>;
      return (
        typeof candidate.id === "string" &&
        (candidate.role === "user" || candidate.role === "model") &&
        typeof candidate.text === "string" &&
        candidate.text.trim().length > 0
      );
    });

    return valid.length > 0 ? valid.slice(-MAX_STORED_MESSAGES) : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

function storeMessages(userId: string | undefined, messages: Message[]) {
  const key = storageKey(userId);
  if (!key) return;

  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        version: CHAT_STORAGE_VERSION,
        messages: messages.slice(-MAX_STORED_MESSAGES),
      }),
    );
  } catch {
    // Si el navegador bloquea el almacenamiento, el chat sigue funcionando
    // durante la sesión actual.
  }
}

export default function AIShell() {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() =>
    readStoredMessages(session?.user.id),
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detectar conexión
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Una recarga de la PWA no debe borrar una conversación en curso.
  useEffect(() => {
    storeMessages(session?.user.id, messages);
  }, [messages, session?.user.id]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading || offline) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: messageId("u"), role: "user", text },
    ]);
    setLoading(true);

    try {
      const reply = await callTutor(text, messages, profile?.grade);
      setMessages((prev) => [
        ...prev,
        { id: messageId("m"), role: "model", text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: messageId("e"), role: "model", text: "¡Ups! Algo salió mal. Intenta de nuevo en un momento. 🔧" },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col min-h-svh bg-[var(--color-background)]">

      {/* Header */}
      <header
        className="
          flex items-center gap-3 px-4 py-3
          bg-[var(--color-surface)] border-b border-[var(--color-card-border)] shadow-sm
        "
      >
        <Link
          to="/"
          className="
            px-3 py-1 rounded-lg border text-sm shadow-sm
            bg-[var(--color-surface)] border-[var(--color-card-border)]
            text-[var(--color-foreground)]
          "
        >
          ⬅️ Inicio
        </Link>

        <LumiAvatar size={32} />

        <div>
          <h1 className="text-base font-extrabold text-[var(--color-ai-text)] leading-tight">
            🤖 Lumi Tutora
          </h1>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Tu asistente de estudio
          </p>
        </div>
      </header>

      {/* Aviso sin conexión */}
      {offline && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm text-center py-2 px-4">
          📡 Sin conexión. El tutor estará listo cuando vuelvas a conectarte.
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4" aria-live="polite">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.role === "model" && (
              <div className="shrink-0">
                <LumiAvatar size={34} />
              </div>
            )}

            <div
              className={`
                max-w-[86%] sm:max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap
                ${msg.role === "user"
                  ? "bg-[var(--color-ai-dot)] text-white rounded-br-none"
                  : "bg-[var(--color-surface)] border border-[var(--color-ai-border)] text-[var(--color-foreground)] rounded-bl-none"
                }
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Indicador de escritura */}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="shrink-0">
              <LumiAvatar size={34} />
            </div>
            <div
              className="
                bg-[var(--color-surface)] border border-[var(--color-ai-border)]
                px-4 py-3 rounded-2xl rounded-bl-none shadow-sm
              "
            >
              <div className="flex gap-1.5 items-center">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-2 h-2 rounded-full bg-[var(--color-ai-dot)] animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[var(--color-card-border)] bg-[var(--color-surface)]">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={offline ? "Sin conexión..." : "Escribe tu pregunta aquí..."}
            disabled={loading || offline}
            maxLength={1500}
            className="
              flex-1 rounded-xl border px-4 py-2.5 text-sm
              bg-[var(--color-background)] text-[var(--color-foreground)]
              border-[var(--color-card-border)]
              outline-none focus:border-[var(--color-ai-border)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || offline}
            className="
              px-5 py-2.5 rounded-xl text-sm font-bold text-white
              bg-[var(--color-ai-dot)]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-opacity
            "
          >
            Enviar
          </button>
        </div>

        <p className="text-center text-xs text-[var(--color-muted-foreground)] mt-2">
          Lumi puede cometer errores. Consulta siempre con tu profe 🎓
        </p>
      </div>
    </div>
  );
}
