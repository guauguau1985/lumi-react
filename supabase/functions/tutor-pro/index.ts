// Tutor de Lumi Pro (adultos). Función separada de tutor-ai para no afectar
// en nada al tutor de los niños. Solo responde a cuentas con role = 'parent'.
//
// Reglas pedagógicas (ver la investigación "Cómo aprenden IA los adultos"):
// - No entrega la respuesta completa: pregunta, da una pista y deja que la
//   persona intente (Bastani et al., PNAS 2025).
// - Divide en pasos y trabaja sobre el contenido de la lección (Kestin y
//   Miller, 2025).
// - Pide revisar críticamente lo que produce la IA.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_PROMPT = `Eres el tutor de Lumi Pro, una app chilena donde personas adultas aprenden a usar inteligencia artificial en su trabajo.
Hablas con adultos ocupados: trátalos de tú, con respeto y sin infantilizar.

Reglas:
- No hagas el trabajo por la persona. Si pide la respuesta completa, primero pregúntale qué intentó y dale una pista concreta.
- Una idea por respuesta. Divide en pasos y avanza solo cuando la persona complete el actual.
- Usa ejemplos de su área de trabajo cuando la conozcas.
- Cuando corresponda, recuérdale verificar cifras, datos actuales y citas, y no pegar datos confidenciales en herramientas de IA.
- Si la persona comparte datos personales reales (RUT, sueldos, nombres de clientes), sugiérele reemplazarlos por etiquetas como [NOMBRE].
- Responde en español claro y neutro chileno. Texto simple, sin Markdown, sin asteriscos ni títulos.
- Sé breve: normalmente entre 60 y 150 palabras.
- Si te preguntan quién te creó: eres una inteligencia artificial dentro de Lumi Pro, creada por Katerine Padilla. No inventes más detalles.`;

const AREA_LABELS: Record<string, string> = {
  administracion: "administración y finanzas",
  ventas: "ventas y atención a clientes",
  docencia: "docencia y educación",
  salud: "salud",
  emprendimiento: "emprendimiento y pyme",
  general: "no indicada",
};

const MAX_HISTORY = 10;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseHistory(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-MAX_HISTORY)
    .map((item) => {
      const role =
        item?.role === "assistant" ? ("assistant" as const) : item?.role === "user" ? ("user" as const) : null;
      const content = clip(item?.content, 2000);
      return role && content ? { role, content } : null;
    })
    .filter((item): item is { role: "user" | "assistant"; content: string } => item !== null);
}

async function deepSeek(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  const key = Deno.env.get("DEEPSEEK_API_KEY");
  if (!key) throw new Error("DEEPSEEK_API_KEY no configurada");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages,
      temperature: 0.5,
      max_tokens: 600,
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    console.error("DeepSeek error", response.status, JSON.stringify(payload).slice(0, 500));
    throw new Error("El tutor no está disponible por ahora.");
  }
  return clip(payload.choices?.[0]?.message?.content, 6000);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Inicia sesión para usar el tutor." }, 401);

    const {
      data: { user },
      error: authError,
    } = await service.auth.getUser(token);
    if (authError || !user) return json({ error: "La sesión ya no es válida." }, 401);

    const { data: profile } = await service
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "parent") {
      return json({ error: "Lumi Pro es solo para cuentas de adultos." }, 403);
    }

    const body = await req.json();
    const mode = clip(body?.mode, 40) || "chat";
    const area = AREA_LABELS[clip(body?.area, 40)] ?? AREA_LABELS.general;
    const lessonTitle = clip(body?.lesson_title, 160) || "sin lección";
    const lessonGoal = clip(body?.lesson_goal, 400);

    const lessonContext = `Lección actual: ${lessonTitle}.${lessonGoal ? ` Objetivo: ${lessonGoal}` : ""}
Área de trabajo de la persona: ${area}.`;

    if (mode === "practice_feedback") {
      const instruction = clip(body?.instruction, 800);
      const practice = clip(body?.practice_text, 4000);
      const criteria = Array.isArray(body?.criteria)
        ? body.criteria.map((item: unknown) => clip(item, 200)).filter(Boolean).slice(0, 6)
        : [];
      if (!practice) return json({ error: "Escribe tu práctica antes de pedir revisión." }, 400);

      const reply = await deepSeek([
        {
          role: "system",
          content: `${BASE_PROMPT}

${lessonContext}
Vas a revisar la práctica de la persona.
Consigna que recibió: ${instruction}
Criterios para revisar:
${criteria.map((item: string, index: number) => `${index + 1}. ${item}`).join("\n")}

Cómo responder:
1. Reconoce en una frase lo que está bien hecho, siendo específico.
2. Elige SOLO el criterio más importante que falte o se pueda mejorar.
3. Explica por qué importa, en una o dos frases.
4. Da una pista o una pregunta para que la persona lo mejore ella misma. No reescribas su práctica completa.
5. Si cumple todos los criterios, felicítala brevemente y sugiere un desafío extra pequeño.`,
        },
        { role: "user", content: practice },
      ]);
      return json({ reply: reply || "No pude revisar tu práctica esta vez. Intenta de nuevo." });
    }

    const message = clip(body?.message, 2000);
    if (!message) return json({ error: "Escribe una pregunta." }, 400);

    const reply = await deepSeek([
      { role: "system", content: `${BASE_PROMPT}\n\n${lessonContext}` },
      ...parseHistory(body?.history),
      { role: "user", content: message },
    ]);
    return json({ reply: reply || "No pude responder esta vez. ¿Puedes preguntarme de nuevo?" });
  } catch (error) {
    console.error("tutor-pro", error);
    return json({ error: "El tutor tuvo un problema. Intenta nuevamente en un momento." }, 500);
  }
});
