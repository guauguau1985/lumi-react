# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Idioma:** Responde siempre en **español** en este proyecto, tanto en el chat como en comentarios de código y mensajes de commit.

---

## ¿Qué es Lumi?

**Lumi** es una PWA educativa para niños de 9 a 12 años, construida con **React 19 + TypeScript + Vite + Tailwind CSS v4**. Usa **HashRouter** (`#/`) para el deploy en Vercel sin rewrites. Módulos activos: `math`, `eco`, `naturales`, `coder`, `ai`.

---

## Comandos

```bash
npm run dev        # Servidor de desarrollo Vite con HMR
npm run build      # TypeScript check + build de producción
npm run preview    # Sirve el build localmente
npx tsc --noEmit   # Solo verificar tipos (no hay test runner)
```

**Modo estricto activo** (`noUnusedLocals`, `noUnusedParameters`). Corregir todos los errores TypeScript antes de dar una tarea por terminada.

---

## Reglas

```
❌ No uses colores sueltos en componentes — todos los colores van en src/config/theme.ts.
❌ No importes desde src/pages/_legacy/ — código muerto, existe solo como historial.
❌ No uses rutas relativas que crucen límites de directorios — usa siempre el alias @/.
❌ No importes desde src/lib/supabaseClient.ts (ruta antigua) — usa src/shared/lib/supabaseClient.ts.
```

```
✅ Antes de crear algo, verifica que no exista ya.
✅ Al terminar, confirma: sin imports rotos, App.tsx y AppShell.tsx intactos, rutas únicas.
```

---

## Arquitectura

### Árbol de providers (`src/app/main.tsx`)

```
HashRouter
  GamificationProvider       ← XP, monedas, insignias, racha (localStorage)
    AppProviders (AppShell)
      ProgressProvider       ← desbloqueo/mejor puntaje por OA (localStorage)
        MoodProvider         ← mood del avatar ("feliz" | "confundida" | "pensativa")
          App                ← definición de rutas
```

Todo el estado de gamificación y progreso vive en `localStorage`. No hay estado de usuario en servidor para estas funciones.

### Patrón de módulos

```
src/modules/<módulo>/
  pages/   # Shell de routing + página landing del módulo
  games/   # Componentes individuales de cada juego
```

Cada juego es un **componente autocontenido** renderizado dentro del shell del módulo.

### Configuración de módulos — dos archivos

| Archivo | Rol |
|---|---|
| `src/config/modules.ts` | `MODULE_LIST` autoritativo: nombre, ruta, emoji, flag `enabled` |
| `src/shared/config/modules.ts` | Mapa booleano que consume `App.tsx` para registrar rutas condicionalmente |

`App.tsx` importa desde `src/shared/config/modules.ts`. Al activar o desactivar un módulo, actualizar **ambos archivos**. Poner `enabled: false` en `MODULE_LIST` elimina la ruta y oculta la tarjeta.

> Importante: `src/app/routes/Home.tsx` tiene los links de módulos hardcodeados y no lee ninguno de los dos configs — actualizarlo manualmente al agregar un módulo.

### Routing

`src/app/App.tsx` carga todos los shells con lazy loading y registra rutas condicionalmente via el mapa `modules`. Redirige a `<Navigate to="/" />` para rutas desconocidas.

---

## Sistemas clave

### Gamificación

```ts
// Disparar una recompensa desde cualquier juego:
const { dispatchEvent } = useGamification()
dispatchEvent({ module, gameId, type })
// GamificationContext otorga XP/monedas/insignias y dispara el overlay de celebración

// Fórmula de nivel:
Math.floor(xpTotal / 100) + 1
```

- Config de recompensas: `src/gamification/config.ts` — mapa `módulo → gameId → tipoEvento → { xp, coins, badge? }`
- Agregar una entrada ahí por cada juego nuevo.
- **`ModuleId` usa IDs legacy en español** (`matematicas`, `educacionAmbiental`) — distintos de los IDs de URL (`math`, `eco`). Verificar en `src/gamification/types.ts` al conectar módulos nuevos.

### Aprendizaje adaptativo + tracking de eventos

Usar **`useLearningTracker`** (no `useAdaptiveLearning` directamente) para juegos nuevos. Envuelve la lógica adaptativa + tracking fire-and-forget a Supabase con control de consentimiento:

```ts
const { state, trackAnswer, trackComplete, resetTracker } = useLearningTracker({
  modulo: 'math',
  tipoEjercicio: 'visual',  // opcional
  initialLevel: 1,
})

trackAnswer(isCorrect)   // registra respuesta y mide velocidad al primer intento
trackComplete()          // inserta learning_event con completado: true
// Al desmontar sin llamar trackComplete, inserta abandono: true automáticamente
```

