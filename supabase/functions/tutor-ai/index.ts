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

    // Auth opcional: autenticado o anónimo (device_id)
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    let user = null;
    if (token) {
      const { data: { user: u } } = await supabase.auth.getUser(token);
      user = u ?? null;
    }

    // Leer cuerpo
    const body = await req.json();
    const message = body?.message;
    if (!message || typeof message !== "string") {
      return new Response("Mensaje inválido", { status: 400, headers: CORS });
    }
    const clean = message.trim().slice(0, 500);

    // Campos de contexto
    const sessionId: string | undefined = body?.session_id;
    const deviceId: string | undefined = body?.device_id;
    const triggerType: string | undefined = body?.trigger_type;
    const nivelAlMomento: number | undefined = body?.level;
    const temaAlMomento: string | undefined = body?.topic;
    const erroresAlMomento: number | undefined = body?.mistakes;
    const cursoAlMomento: string | undefined = body?.grade;

    // Filtro de entrada
    if (BANNED.some((w) => clean.toLowerCase().includes(w))) {
      return json({ reply: "Hablemos de cosas interesantes. ¿Qué materia quieres practicar hoy? 😊" });
    }

    // Construir system prompt con contexto del ejercicio cuando está disponible
    let activeSystemPrompt = SYSTEM_PROMPT;
    if (temaAlMomento || cursoAlMomento || triggerType === "error_seguido") {
      const ctx: string[] = [];
      if (cursoAlMomento) ctx.push(`El niño está en ${cursoAlMomento}. Adapta tu vocabulario y la complejidad de tus explicaciones a ese curso.`);
      if (temaAlMomento) ctx.push(`El niño está practicando: ${temaAlMomento}.`);
      if (nivelAlMomento !== undefined) ctx.push(`Nivel actual: ${nivelAlMomento}.`);
      if (erroresAlMomento !== undefined && erroresAlMomento >= 2) {
        ctx.push(`Ha cometido ${erroresAlMomento} errores seguidos en este tema.`);
      }
      if (triggerType === "error_seguido") {
        ctx.push("El sistema detectó que el niño necesita apoyo. Explica el concepto de forma simple con un ejemplo diferente. No resuelvas el ejercicio directamente.");
      }
      if (ctx.length > 0) {
        activeSystemPrompt += "\n\nContexto del ejercicio actual:\n" + ctx.join(" ");
      }
    }

    // Historial reciente solo si hay sesión activa (roles OpenAI: user/assistant)
    const histMessages: Array<{ role: string; content: string }> = [];
    if (user) {
      const { data: hist } = await supabase
        .from("chat_history")
        .select("role, message")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      histMessages.push(
        ...(hist ?? []).reverse().map((m) => ({
          role: m.role === "niño" ? "user" : "assistant",
          content: m.message,
        }))
      );
    }

    // Llamada a DeepSeek (formato OpenAI)
    const apiKey = Deno.env.get("DEEPSEEK_API_KEY")!;
    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: activeSystemPrompt },
          ...histMessages,
          { role: "user", content: clean },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const dsJson = await dsRes.json();

    if (!dsRes.ok) {
      console.error("DeepSeek HTTP error:", dsRes.status, JSON.stringify(dsJson).slice(0, 300));
      return json({ reply: FALLBACK_ERROR });
    }

    if (dsJson.choices?.[0]?.finish_reason === "content_filter") {
      return json({ reply: FALLBACK_SAFE });
    }

    const reply: string =
      dsJson.choices?.[0]?.message?.content ?? FALLBACK_SAFE;

    if (BANNED.some((w) => reply.toLowerCase().includes(w))) {
      return json({ reply: FALLBACK_SAFE });
    }

    // Guardar en chat_history solo si hay sesión y perfil_habilitado = true
    if (user && deviceId) {
      const { data: profileRow } = await supabase
        .from("learning_profile")
        .select("perfil_habilitado")
        .eq("device_id", deviceId)
        .maybeSingle();

      if (profileRow?.perfil_habilitado) {
        await supabase.from("chat_history").insert([
          {
            user_id:            user.id,
            session_id:         sessionId ?? null,
            device_id:          deviceId,
            role:               "niño",
            message:            clean,
            trigger_type:       triggerType ?? null,
            nivel_al_momento:   nivelAlMomento ?? null,
            tema_al_momento:    temaAlMomento ?? null,
            errores_al_momento: erroresAlMomento ?? null,
          },
          {
            user_id:            user.id,
            session_id:         sessionId ?? null,
            device_id:          deviceId,
            role:               "tutor",
            message:            reply,
            trigger_type:       null,
            nivel_al_momento:   nivelAlMomento ?? null,
            tema_al_momento:    temaAlMomento ?? null,
            errores_al_momento: null,
          },
        ]);
      }
    }

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
