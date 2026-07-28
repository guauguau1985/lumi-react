import { useState, useEffect } from "react";

export default function CarreraLumi() {
  const totalCasillas = 10;
  const [posicion, setPosicion] = useState(0);
  const [pregunta, setPregunta] = useState("");
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(0);
  const [opciones, setOpciones] = useState<number[]>([]);
  const [mensaje, setMensaje] = useState("");

  const preguntas = [];
  for (let t = 5; t <= 6; t++) {
    for (let i = 1; i <= 10; i++) {
      preguntas.push({ pregunta: `${t} × ${i}`, respuesta: t * i });
    }
  }

  const mezclar = (array: number[]) => [...array].sort(() => Math.random() - 0.5);

  const mostrarPregunta = () => {
    const actual = preguntas[Math.floor(Math.random() * preguntas.length)];
    setPregunta(actual.pregunta);
    setRespuestaCorrecta(actual.respuesta);

    const opciones = [actual.respuesta];
    while (opciones.length < 4) {
      const val = Math.floor(Math.random() * 40) + 1;
      if (!opciones.includes(val)) opciones.push(val);
    }
    setOpciones(mezclar(opciones));
  };

  const verificarRespuesta = (resp: number) => {
    if (resp === respuestaCorrecta) {
      setMensaje("¡Correcto! Lumi avanza 2 casillas.");
      setPosicion(Math.min(posicion + 2, totalCasillas - 1));
    } else {
      setMensaje("Uy... Lumi retrocede 1 casilla.");
      setPosicion(Math.max(posicion - 1, 0));
    }

    setTimeout(() => {
      if (posicion >= totalCasillas - 1) {
        setPregunta("🎉 ¡Lumi llegó al parque con sus amigos!");
        setOpciones([]);
      } else {
        mostrarPregunta();
      }
    }, 1500);
  };

  useEffect(() => {
    mostrarPregunta();
  }, []);

  return (
    <div className="min-h-svh bg-emerald-50 text-center px-4 py-5">
      <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-800">🏁 Carrera de Lumi al parque</h1>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 justify-items-center max-w-md sm:max-w-2xl mx-auto my-6">
        {[...Array(totalCasillas)].map((_, i) => (
          <div
            key={i}
            className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-base sm:text-lg bg-emerald-100 border-2 border-emerald-500 rounded-md"
          >
            {i === posicion && (
              <img src="/img/lumi/feliz.png" alt="Lumi" className="absolute -top-8 w-10 sm:w-12" />
            )}
            {i + 1}
          </div>
        ))}
      </div>

      <div className="text-lg sm:text-xl my-4">{pregunta && `¿Cuánto es ${pregunta}?`}</div>

      <div className="flex flex-wrap justify-center gap-2">
        {opciones.map((num, i) => (
          <button
            key={i}
            type="button"
            onClick={() => verificarRespuesta(num)}
            className="bg-emerald-400 hover:bg-emerald-500 text-white rounded-md px-5 py-2 text-base sm:text-lg transition-colors"
          >
            {num}
          </button>
        ))}
      </div>

      <div className="mt-5 text-lg sm:text-xl">{mensaje}</div>
    </div>
  );
}
