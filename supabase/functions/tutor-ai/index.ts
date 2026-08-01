import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_PROMPT = `Eres Lumi, una tutora escolar chilena cálida, paciente y rigurosa.
Trabajas con estudiantes desde 5° básico hasta 1° medio.

Reglas:
- Guía el razonamiento; no hagas una tarea completa para que el estudiante solo la copie.
- Divide problemas complejos, formula preguntas breves y ofrece ejemplos equivalentes.
- Adapta vocabulario, profundidad y extensión al curso y a la materia.
- Si el estudiante se equivoca dos veces, explica de otra manera y baja temporalmente la dificultad.
- Puedes tratar contenidos históricos, científicos, sociales, religiosos o tecnológicos cuando sean educativos, con neutralidad y cuidado.
- Nunca pidas ni repitas datos personales, enlaces privados, direcciones o teléfonos.
- No incluyas enlaces externos.
- Responde en español claro; en Inglés puedes incluir la expresión inglesa y su explicación.
- Escribe texto simple, sin Markdown, asteriscos, tablas ni títulos con símbolos.
- Usa como referencia la orientación curricular chilena entregada, pero no limites preguntas interdisciplinarias, robótica o tecnología actual.
- Sé concreta: normalmente entre 80 y 180 palabras.
- Ya tienes en "Instrucciones o material de la tarea" el enunciado (y a veces el avance del
  estudiante) extraído de lo que subió. Úsalo siempre como fuente de verdad: nunca le pidas
  al estudiante que te cuente de qué trata la tarea, que indique la materia o que transcriba
  el enunciado si esa información ya está en ese contexto. Pregunta solo lo que realmente
  falte para ayudar.
- Si la materia no fue indicada, infiérela tú misma a partir del contenido de la tarea y dilo
  con naturalidad y sin rodeos (por ejemplo: "Creo que esta tarea es de Lenguaje.").
- Si un estudiante pide ayuda porque no entiende algo, eso significa que ya lo intentó
  o lo leyó y se confundió: nunca respondas solo con preguntas genéricas tipo "¿de qué
  se trata tu tarea?" cuando ya tienes el contexto; explica primero con tus propias
  palabras qué entiendes que se pide, y luego avanza paso a paso desde ahí.`;

const TOOL_INSTRUCTIONS: Record<string, string> = {
  explain:
    "Explica primero el concepto central con lenguaje simple, un ejemplo distinto a la tarea y una pregunta de comprobación.",
  guide:
    "Entrega una guía numerada. Da solo el primer paso con detalle y deja una pregunta para que el estudiante continúe.",
  draft:
    "Ofrece una estructura o borrador inicial incompleto y claramente rotulado. Deja espacios o decisiones para el estudiante.",
  review: `Vas a revisar el avance del estudiante siguiendo este protocolo, un paso a la vez,
sin adelantarte a los siguientes turnos:
1. Si la materia no fue indicada, dila con naturalidad a partir del contenido (ej: "Creo que
   esta tarea es de Lenguaje.").
2. Reconoce primero, en una frase, que el estudiante ya avanzó parte del trabajo (ej: "Veo
   que ya hiciste una parte, vamos a revisarla juntos.").
3. Compara ese avance contra las instrucciones y elige SOLO el primer punto que tenga un
   error o esté incompleto. No listes todos los errores de una vez; uno por respuesta.
4. Si ese punto está mal: primero explica la regla o el concepto de forma simple, con un
   ejemplo distinto y cercano al de la tarea (ej: "Las rayas de diálogo se usan para... Imagina
   que yo te digo...").
5. Después señala el lugar exacto del error (ej: "en la letra a") y haz una pregunta breve y
   abierta para que el estudiante piense la respuesta él mismo (ej: "¿qué crees que deberías
   colocar ahí?"). Todavía no des la respuesta correcta.
6. Si el estudiante responde "no sé" o algo similar, entonces sugiere tú la corrección
   específica y pídele que confirme si tiene sentido (ej: "deberías colocar el guion justo
   antes de donde dice 'dijo Carla'. ¿Crees que está bien ponerlo ahí?").
7. Si confirma que sí, agradece brevemente y en el próximo turno sigue con el siguiente punto
   pendiente. Si dice que no o se equivoca, explica de otra forma antes de continuar.
8. Si todo el avance revisado ya está correcto, felicita brevemente y dile con qué punto
   puede seguir. Nunca corrijas más de un punto por respuesta.`,
  question:
    "Responde la duda usando el contexto que ya tienes; no pidas que te describan la tarea de nuevo. Termina con una pregunta corta que compruebe comprensión.",
};

