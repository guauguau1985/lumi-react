# 🤖 CLAUDE.md — Guía de trabajo autónomo para Lumi

> Este archivo es el punto de entrada para Claude Code. Léelo completo antes de tocar cualquier archivo. Toda decisión de arquitectura, estilo o implementación debe pasar por estas reglas.

---

## ¿QUÉ ES LUMI?

**Lumi** es una PWA educativa para niños de 9 a 12 años. Construida con **React 19 + TypeScript + Vite + Tailwind CSS v4**. Usa **HashRouter** (`#/`) para deploy en Vercel sin rewrites.

**Módulos activos:** `math`, `eco`, `naturales`, `coder`, `ai`

El avatar de Lumi tiene estados de ánimo (`feliz | confundida | pensativa`) y el sistema de gamificación (XP, monedas, insignias, racha) es parte central de la experiencia infantil.

---

## COMANDOS

```bash
npm run dev        # servidor de desarrollo (Vite + HMR)
npm run build      # TypeScript check + build de producción
npm run preview    # sirve el build localmente
```

> ⚠️ No hay test runner. El lint se ejecuta con `tsc --noEmit` durante el build. **Modo estricto activo**: corregir `noUnusedLocals` y `noUnusedParameters` antes de cualquier commit.

---

## REGLAS OBLIGATORIAS — NUNCA ROMPER

```
❌ No rompas la app. Verifica que compila antes de dar por terminada cualquier tarea.
❌ No dupliques archivos, componentes ni lógica existente.
❌ No crees carpetas nuevas si ya existe una adecuada.
❌ No uses colores sueltos en componentes — todos los colores van en src/config/theme.ts.
❌ No importes desde src/pages/_legacy/ — es código muerto, existe solo como historial.
❌ No uses rutas relativas que crucen límites de directorios — usa siempre el alias @/.
```

```
✅ Antes de crear algo, busca si ya existe.
✅ Mantén imágenes, íconos, fondos y assets centralizados.
✅ Al terminar, verifica: imports rotos, App.tsx, AppShell.tsx, rutas únicas.
✅ Entrega siempre un resumen breve de los cambios realizados.
```

---

## ARQUITECTURA GENERAL

### Árbol de providers (`src/app/main.tsx`)

```
HashRouter
  GamificationProvider       ← XP, monedas, insignias, racha (localStorage)
    AppProviders (AppShell)
      ProgressProvider       ← desbloqueo/mejor puntaje por OA (localStorage)
        MoodProvider         ← mood del avatar ("feliz" | "confundida" | "pensativa")
          App                ← definición de rutas
```

> Todo el estado de gamificación y progreso vive en `localStorage`. No hay estado de usuario en servidor para estas funciones.

### Patrón de módulos

```
src/modules/<módulo>/
  pages/        # Shell de routing + página Home/landing del módulo
  games/        # Componentes individuales de cada juego
```

Cada juego es un **componente autocontenido** renderizado dentro del Shell del módulo (`MathShell`, `EcoHome`, etc.).

### Sistema de módulos — dos archivos sincronizados

| Archivo | Rol |
|---|---|
| `src/config/modules.ts` | `MODULE_LIST` autoritativo: nombre, ruta, emoji, flag `enabled` |
| `src/shared/config/modules.ts` | Mapa booleano simplificado para componentes compartidos |

**Regla:** Al activar o desactivar un módulo, actualizar **ambos archivos**. Poner `enabled: false` elimina la ruta del router y oculta la tarjeta en pantalla principal.

---

## ESTILOS

- **Tailwind CSS v4** vía `@tailwindcss/vite`.
- **Colores centralizados** en `src/config/theme.ts`. Revisar ese archivo antes de tocar estilos.
- Cada módulo tiene sus propios tokens de color como propiedades CSS custom:
  ```
  var(--color-math-text)
  var(--color-ai-dot)
  (etc.)
  ```
  Esto mantiene temas visuales distintos sin conflictos de clases.
- **Alias:** `@/` → `src/` (configurado con `vite-tsconfig-paths` + `tsconfig.json`).

---

## SISTEMAS CLAVE — CÓMO USARLOS

### Gamificación

```ts
// Desde cualquier juego, disparar recompensas:
dispatchEvent({ module, gameId, type })
// → GamificationContext otorga XP/monedas/insignias y dispara celebración

// Nivel calculado como:
Math.floor(xpTotal / 100) + 1
```

- Config de recompensas: `src/gamification/config.ts` → mapa `módulo → gameId → tipoEvento → { xp, coins, badge? }`
- Al agregar un juego nuevo: agregar su entrada en este archivo.
- **Atención:** `ModuleId` usa IDs legacy en español (`matematicas`, `educacionAmbiental`) — distintos de los IDs de URL (`math`, `eco`). Verificar al conectar módulos nuevos.

### Progreso y aprendizaje adaptativo

```ts
// En juegos de matemáticas:
const { recordResult } = useProgress()
recordResult(oa, score) // OA1–OA12, puntaje 0–100

// Aprendizaje adaptativo por sesión:
const { state, recordAnswer } = useAdaptiveLearning()
recordAnswer(isCorrect)         // llamar después de cada respuesta
state.currentLevel              // nivel actual (ajustado automáticamente)
state.reinforcement             // true si debe activarse refuerzo
```

