import { useState } from "react";

export default function CaminoComandos() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [lumiPos, setLumiPos] = useState(0);

  const cells = Array(25).fill("");
  cells[0] = "L";
  cells[24] = "🌳";

  const addCommand = (cmd: string) => {
    setSequence([...sequence, cmd]);
  };

  const runCommands = () => {
    let pos = lumiPos;
    sequence.forEach((cmd) => {
      if (cmd === "↑" && pos >= 5) pos -= 5;
      if (cmd === "↓" && pos < 20) pos += 5;
      if (cmd === "←" && pos % 5 !== 0) pos -= 1;
      if (cmd === "→" && pos % 5 !== 4) pos += 1;
    });
    setLumiPos(pos);
    setTimeout(() => {
      alert(
        pos === 24
          ? "🎉 ¡Bien hecho! Lumi llegó al parque 🌳"
          : "⛔ Aún no llegamos, intenta ajustar los comandos."
      );
    }, 100);
  };

  const reset = () => {
    setSequence([]);
    setLumiPos(0);
  };

  return (
    <div className="min-h-svh bg-emerald-50 px-4 py-5 text-center">
      <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-800">🧭 Camino de Comandos</h1>
      <p className="mt-1 text-sm sm:text-base text-emerald-900">Ayuda a Lumi a llegar al 🌳 usando comandos</p>

      <div className="grid grid-cols-5 gap-1 sm:gap-2 max-w-xs sm:max-w-sm mx-auto my-6">
        {cells.map((cell, i) => (
          <div
            key={i}
            className="relative aspect-square flex items-center justify-center text-lg sm:text-2xl bg-emerald-100 border-2 border-emerald-500 rounded-md"
          >
            {i === lumiPos ? (
              <img src="/img/lumi/feliz.png" alt="Lumi" className="absolute w-3/4" />
            ) : (
              cell
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {["↑", "↓", "←", "→"].map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => addCommand(cmd)}
            className="px-4 py-2 text-base rounded-md bg-emerald-400 hover:bg-emerald-500 text-white transition-colors"
          >
            {cmd}
          </button>
        ))}
        <button
          type="button"
          onClick={runCommands}
          className="px-4 py-2 text-base rounded-md bg-emerald-800 hover:bg-emerald-900 text-white transition-colors"
        >
          Ejecutar
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 text-base rounded-md bg-red-400 hover:bg-red-500 text-white transition-colors"
        >
          Reiniciar
        </button>
      </div>

      <div className="mt-3 text-base sm:text-lg break-words">
        Secuencia: {sequence.join(" ")}
      </div>
    </div>
  );
}
