// src/modules/tarea/pages/TareaShell.tsx
// Página placeholder del módulo "Ayúdame con mi tarea".
// Contenido completo viene próximamente.

import { Link } from "react-router-dom";

export default function TareaShell() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div
        className="
          w-full max-w-sm rounded-3xl px-8 py-10 shadow-lg
          bg-[var(--color-surface)] border-4 border-[var(--color-tarea-border)]
          flex flex-col items-center gap-5
        "
      >
        <span className="text-6xl sm:text-7xl">📖</span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-tarea-text)]">
          Ayúdame con mi tarea
        </h1>

        <p className="text-base sm:text-lg font-semibold text-[var(--color-muted-foreground)]">
          ¡Próximamente!
        </p>

        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
          Estamos preparando algo genial para ayudarte con tus tareas escolares.
          ¡Vuelve pronto!
        </p>

        <span
          className="
            inline-block w-3 h-3 rounded-full
            bg-[var(--color-tarea-dot)]
            animate-pulse
          "
        />
      </div>

      <Link
        to="/"
        className="
          mt-8 text-sm font-semibold text-[var(--color-tarea-text)]
          underline underline-offset-2 hover:opacity-70 transition-opacity
        "
      >
        ← Volver al menú
      </Link>
    </div>
  );
}
