import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tesseract (OCR local en el frontend) solo lee texto impreso de forma
// confiable. Esta función usa un modelo con visión (GPT-4o mini) para
// transcribir tanto el enunciado impreso como la letra manuscrita del
// estudiante, algo que Tesseract no puede hacer. El frontend llama esta
// función primero para imágenes y recurre a Tesseract solo si esta falla o
// no está configurada (ver extractImageWithVision.ts / extractHomeworkFile.ts).
const VISION_PROMPT = `Estás ayudando a transcribir una foto de una tarea escolar chilena (de 5° básico a 1° medio) para que una tutora de IA pueda revisarla.

Transcribe TODO el texto visible de la imagen: tanto el impreso (enunciados, preguntas, instrucciones) como cualquier texto escrito a mano por el estudiante (sus respuestas o avance).

Responde usando exactamente este formato, sin nada más:

[IMPRESO]
(aquí el texto impreso, tal como aparece, conservando el orden de la página)

[MANUSCRITO]
(aquí el texto escrito a mano, tal como se ve. Si no hay nada escrito a mano, escribe exactamente: "Sin respuestas escritas a mano visibles.")

No agregues explicaciones, resúmenes ni comentarios fuera de esas dos secciones. Si una palabra manuscrita no se entiende con certeza, transcribe tu mejor interpretación y agrega "(?)" justo después de esa palabra.`;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
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
    if (!token) return json({ error: "Inicia sesión para subir imágenes." }, 401);

    const {
      data: { user },
      error: authError,
    } = await service.auth.getUser(token);
    if (authError || !user) return json({ error: "La sesión ya no es válida." }, 401);

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      // El frontend interpreta cualquier respuesta no-OK como "recurre a
      // Tesseract"; devolvemos un mensaje claro solo para los logs.
      console.error("extract-homework-image: OPENAI_API_KEY no configurada");
      return json({ error: "vision_not_configured" }, 501);
    }

    const body = await req.json().catch(() => ({}));
    const imageBase64 = typeof body?.image_base64 === "string" ? body.image_base64 : "";
    const mimeType =
      typeof body?.mime_type === "string" && body.mime_type.startsWith("image/")
        ? body.mime_type
        : "image/jpeg";

    if (!imageBase64) return json({ error: "Falta la imagen." }, 400);
    // ~10 MB de archivo original crecen ~33% al codificar en base64.
    if (imageBase64.length > 14_000_000) {
      return json({ error: "La imagen es demasiado grande." }, 400);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        max_tokens: 1800,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: VISION_PROMPT },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
            ],
          },
        ],
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error(
        "OpenAI vision error",
        response.status,
        JSON.stringify(payload).slice(0, 500)
      );
      return json({ error: "No pudimos leer la imagen por ahora." }, 502);
    }

    const text =
      typeof payload.choices?.[0]?.message?.content === "string"
        ? payload.choices[0].message.content.trim()
        : "";
    if (!text) return json({ error: "No pudimos leer la imagen por ahora." }, 502);

    return json({ text });
  } catch (error) {
    console.error("extract-homework-image", error);
    return json({ error: "No pudimos leer la imagen por ahora." }, 500);
  }
});
