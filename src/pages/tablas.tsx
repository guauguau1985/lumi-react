import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function Tablas() {
  const [pregunta, setPregunta] = useState('');
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(0);
  const [opciones, setOpciones] = useState<number[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [posicion, setPosicion] = useState(0);
  const totalCasillas = 8;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generarPregunta = () => {
    const tabla = Math.floor(Math.random() * 2) + 5; // 5 o 6
    const num = Math.floor(Math.random() * 10) + 1;
    const correcta = tabla * num;

    setPregunta(`${tabla} × ${num}`);
    setRespuestaCorrecta(correcta);

    const opciones = [correcta];
    while (opciones.length < 4) {
      const val = Math.floor(Math.random() * 60) + 1;
      if (!opciones.includes(val)) opciones.push(val);
    }

    setOpciones(opciones.sort(() => Math.random() - 0.5));
    setMensaje('');
  };

  const lanzarConfeti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const verificarRespuesta = (resp: number) => {
    if (resp === respuestaCorrecta) {
      setMensaje('✅ ¡Correcto!');
      setPosicion((prev) => Math.min(prev + 1, totalCasillas - 1));
      lanzarConfeti();
    } else {
      setMensaje('❌ Uy... Intenta otra vez');
    }

    setTimeout(() => {
      generarPregunta();
    }, 1400);
  };

  useEffect(() => {
    generarPregunta();
  }, []);

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundImage: 'linear-gradient(to bottom, #f0fdf4, #ccfbf1)',
      textAlign: 'center',
      padding: '30px',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#065f46' }}>🧮 Juego de Tablas</h1>

      {/* Carrera visual */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '30px 0'
      }}>
        {[...Array(totalCasillas)].map((_, i) => (
          <div key={i} style={{
            width: '60px',
            height: '60px',
            margin: '5px',
            backgroundColor: '#d1fae5',
            border: '2px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            position: 'relative'
          }}>
            {i === posicion && (
              <img
                src="/img/lumi_feliz.png"
                alt="Lumi"
                style={{ position: 'absolute', top: '-55px', width: '45px' }}
              />
            )}
            {i + 1}
          </div>
        ))}
      </div>

      {/* Pregunta actual */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          backgroundColor: '#d1fae5',
          display: 'inline-block',
          padding: '15px 20px',
          borderRadius: '10px',
          fontSize: '24px',
          color: '#065f46'
        }}>
          ¿Cuánto es {pregunta}?
        </div>
      </div>

      {/* Opciones */}
      <div>
        {opciones.map((op, i) => (
          <button
            key={i}
            onClick={() => verificarRespuesta(op)}
            style={{
              backgroundColor: '#34d399',
              color: 'white',
              fontSize: '18px',
              padding: '12px 20px',
              margin: '10px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Mensaje */}
      <div style={{ fontSize: '20px', marginTop: '20px', color: '#047857' }}>{mensaje}</div>
    </div>
  );
}