`useLearningTracker` solo escribe en Supabase cuando `isProfileEnabled()` retorna `true` (consentimiento parental guardado en `localStorage` bajo la clave `lumi_perfil_habilitado`).

### Progreso (tracking por OA)

```ts
const { recordResult } = useProgress()
recordResult(oa, score)  // OA1–OA12, puntaje 0–100
```

### Tutor IA — dos puntos de entrada

| Componente | Caso de uso |
|---|---|
| `src/modules/ai/AIShell.tsx` | Chat de página completa en la ruta `/ai` |
| `src/shared/components/tutor/TutorWidget.tsx` | Overlay flotante embebible en cualquier juego |

`TutorWidget` acepta `topic`, `level`, `errorStreak` y `attempts`. Se auto-dispara cuando `errorStreak >= autoTriggerAt` (default 2). Ambos requieren sesión activa de Supabase Auth (bearer token) para llamar a la Edge Function.

```ts
<TutorWidget
  topic="fracciones"
  level={state.currentLevel}
  errorStreak={state.errorStreak}
  attempts={state.totalAnswers}
/>
```

### Supabase

- Usar siempre `src/shared/lib/supabaseClient.ts` para código nuevo.
- Edge Functions: `supabase/functions/tutor-ai/` (Gemini 1.5 Flash, persiste en `chat_history`) y `supabase/functions/compute-profile/` (construye `learning_profile` desde `learning_events`).
- Tracking de dispositivo: `src/shared/lib/deviceId.ts` — `getDeviceId()` (persiste en localStorage), `getSessionId()` (persiste en sessionStorage), `isProfileEnabled()` (gate de consentimiento).

---

## Estilos

- **Tailwind CSS v4** vía `@tailwindcss/vite`.
- Todos los colores en `src/config/theme.ts`. Revisarlo antes de tocar estilos.
- Tokens de color por módulo como CSS custom properties: `var(--color-math-text)`, `var(--color-ai-dot)`, etc.
- Alias `@/` → `src/` (configurado con `vite-tsconfig-paths`).

### Responsividad obligatoria

**Lumi se usa en PC, tablet y celular.** Todo componente nuevo o modificado debe funcionar en los tres tamaños.

```
✅ Usar siempre clases responsivas de Tailwind: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
✅ Texto: text-base sm:text-lg (nunca tamaño fijo que se vea mal en móvil)
✅ Padding: px-4 py-4 sm:px-6 sm:py-8 (más aire en pantallas grandes)
✅ Imágenes/íconos: tamaños relativos o con clases sm:/lg:
❌ No uses inline style con width/height fijos sin contraparte responsiva
❌ No uses grid-cols-3 sin un fallback de 1 o 2 columnas en móvil
```

Breakpoints de referencia (Tailwind v4 por defecto):
| Prefijo | Ancho mínimo | Dispositivo |
|---|---|---|
| (sin prefijo) | 0px | Móvil (prioridad base) |
| `sm:` | 640px | Tablet chica / landscape móvil |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |

---

## Tabla de decisiones

| Situación | Decisión correcta |
|---|---|
| Nuevo juego | Crearlo en `src/modules/<módulo>/games/` |
| Nuevo color | Agregarlo primero en `src/config/theme.ts` |
| Cliente Supabase | Usar `src/shared/lib/supabaseClient.ts` |
| Nuevo módulo | Actualizar ambos `modules.ts` + `src/app/routes/Home.tsx` |
| Tutor en un juego | Usar `TutorWidget` (se auto-dispara con `errorStreak >= 2`) |
| Recompensas de nuevo juego | Agregar entrada en `src/gamification/config.ts` |
| IDs de módulo en gamificación | Usar IDs legacy en español — ver `src/gamification/types.ts` |
| Tracking adaptativo | Usar `useLearningTracker`, no `useAdaptiveLearning` directamente |

---

## Checklist antes de dar una tarea por terminada

```
□ El proyecto compila sin errores (npm run build)
□ Sin imports rotos
□ App.tsx y AppShell.tsx sin cambios no intencionales
□ Cada juego nuevo tiene una ruta única
□ Colores nuevos están en theme.ts, no hardcodeados
□ Si se agregó módulo: ambos modules.ts actualizados + Home.tsx actualizado
□ Si se agregó juego con recompensas: entrada en gamification/config.ts
```
