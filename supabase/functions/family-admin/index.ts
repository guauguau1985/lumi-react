import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const service = createClient(supabaseUrl, serviceRoleKey);
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Autenticación requerida" }, 401);
    const {
      data: { user },
    } = await service.auth.getUser(token);
    if (!user) return json({ error: "Sesión inválida" }, 401);

    const body = await req.json();
    const childId = typeof body?.child_id === "string" ? body.child_id : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!childId || password.length < 8 || password.length > 64) {
      return json({ error: "Usa una contraseña de 8 a 64 caracteres." }, 400);
    }

    const { data: link } = await service
      .from("family_links")
      .select("id")
      .eq("parent_id", user.id)
      .eq("child_id", childId)
      .maybeSingle();
    if (!link) return json({ error: "No tienes acceso a este perfil." }, 403);

    // The Admin SDK's user update can fail with an empty error object for older
    // accounts that were imported directly into auth.users. Calling GoTrue's
    // documented admin endpoint works for both imported and newly created users.
    const updateResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(childId)}`,
      {
        method: "PUT",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );
    if (!updateResponse.ok) {
      const detail = await updateResponse.text();
      console.error("family-admin update", updateResponse.status, detail);
      if (updateResponse.status === 404) {
        return json({ error: "La cuenta del estudiante no existe en Supabase." }, 404);
      }
      if (updateResponse.status === 422) {
        return json(
          { error: "La contraseña no cumple los requisitos de seguridad." },
          422
        );
      }
      return json(
        { error: "Supabase no pudo actualizar esta cuenta. Intenta nuevamente." },
        502
      );
    }
    return json({ ok: true });
  } catch (error) {
    console.error("family-admin", error);
    return json({ error: "No pudimos cambiar la contraseña." }, 500);
  }
});
