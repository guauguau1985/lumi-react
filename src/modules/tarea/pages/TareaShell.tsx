export default function TareaShell() {
  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ayúdame con mi tarea</h1>
        <p className="text-sm text-gray-500 mt-1">Sube la tarea y Lumy te ayuda paso a paso</p>
      </header>

      {/* Sección central */}
      <main className="flex-1 overflow-y-auto bg-gray-100 flex items-center justify-center px-4 py-8">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-base sm:text-lg font-medium">
            Chat con Lumy — Próximamente funcionalidad completa
          </p>
        </div>
      </main>

      {/* Input inferior */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
        />
      </div>
    </div>
  );
}
