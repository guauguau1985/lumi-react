import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LABELS: Record<string, string> = {
  math: "Matemáticas",
  naturales: "Ciencias naturales",
  eco: "Educación ambiental",
  coder: "Tecnología y programación",
  ai: "Tutor Lumi",
  tarea: "Tareas escolares",
  lenguaje: "Lenguaje",
  ingles: "Inglés",
  historia: "Historia",
  tecnologia: "Tecnología",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function average(values: number[]) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

function label(value: string) {
  return LABELS[value] ?? value;
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
    if (!token) return json({ error: "Autenticación requerida" }, 401);
    const {
      data: { user },
    } = await service.auth.getUser(token);
    if (!user) return json({ error: "Sesión inválida" }, 401);

    const body = await req.json().catch(() => ({}));
    const childId =
      typeof body?.child_id === "string" && body.child_id ? body.child_id : user.id;

    if (childId !== user.id) {
      const { data: link } = await service
        .from("family_links")
        .select("id")
        .eq("parent_id", user.id)
        .eq("child_id", childId)
        .maybeSingle();
      if (!link) return json({ error: "No tienes acceso a este perfil." }, 403);
    }

    const [{ data: existing }, { data: events }, { data: tasks }, { data: game }] =
      await Promise.all([
        service
          .from("learning_profile")
          .select("*")
          .eq("user_id", childId)
          .maybeSingle(),
        service
          .from("learning_events")
          .select("*")
          .eq("user_id", childId)
          .order("created_at", { ascending: true }),
        service
          .from("homework_tasks")
          .select("*")
          .eq("child_id", childId)
          .order("created_at", { ascending: false }),
        service
          .from("gamification_profiles")
          .select("*")
          .eq("user_id", childId)
          .maybeSingle(),
      ]);

    if (existing?.perfil_habilitado === false) {
      return json({
        enabled: false,
        profile: existing,
        summary: null,
        recommendations: [],
      });
    }

    const allEvents = events ?? [];
    const completed = allEvents.filter((event) => event.completado);
    const confidence =
      allEvents.length >= 50 ? "alta" : allEvents.length >= 12 ? "media" : "baja";

    const typeCounts: Record<string, number> = {};
    for (const event of completed) {
      if (event.tipo_ejercicio) {
        typeCounts[event.tipo_ejercicio] = (typeCounts[event.tipo_ejercicio] ?? 0) + 1;
      }
    }
    const rankedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    let learningStyle: "visual" | "texto" | "interactivo" | "mixto" | null = null;
    if (rankedTypes.length) {
      learningStyle =
        rankedTypes.length > 1 && rankedTypes[1][1] / rankedTypes[0][1] >= 0.75
          ? "mixto"
          : (rankedTypes[0][0] as "visual" | "texto" | "interactivo");
    }

    const sessionTimes = completed
      .map((event) => event.tiempo_sesion)
      .filter((value): value is number => typeof value === "number" && value > 0);
    const avgSession = average(sessionTimes);
    const sessionPreference =
      avgSession === null
        ? null
        : avgSession < 900
          ? "corta"
          : avgSession < 1800
            ? "media"
            : "larga";

    const timeBands: Record<string, number[]> = {};
    for (const event of completed) {
      if (event.hora_uso === null || event.accuracy === null) continue;
      const start = Math.floor(event.hora_uso / 2) * 2;
      const band = `${String(start).padStart(2, "0")}:00–${String(start + 2).padStart(2, "0")}:00`;
      (timeBands[band] ??= []).push(event.accuracy);
    }
    const bestBand = Object.entries(timeBands)
      .filter(([, values]) => values.length >= 2)
      .map(([band, values]) => [band, average(values) ?? 0] as const)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const byArea: Record<
      string,
      { accuracies: number[]; errors: number[]; completions: number; attempts: number }
    > = {};
    for (const event of allEvents) {
      const area = event.subject || event.modulo || "general";
      const bucket = (byArea[area] ??= {
        accuracies: [],
        errors: [],
        completions: 0,
        attempts: 0,
      });
      if (event.accuracy !== null) bucket.accuracies.push(event.accuracy);
      bucket.errors.push(event.errores_seguidos ?? 0);
      bucket.attempts += event.attempts ?? 0;
      if (event.completado) bucket.completions += 1;
    }

    const strengths: string[] = [];
    const difficulties: string[] = [];
    const adaptiveLevels: Record<string, number> = {};
    for (const [area, bucket] of Object.entries(byArea)) {
      const accuracy = average(bucket.accuracies);
      const latestLevel =
        [...allEvents]
          .reverse()
          .find((event) => (event.subject || event.modulo || "general") === area)?.nivel ?? 1;
      if (accuracy !== null) {
        if (accuracy >= 80 && bucket.completions > 0) strengths.push(label(area));
        if (accuracy < 50 || average(bucket.errors)! >= 2) difficulties.push(label(area));
        adaptiveLevels[area] = Math.max(
          1,
          Math.min(10, latestLevel + (accuracy >= 80 ? 1 : accuracy < 50 ? -1 : 0))
        );
      } else {
        adaptiveLevels[area] = latestLevel;
      }
    }

    const blocks = Object.entries(byArea)
      .filter(([, bucket]) => bucket.errors.filter((value) => value >= 2).length >= 2)
      .map(([area]) => label(area));
    const completedTasks = (tasks ?? []).filter((task) => task.status === "completed").length;
    const profileData = {
      user_id: childId,
      device_id: existing?.device_id ?? `user:${childId}`,
      learning_style: learningStyle,
      session_preference: sessionPreference,
      best_time_range: bestBand,
      strengths,
      difficulties,
      bloqueo_detectado: blocks,
      data_confidence: confidence,
      total_eventos: allEvents.length,
      perfil_habilitado: true,
      last_updated: new Date().toISOString(),
    };

    if (existing?.id) {
      await service.from("learning_profile").update(profileData).eq("id", existing.id);
    } else {
      await service.from("learning_profile").insert(profileData);
    }

    const summary =
      allEvents.length === 0 && (tasks ?? []).length === 0
        ? "El perfil está listo. El resumen aparecerá a medida que complete actividades y tareas."
        : strengths.length
          ? `Ha avanzado especialmente bien en ${strengths.slice(0, 2).join(" y ")}. ${
              difficulties.length
                ? `Conviene acompañar un poco más ${difficulties.slice(0, 2).join(" y ")}.`
                : "Por ahora no se observan dificultades persistentes."
            }`
          : `Lumi ya registró ${allEvents.length} actividades y ${completedTasks} tareas completadas. El perfil todavía está aprendiendo qué apoyos le resultan mejores.`;

    const recommendations: string[] = [];
    if (difficulties.length) {
      recommendations.push(
        `Practicar ${difficulties[0]} en bloques breves, con un ejemplo guiado antes de cada desafío.`
      );
    }
    if (bestBand) {
      recommendations.push(
        `Cuando sea posible, reservar el bloque ${bestBand}, que ha mostrado mejor rendimiento.`
      );
    }
    if (blocks.length) {
      recommendations.push(
        `Revisar ${blocks[0]} junto a Lumi: detectó errores repetidos y ofrecerá una explicación alternativa.`
      );
    }
    if (recommendations.length < 3) {
      recommendations.push(
        "Pedir que explique con sus propias palabras lo aprendido antes de pasar al siguiente nivel."
      );
    }
    if (recommendations.length < 3) {
      recommendations.push(
        "Mantener una rutina corta y frecuente, celebrando el esfuerzo además del resultado."
      );
    }

    return json({
      enabled: true,
      profile: profileData,
      summary,
      recommendations: recommendations.slice(0, 3),
      adaptive_levels: adaptiveLevels,
      stats: {
        total_events: allEvents.length,
        completed_activities: completed.length,
        total_tasks: (tasks ?? []).length,
        completed_tasks: completedTasks,
        average_session_seconds: avgSession === null ? 0 : Math.round(avgSession),
        xp_total: game?.xp_total ?? 0,
        level: game?.level ?? 1,
        streak_days: game?.streak_days ?? 0,
      },
      recent_tasks: (tasks ?? []).slice(0, 8),
    });
  } catch (error) {
    console.error("compute-profile", error);
    return json({ error: "No pudimos calcular el perfil de aprendizaje." }, 500);
  }
});
