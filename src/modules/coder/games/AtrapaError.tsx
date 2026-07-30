import { useState, useEffect } from "react";

const ejercicios = [
  { codigo: ["→", "↑", "→", "←", "↓"], labels: ["mover →", "mover ↑", "mover →", "mover ←", "mover ↓"], error: 1 },
  { codigo: ["→", "→", "↑", "↓", "←"], labels: ["mover →", "mover →", "mover ↑", "mover ↓", "mover ←"], error: 4 },
  { codigo: ["↑", "→", "↓", "→", "←"], labels: ["mover ↑", "mover →", "mover ↓", "mover →", "mover ←"], error: 2 },
];

export default function AtrapaError() {
  const [idx, setIdx] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [bloquesEstado, setBloquesEstado] = useState<string[]>([]);

  const ejercicio = ejercicios[idx];

  useEffect(() => {
    setBloquesEstado(Array(ejercicio.codigo.length).fill(""));
    setMensaje("");
  }, [idx]);

  const evaluar = (i: number) => {
    const esCorrecto = i === ejercicio.error;
    const nuevosEstados = [...bloquesEstado];
    nuevosEstados[i] = esCorrecto ? "correct" : "wrong";
    setBloquesEstado(nuevosEstados);
    setMensaje(esCorrecto ? "✅ ¡Correcto!" : "❌ Ese no es el error.");
    if (esCorrecto) {
      setTimeout(() => setIdx((idx + 1) % ejercicios.length), 1500);
    } else {
      setTimeout(() => setBloquesEstado(Array(ejercicio.codigo.length).fill("")), 1500);
    }
  };

  const reiniciar = () => setIdx(0);

  return (
    <div className="min-h-svh bg-emerald-50 text-center">
      <div className="bg-emerald-200 px-4 py-5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-800">🔧 Atrapa el Error</h1>
        <p className="mt-1 text-sm sm:text-base text-emerald-900">Encuentra el paso incorrecto en el circuito</p>
      </div>

      <div className="px-4 py-5">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <img src="/img/lumi/face.png" alt="Lumi confundida" className="w-16 sm:w-20" />
          <div className="bg-emerald-100 rounded-xl px-4 py-2 max-w-xs text-sm sm:text-base text-left">
            ¡Oh no! Algo no funciona. Toca el paso equivocado.
          </div>
        </div>

        <div className="text-base sm:text-lg mb-3 text-emerald-900">
          Ejercicio <span>{idx + 1}</span> de <span>{ejercicios.length}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 my-5">
          {ejercicio.codigo.map((flecha, i) => (
            <div key={i} className="flex items-center">
              <button
                type="button"
                onClick={() => evaluar(i)}
                title={ejercicio.labels[i]}
                className={`w-16 h-10 sm:w-20 sm:h-11 flex items-center justify-center rounded-md border-2 border-emerald-400 transition-colors ${
                  bloquesEstado[i] === "correct"
                    ? "bg-emerald-200"
                    : bloquesEstado[i] === "wrong"
                    ? "bg-red-200"
                    : "bg-emerald-100"
                }`}
              >
                {flecha}
              </button>
              {i < ejercicio.codigo.length - 1 && (
                <span className="text-xl sm:text-2xl text-emerald-400 mx-1">→</span>
              )}
            </div>
          ))}
        </div>

        <div className="text-lg sm:text-xl my-4">{mensaje}</div>

        <button
          type="button"
          onClick={reiniciar}
          className="mt-4 bg-emerald-400 hover:bg-emerald-500 text-white px-5 py-2 rounded-md text-base transition-colors"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
