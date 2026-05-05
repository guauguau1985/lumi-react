import { useState, useEffect } from 'react';

const ejercicios = [
  { codigo: ['→', '↑', '→', '←', '↓'], labels: ['mover →', 'mover ↑', 'mover →', 'mover ←', 'mover ↓'], error: 1 },
  { codigo: ['→', '→', '↑', '↓', '←'], labels: ['mover →', 'mover →', 'mover ↑', 'mover ↓', 'mover ←'], error: 4 },
  { codigo: ['↑', '→', '↓', '→', '←'], labels: ['mover ↑', 'mover →', 'mover ↓', 'mover →', 'mover ←'], error: 2 },
];

export default function AtrapaError() {
  const [idx, setIdx] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [bloquesEstado, setBloquesEstado] = useState<string[]>([]);

  const ejercicio = ejercicios[idx];

  useEffect(() => {
    setBloquesEstado(Array(ejercicio.codigo.length).fill(''));
    setMensaje('');
  }, [idx]);

  const evaluar = (i: number) => {
    const esCorrecto = i === ejercicio.error;
    const nuevosEstados = [...bloquesEstado];
    nuevosEstados[i] = esCorrecto ? 'correct' : 'wrong';
    setBloquesEstado(nuevosEstados);
    setMensaje(esCorrecto ? '✅ ¡Correcto!' : '❌ Ese no es el error.');
    if (esCorrecto) {
      setTimeout(() => setIdx((idx + 1) % ejercicios.length), 1500);
    } else {
      setTimeout(() => setBloquesEstado(Array(ejercicio.codigo.length).fill('')), 1500);
    }
  };

  const reiniciar = () => {
    setIdx(0);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0fdf4', minHeight: '100vh', padding: '0', margin: '0', textAlign: 'center' }}>
      <div style={{ background: '#bbf7d0', padding: '20px' }}>
        <h1 style={{ color: '#047857', margin: 0 }}>🔧 Atrapa el Error</h1>
        <p style={{ margin: '5px 0 0', color: '#065f46' }}>Encuentra el paso incorrecto en el circuito</p>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          <img src="/img/Lumi_confundida.png" alt="Lumi confundida" style={{ width: '80px' }} />
          <div style={{ background: '#d1fae5', padding: '10px 15px', borderRadius: '10px', maxWidth: '300px' }}>
            ¡Oh no! Algo no funciona. Toca el paso equivocado.
          </div>
        </div>

        <div style={{ fontSize: '18px', marginBottom: '10px', color: '#065f46' }}>
          Ejercicio <span>{idx + 1}</span> de <span>{ejercicios.length}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', margin: '20px 0' }}>
          {ejercicio.codigo.map((flecha, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className={`bloque ${bloquesEstado[i]}`}
                onClick={() => evaluar(i)}
                title={ejercicio.labels[i]}
                style={{
                  width: '100px',
                  height: '40px',
                  background: bloquesEstado[i] === 'correct' ? '#bbf7d0' : bloquesEstado[i] === 'wrong' ? '#fecaca' : '#a7f3d0',
                  border: '2px solid #34d399',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                }}
              >
                {flecha}
              </div>
              {i < ejercicio.codigo.length - 1 && (
                <span style={{ fontSize: '24px', color: '#34d399', margin: '0 5px' }}>→</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ fontSize: '20px', margin: '15px' }}>{mensaje}</div>

        <div style={{ marginTop: '20px' }}>
          <button
            onClick={reiniciar}
            style={{
              background: '#34d399',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