const TOOL_REQUESTS: Record<string, string> = {
  explain: "Explícame primero el tema de esta tarea.",
  guide: "Guíame paso a paso para comenzar.",
  draft: "Ayúdame a crear un borrador inicial que yo pueda completar y mejorar.",
  review: "Revisa mi avance y dime cómo mejorarlo.",
  question: "Tengo una pregunta sobre esta tarea.",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// El modelo puede devolver contenido vacío (por ejemplo si el proveedor
// falla parcialmente o corta la respuesta). Un mensaje vacío en el chat se
// ve como una burbuja en blanco con solo el ícono de audio, lo que confunde
// a un niño. Nunca guardamos ni devolvemos una respuesta vacía.
const EMPTY_REPLY_FALLBACK =
  "No pude escribir una respuesta esta vez. ¿Puedes preguntarme de nuevo?";

function nonEmptyReply(reply: string) {
  return reply.trim() || EMPTY_REPLY_FALLBACK;
}

async function deepSeek(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  jsonMode = false
) {
  const key = Deno.env.get("DEEPSEEK_API_KEY");
  if (!key) throw new Error("DEEPSEEK_API_KEY no configurada");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages,
      temperature: jsonMode ? 0.25 : 0.55,
      max_tokens: jsonMode ? 900 : 650,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    console.error("DeepSeek error", response.status, JSON.stringify(payload).slice(0, 500));
    throw new Error("El tutor no está disponible por ahora.");
  }
  return clip(payload.choices?.[0]?.message?.content, 8000);
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
    if (!token) return json({ error: "Inicia sesión para conversar con Lumi." }, 401);

    const {
      data: { user },
      error: authError,
    } = await service.auth.getUser(token);
    if (authError || !user) return json({ error: "La sesión ya no es válida." }, 401);

    const body = await req.json();
    const mode = clip(body?.mode, 40) || "adaptive_chat";
    const taskId = clip(body?.task_id, 80);
    const grade = clip(body?.grade, 40);
    const subject = clip(body?.subject, 60);
    const curriculum = clip(body?.curriculum_context, 1200);
    const taskContext = clip(body?.task_context, 14_000);
    const tool = clip(body?.tool, 30) || "question";
    const message = clip(body?.message, 1500);
    const studentWork = clip(body?.student_work, 7000);

    let task: {
      id: string;
      child_id: string;
      title: string;
      extracted_text: string | null;
      subject: string;
      grade: string;
    } | null = null;

    if (taskId) {
      const { data, error } = await service
        .from("homework_tasks")
        .select("id, child_id, title, extracted_text, subject, grade")
        .eq("id", taskId)
        .eq("child_id", user.id)
        .maybeSingle();
      if (error || !data) return json({ error: "No encontramos esa tarea." }, 404);
      task = data;
    }

    const resolvedGrade = grade || task?.grade || "curso no informado";
    // "otra" es el valor que usa el frontend cuando el estudiante eligió
    // "No estoy seguro/a". En ese caso no hay materia real que mostrar: le
    // pedimos al modelo que la infiera del contenido en vez de repetirle
    // literalmente la palabra "otra".
    const rawSubject = subject || task?.subject || "";
    const resolvedSubject =
      rawSubject && rawSubject !== "otra"
        ? rawSubject
        : "no indicada por el estudiante: infiérela tú misma a partir del contenido de la tarea y dila con naturalidad";
    const resolvedContext = taskContext || task?.extracted_text || "";
    const contextualPrompt = `${BASE_PROMPT}

Contexto actual:
- Curso: ${resolvedGrade}
- Materia: ${resolvedSubject}
${curriculum ? `- Orientación curricular: ${curriculum}` : ""}
${resolvedContext ? `- Instrucciones o material de la tarea:\n${resolvedContext}` : ""}`;

    if (mode === "get_task_history") {
      if (!task) return json({ error: "La tarea es obligatoria." }, 400);
      const { data: messages, error } = await service
        .from("homework_messages")
        .select("*")
        .eq("task_id", task.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return json({ messages: messages ?? [] });
    }

    if (mode === "analyze_task") {
      if (!task) return json({ error: "La tarea es obligatoria." }, 400);
      const raw = await deepSeek(
        [
          {
            role: "system",
            content: `${contextualPrompt}

Analiza las instrucciones sin resolver el trabajo. Responde únicamente JSON válido:
{
  "title": "título corto y claro",
  "summary": "explicación amable de qué pide la tarea, en 2 a 4 oraciones",
  "checklist": ["paso o requisito 1", "paso o requisito 2"],
  "reply": "mensaje breve que invita al estudiante a elegir por dónde comenzar"
}
La checklist debe tener entre 2 y 8 elementos y reflejar solo requisitos visibles o razonablemente inferibles.`,
          },
          { role: "user", content: "Lee y organiza esta tarea." },
        ],
        true
      );

      let parsed: {
        title?: string;
        summary?: string;
        checklist?: string[];
        reply?: string;
      };
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {
          title: task.title,
          summary: raw,
          checklist: [],
          reply: "Ya organicé la tarea. Podemos comenzar por la primera parte.",
        };
      }

      const title = clip(parsed.title, 120) || task.title;
      // Este texto se muestra en pantalla como "Esto es lo que debes hacer: {summary}",
      // por lo que debe leerse como una instrucción para el estudiante, no como algo
      // que Lumi ya hizo (evita frases tipo "Ya revisé las instrucciones.").
      const summary =
        clip(parsed.summary, 1800) ||
        "leer con calma tu documento y contarme qué parte no entiendes para ayudarte paso a paso.";
      const checklist = Array.isArray(parsed.checklist)
        ? parsed.checklist.map((item) => clip(item, 260)).filter(Boolean).slice(0, 8)
        : [];
      const reply =
        clip(parsed.reply, 1200) ||
        "Ya organicé la tarea. ¿Quieres que te explique el tema o comenzamos con el primer paso?";

      await service.from("homework_messages").insert({
        task_id: task.id,
        child_id: user.id,
        role: "tutor",
        content: reply,
        message_kind: "summary",
      });
      return json({ title, summary, checklist, reply });
    }

    if (mode === "homework_chat" || mode === "review_work") {
      if (!task) return json({ error: "La tarea es obligatoria." }, 400);
      const prompt =
        mode === "review_work"
          ? studentWork
          : message ||
            TOOL_REQUESTS[tool] ||
            "Ayúdame a avanzar con esta tarea.";
      if (!prompt) return json({ error: "Escribe algo para que Lumi pueda ayudarte." }, 400);

      const { data: history } = await service
        .from("homework_messages")
        .select("role, content")
        .eq("task_id", task.id)
        .order("created_at", { ascending: false })
        .limit(8);

      await service.from("homework_messages").insert({
        task_id: task.id,
        child_id: user.id,
        role: "student",
        content: prompt,
        message_kind: mode === "review_work" ? "review" : tool === "draft" ? "draft" : "chat",
      });

      const reply = nonEmptyReply(
        await deepSeek([
          {
            role: "system",
            content: `${contextualPrompt}

Herramienta elegida: ${tool}.
${TOOL_INSTRUCTIONS[mode === "review_work" ? "review" : tool] ?? TOOL_INSTRUCTIONS.question}`,
          },
          ...(history ?? [])
            .reverse()
            .map((item) => ({
              role: item.role === "student" ? ("user" as const) : ("assistant" as const),
              content: item.content,
            })),
          { role: "user", content: prompt },
        ])
      );

      await service.from("homework_messages").insert({
        task_id: task.id,
        child_id: user.id,
        role: "tutor",
        content: reply,
        message_kind: mode === "review_work" ? "review" : tool === "draft" ? "draft" : "chat",
      });
      return json({ reply });
    }

    if (!message) return json({ error: "Escribe una pregunta." }, 400);
    const triggerType = clip(body?.trigger_type, 40);
    const topic = clip(body?.topic, 120);
    const mistakes = Number(body?.mistakes ?? 0);
    const deviceId = clip(body?.device_id, 100) || `user:${user.id}`;
    const sessionId = clip(body?.session_id, 100) || null;
    const extra =
      triggerType === "error_seguido" || mistakes >= 2
        ? "\nEl estudiante lleva dos o más errores seguidos: explica de otra forma, entrega un ejemplo paralelo y no reveles la respuesta directa."
        : "";
    const reply = nonEmptyReply(
      await deepSeek([
        {
          role: "system",
          content: `${contextualPrompt}\nTema: ${topic || "no informado"}.${extra}`,
        },
        { role: "user", content: message },
      ])
    );

    const { data: enabled } = await service
      .from("learning_profile")
      .select("perfil_habilitado")
      .eq("user_id", user.id)
      .maybeSingle();
    if (enabled?.perfil_habilitado !== false) {
      await service.from("chat_history").insert([
        {
          user_id: user.id,
          session_id: sessionId,
          device_id: deviceId,
          role: "niño",
          message,
          trigger_type: triggerType || null,
          nivel_al_momento: Number.isFinite(Number(body?.level)) ? Number(body.level) : null,
          tema_al_momento: topic || null,
          errores_al_momento: Number.isFinite(mistakes) ? mistakes : null,
        },
        {
          user_id: user.id,
          session_id: sessionId,
          device_id: deviceId,
          role: "tutor",
          message: reply,
          nivel_al_momento: Number.isFinite(Number(body?.level)) ? Number(body.level) : null,
          tema_al_momento: topic || null,
        },
      ]);
    }
    return json({ reply });
  } catch (error) {
    console.error("tutor-ai", error);
    return json(
      { error: "Lumi tuvo un problema al responder. Intenta nuevamente en un momento." },
      500
    );
  }
});