**Lógica de nivel (reglas deterministas — sin IA):**
```js
if (accuracy >= 80%) subirNivel()
else if (accuracy >= 50%) mantenerNivel()
else bajarNivel()

if (erroresSeguidos >= 2) activarRefuerzo()
```

### Cliente Supabase

- Usar **siempre** `src/shared/lib/supabaseClient.ts` para código nuevo.
- `src/lib/supabaseClient.ts` es la ruta antigua — no importar desde ahí.
- Variables de entorno: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

### Módulo Tutor IA

- **Frontend:** `src/modules/ai/AIShell.tsx` — UI de chat, llama a Edge Function de Supabase. Requiere sesión de auth activa (bearer token).
- **Backend:** `supabase/functions/tutor-ai/index.ts` — Edge Function en Deno. Verifica auth, llama a **Gemini 1.5 Flash**, persiste historial en `chat_history`.
- Variables de entorno backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`.

---

## PLAN DE DESARROLLO v2 — ESTADO Y FASES

El objetivo es implementar tres capas:

1. **Aprendizaje adaptativo** — reglas deterministas (ya parcialmente implementadas)
2. **Tutor IA** — se activa solo en momentos clave, nunca interrumpe el flujo
3. **Perfil de aprendizaje dinámico** — construido con datos de uso, la IA solo traduce a lenguaje natural

> Principio rector: "El sistema adapta dificultad, observa patrones y construye un perfil. La IA solo traduce esos datos en lenguaje natural."

### Rol del tutor IA

| ✅ Lo que SÍ hace | ❌ Lo que NO hace |
|---|---|
| Explica el concepto | Decidir el nivel del niño |
| Guía paso a paso | Resolver el ejercicio directamente |
| Refuerza con ejemplos | Interrumpir sin ser llamado |

**El tutor solo se activa en dos casos:**
- `erroresSeguidos >= 2` → trigger automático del sistema
- Solicitud explícita del niño → botón UI "¿Me explicas?"

---

### FASE 1 — Base de datos (Supabase)

Crear las siguientes tablas si no existen:

#### `learning_events`
```json
{
  "user_id": "string | null",
  "device_id": "string (siempre presente)",
  "session_id": "string (uuid por sesión)",
  "timestamp": "Date",
  "accuracy": "number (0–100)",
  "attempts": "number",
  "erroresSeguidos": "number",
  "nivel": "number",
  "tiempoSesion": "number (segundos)",
  "horaUso": "number (0–23)",
  "tipoEjercicio": "visual | texto | interactivo",
  "completado": "boolean",
  "abandono": "boolean",
  "modulo": "math | eco | lenguaje | etc",
  "velocidadRespuesta": "number (milisegundos)"
}
```

#### `chat_history`
```json
{
  "id": "uuid",
  "session_id": "string",
  "user_id": "string | null",
  "device_id": "string",
  "timestamp": "Date",
  "role": "tutor | niño",
  "message": "string",
  "trigger_type": "error_seguido | solicitud_niño",
  "nivel_al_momento": "number",
  "tema_al_momento": "string",
  "errores_al_momento": "number"
}
```

#### `learning_profile`
```json
{
  "user_id": "string",
  "device_id": "string",
  "session_preference": "corta | media | larga",
  "learning_style": "visual | texto | interactivo | mixto",
  "best_time_range": "string (ej: '17:00–19:00')",
  "strengths": ["string"],
  "difficulties": ["string"],
  "bloqueo_detectado": ["string"],
  "data_confidence": "baja | media | alta",
  "total_eventos": "number",
  "perfil_habilitado": "boolean",
  "last_updated": "Date"
}
```

> **`device_id` es obligatorio siempre.** Permite capturar datos antes de que el padre cree cuenta. Al registrarse, hacer merge `device_id → user_id`.

---

### FASE 2 — Captura de eventos y adaptación

- Conectar frontend con tabla `learning_events`.
- Registrar `velocidadRespuesta` en milisegundos desde el render del ejercicio hasta el primer intento.
- Implementar `session_id` como UUID generado al inicio de cada sesión.
- Conectar con las reglas adaptativas existentes en `useAdaptiveLearning`.

---

### FASE 3 — Tutor IA con botón UI

#### Botón "¿Me explicas?" — especificación

```
Texto:     "¿Me explicas?"
Ícono:     bombilla o signo de pregunta (Tabler outline)
Tamaño:    botón grande, táctil (tablet/móvil)
Posición:  esquina inferior, visible durante el ejercicio, no intrusivo
Color:     color de marca Lumi, diferenciado del botón "Responder"
```

**Flujo del botón:**
1. Niño toca el botón → registrar `trigger_type: "solicitud_niño"` en `chat_history`
2. Enviar contexto (nivel, tema, último error) al tutor IA
3. Tutor responde en panel/burbuja diferenciada en pantalla
4. Niño puede responder al tutor o cerrar y volver al ejercicio

#### Input a la IA (estructura fija)

```json
{
  "message": "pregunta del niño o trigger automático",
  "level": 2,
  "topic": "multiplicación",
  "mistakes": 3,
  "attempts": 2
}
```

#### Reglas de respuesta del tutor

- Lenguaje simple para 9–12 años
- Máximo 3–4 oraciones por respuesta
- Ejemplos concretos y cotidianos
- **Nunca resolver directamente** — guiar con preguntas
- Si el niño insiste, dar un paso más, no la respuesta completa

---

### FASE 4 — Perfil de aprendizaje

#### Procesamiento (al finalizar cada sesión)

```js
// Estilo de aprendizaje
if (visual.completados > texto.completados) → "visual"
else if (interactivo.completados > ambos)   → "interactivo"
else                                         → "mixto"

