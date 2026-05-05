import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres Lumi, una tutora virtual amigable y paciente para niños y niñas de 9 a 12 años.
Reglas importantes:
- Explica todo con palabras muy sencillas, ejemplos divertidos y analogías que los niños entiendan.
- Tono siempre cálido y alentador. Nunca uses sarcasmo ni críticas negativas.
- Si la pregunta no es educativa, responde: "Prefiero ayudarte con tus estudios. ¿De qué materia quieres aprender? 📚"
- Nunca compartas links externos, datos personales ni información que identifique al niño.
- Jamás hables de política, violencia, drogas, religión ni contenido sexual o adulto.
- Máximo 3 oraciones cortas por respuesta. Sé concisa y muy clara.
- Idioma siempre español neutro. Usa emojis con moderación para hacer las respuestas amigables.`;

const BANNED = [
  "idiota", "estúpido", "estupido", "imbécil", "imbecil",
  "mierda", "puta", "puto", "culo", "culero", "pendejo", "cabrón", "cabron",
];

const FALLBACK_SAFE = "Prefiero ayudarte con temas escolares. ¿Probamos con matemáticas o ciencias? 📚";
const FALLBACK_ERROR = "¡Ups! Algo salió mal. Intenta de nuevo en un momento. 🔧";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verificar sesión
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return new Response("No autorizado", { status: 401, headers: CORS });

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return new Response("No autorizado", { status: 401, headers: CORS });

    // Leer mensaje
    const body = await req.json();
    const message = body?.message;
    if (!message || typeof message !== "string") {
      return new Response("Mensaje inválido", { status: 400, headers: CORS });
    }
    const clean = message.trim().slice(0, 500);

    // Filtro de entrada
    if (BANNED.some((w) => clean.toLowerCase().includes(w))) {
      return json({ reply: "Hablemos de cosas interesantes. ¿Qué materia quieres practicar hoy? 😊" });
    }

    // Historial reciente (últimos 8 mensajes = 4 intercambios)
    const { data: hist } = await supabase
      .from("chat_history")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8);

    const contents = [
      ...(hist ?? []).reverse().map((m) => ({
        role: m.role as "user" | "model",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: clean }] },
    ];

    // Llamada a Gemini 1.5 Flash (REST, sin SDK)
    const apiKey = Deno.env.get("GEMINI_API_KEY")!;
    const gemRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE"    },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      }
    );

    const gemJson = await gemRes.json();

    // Si Gemini bloqueó por seguridad
    if (gemJson.candidates?.[0]?.finishReason === "SAFETY") {
      return json({ reply: FALLBACK_SAFE });
    }

    const reply: string =
      gemJson.candidates?.[0]?.content?.parts?.[0]?.text ?? FALLBACK_SAFE;

    // Filtro de salida
    if (BANNED.some((w) => reply.toLowerCase().includes(w))) {
      return json({ reply: FALLBACK_SAFE });
    }

    // Guardar en historial
    await supabase.from("chat_history").insert([
      { user_id: user.id, role: "user",  content: clean },
      { user_id: user.id, role: "model", content: reply },
    ]);

    return json({ reply });
  } catch (err) {
    console.error("tutor-ai error:", err);
    return json({ reply: FALLBACK_ERROR });
  }
});

function json(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
