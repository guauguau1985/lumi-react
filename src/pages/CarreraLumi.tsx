import { useState, useEffect } from 'react';

export default function CarreraLumi() {
  const totalCasillas = 10;
  const [posicion, setPosicion] = useState(0);
  const [pregunta, setPregunta] = useState('');
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(0);
  const [opciones, setOpciones] = useState<number[]>([]);
  const [mensaje, setMensaje] = useState('');

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
      setMensaje('¡Correcto! Lumi avanza 2 casillas.');
      setPosicion(Math.min(posicion + 2, totalCasillas - 1));
    } else {
      setMensaje('Uy... Lumi retrocede 1 casilla.');
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
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ecfdf5', textAlign: 'center', padding: '20px', minHeight: '100vh' }}>
      <h1 style={{ color: '#065f46' }}>🏁 Carrera de Lumi al parque</h1>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
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
              <img src="/img/Lumi_feliz.png" alt="Lumi" style={{ position: 'absolute', top: '-50px', width: '50px' }} />
            )}
            {i + 1}
          </div>
        ))}
      </div>

      <div style={{ fontSize: '24px', margin: '20px' }}>{pregunta && `¿Cuánto es ${pregunta}?`}</div>

      <div>
        {opciones.map((num, i) => (
          <button key={i} onClick={() => verificarRespuesta(num)} style={btnStyle}>{num}</button>
        ))}
      </div>

      <div style={{ marginTop: '20px', fontSize: '20px' }}>{mensaje}</div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  backgroundColor: '#34d399',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  padding: '10px 20px',
  margin: '10px',
  fontSize: '18px',
  cursor: 'pointer'
};
