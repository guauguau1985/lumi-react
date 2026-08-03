import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Voz cálida y pausada para una tutora escolar chilena. El estilo base se
// combina con una variante corta según el `context` que mande el frontend
// (ver src/shared/config/voice.ts, que debe mantenerse coherente con esto).
const BASE_VOICE_STYLE =
  "Habla en español de Chile, con un tono cálido, amable y cercano, como una " +
  "tutora joven a la que realmente le importa que a este niño o niña le vaya " +
  "bien. Usa un ritmo natural y ligeramente pausado, con pequeñas variaciones " +
  "de entonación y pausas breves entre ideas. Es muy paciente y está " +
  "acostumbrada a trabajar con niños y niñas que necesitan más tiempo o apoyo " +
  "para aprender. Cuando el texto reconoce un logro, un intento o un avance " +
  "del niño, dilo con calidez genuina y refuerzo positivo real —que se note " +
  "que estás contenta con su esfuerzo, no solo con el resultado—, sin sonar " +
  "exagerada ni artificial. Transmite motivación, seguridad y gusto por " +
  "enseñar. No hables como locutora. No uses tono infantilizado, " +
  "condescendiente ni exageradamente alegre. Evita mantener la misma " +
  "entonación en todas las frases. Pronuncia con claridad y termina las " +
  "oraciones de manera natural.";

const CONTEXT_STYLE: Record<string, string> = {
  explanation:
    "Este texto es una explicación paso a paso: léelo claro, pausado, y marca " +
    "ligeramente la transición entre cada paso, como si dieras tiempo para pensar.",
  encouragement:
    "Este texto es una frase de ánimo, felicitación o refuerzo positivo: dilo " +
    "con calidez genuina y alegría real por el esfuerzo o el logro del niño, " +
    "breve y auténtico, sin sonar ensayado ni exagerado.",
  instruction:
    "Este texto es una instrucción directa: dilo amable pero directo, sin rodeos.",
  story:
    "Este texto es parte de una historia o ejemplo: dilo un poco más expresivo " +
    "que de costumbre, pero sin exagerar ni cambiar de personaje.",
};

const ALLOWED_VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
]);
const DEFAULT_VOICE = "nova";
// Ritmo base: levemente más lento que el 1.0 por defecto de OpenAI, para que
// suene pausada sin arrastrar las palabras. El botón "Lenta" del frontend
// multiplica esto todavía más vía audio.playbackRate, sin generar audio nuevo.
const DEFAULT_SPEED = 0.95;
const MAX_TEXT_LENGTH = 2000;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
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
    if (!token) return json({ error: "Inicia sesión para escuchar a Lumi." }, 401);

    const {
      data: { user },
      error: authError,
    } = await service.auth.getUser(token);
    if (authError || !user) return json({ error: "La sesión ya no es válida." }, 401);

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      // El frontend interpreta cualquier respuesta no-OK como "usa la voz
      // nativa del dispositivo como respaldo" (ver useOpenAiSpeech.ts).
      console.error("generate-speech: OPENAI_API_KEY no configurada");
      return json({ error: "voice_not_configured" }, 501);
    }

    const body = await req.json().catch(() => ({}));
    const text = typeof body?.text === "string" ? body.text.trim().slice(0, MAX_TEXT_LENGTH) : "";
    if (!text) return json({ error: "Falta el texto a leer." }, 400);

    const context = typeof body?.context === "string" ? body.context : "";
    const requestedVoice = typeof body?.voice === "string" ? body.voice : "";
    const voice = ALLOWED_VOICES.has(requestedVoice) ? requestedVoice : DEFAULT_VOICE;

    const speedValue = Number(body?.speed);
    const speed =
      Number.isFinite(speedValue) && speedValue >= 0.25 && speedValue <= 4
        ? speedValue
        : DEFAULT_SPEED;

    const instructions = [BASE_VOICE_STYLE, CONTEXT_STYLE[context]].filter(Boolean).join("\n\n");

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        input: text,
        voice,
        instructions,
        response_format: "mp3",
        speed,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      console.error(
        "OpenAI TTS error",
        response.status,
        JSON.stringify(errorPayload).slice(0, 500)
      );
      return json({ error: "No pudimos generar la voz por ahora." }, 502);
    }

    const audioBuffer = await response.arrayBuffer();
    if (audioBuffer.byteLength === 0) {
      return json({ error: "No pudimos generar la voz por ahora." }, 502);
    }

    return json({
      audio_base64: arrayBufferToBase64(audioBuffer),
      mime_type: "audio/mpeg",
      voice,
    });
  } catch (error) {
    console.error("generate-speech", error);
    return json({ error: "No pudimos generar la voz por ahora." }, 500);
  }
});