// Sesión óptima
promedioDuracionSesion → "corta (<15min)" | "media (15–30min)" | "larga (>30min)"

// Horario de mejor rendimiento
cruzar accuracy + horaUso por franjas de 2h → best_time_range

// Fortalezas / dificultades
if (accuracy_promedio > 75% && avance_rapido)        → strengths.push(modulo)
if (erroresSeguidos frecuentes && bajo avance)        → difficulties.push(modulo)

// Bloqueo
if (erroresSeguidos > 2 en mismo tema en >= 3 sesiones) → bloqueo_detectado.push(tema)

// Confianza del perfil
if (total_eventos < 20)   → "baja"
else if (total_eventos < 100) → "media"
else                          → "alta"
```

#### Generación de texto con IA (input/output)

**Input:**
```json
{
  "learning_style": "visual",
  "best_time": "17:00–19:00",
  "strengths": ["sumas", "fracciones"],
  "difficulties": ["división"],
  "session_preference": "corta",
  "data_confidence": "media"
}
```

**Output esperado:**
> "El estudiante aprende mejor con apoyo visual y prefiere sesiones cortas. Su mejor rendimiento se registra entre las 17:00 y las 19:00. Muestra buena base en sumas y fracciones, y está desarrollando sus habilidades en división."

Si `data_confidence = "baja"`, incluir:
> "Este perfil tiene pocos datos por ahora. Las recomendaciones mejorarán con más sesiones."

#### Reporte para padres — secciones

```
1. Nivel de confianza del perfil   → baja / media / alta (con explicación)
2. Resumen general                 → texto generado por IA (2–3 oraciones)
3. Estilo de aprendizaje           → visual / texto / interactivo / mixto
4. Mejor horario                   → franja detectada
5. Duración óptima de sesión       → corta / media / larga
6. Fortalezas                      → lista de módulos/temas
7. Áreas en desarrollo             → lista de módulos/temas
8. Bloqueos detectados             → temas donde se atasca frecuentemente
9. Recomendaciones simples         → 2–3 sugerencias concretas para el padre
```

---

### FASE 5 — Privacidad y consentimiento

> ⚠️ **Requerimiento legal.** Lumi capta datos de comportamiento de menores.

**Flujo de onboarding del padre:**
1. Pantalla clara explicando qué datos se capturan y para qué.
2. Toggle explícito: **"Activar perfil de aprendizaje"** → **desactivado por defecto**.
3. Sin activación: solo se capturan eventos mínimos para adaptación de dificultad (sin perfil, sin reporte).

**Derecho al olvido:**
- Opción en configuración: **"Borrar perfil de aprendizaje"**
- Borra `learning_profile` + `learning_events` + `chat_history` del niño
- Requiere confirmación explícita del padre
- **Ninguna escritura en `learning_profile` ocurre si `perfil_habilitado = false`**

---

## TABLA DE DECISIONES DE ARQUITECTURA

| Situación | Decisión correcta |
|---|---|
| Nuevo juego | Crearlo en `src/modules/<módulo>/games/` |
| Nuevo color | Agregarlo primero en `src/config/theme.ts` |
| Cliente Supabase | Usar `src/shared/lib/supabaseClient.ts` |
| Nuevo módulo | Actualizar ambos `modules.ts` sincronizadamente |
| Trigger del tutor IA | Solo por `erroresSeguidos >= 2` o botón del niño |
| Recompensas de nuevo juego | Agregar entrada en `src/gamification/config.ts` |
| IDs de módulo en gamificación | Usar IDs legacy en español (ver `types.ts`) |
| Imports entre directorios | Siempre con alias `@/`, nunca rutas relativas |

---

## CHECKLIST ANTES DE DAR UNA TAREA POR TERMINADA

```
□ El proyecto compila sin errores (npm run build)
□ No hay imports rotos
□ App.tsx y AppShell.tsx siguen funcionando
□ Cada juego nuevo tiene una ruta única
□ Colores nuevos están en theme.ts, no hardcodeados
□ Si se agregó módulo: ambos modules.ts actualizados
□ Si se agregó juego con recompensas: entrada en gamification/config.ts
□ No se crearon carpetas redundantes
□ No se duplicó lógica existente
□ Se entregó resumen breve de cambios
```

---

*CLAUDE.md — Lumi v2. Generado para trabajo autónomo con Claude Code.*