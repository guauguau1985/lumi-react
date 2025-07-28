import { useState, useEffect } from 'react';

export default function CaminoComandos() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [lumiPos, setLumiPos] = useState(0);

  const cells = Array(25).fill('');
  cells[0] = 'L';
  cells[24] = '🌳';

  const addCommand = (cmd: string) => {
    setSequence([...sequence, cmd]);
  };

  const runCommands = () => {
    let pos = lumiPos;
    sequence.forEach((cmd) => {
      if (cmd === '↑' && pos >= 5) pos -= 5;
      if (cmd === '↓' && pos < 20) pos += 5;
      if (cmd === '←' && pos % 5 !== 0) pos -= 1;
      if (cmd === '→' && pos % 5 !== 4) pos += 1;
    });
    setLumiPos(pos);
    setTimeout(() => {
      alert(pos === 24
        ? "🎉 ¡Bien hecho! Lumi llegó al parque 🌳"
        : "⛔ Aún no llegamos, intenta ajustar los comandos.");
    }, 100);
  };

  const reset = () => {
    setSequence([]);
    setLumiPos(0);
  };

  return (
    <div style={{ fontFamily: 'Arial', backgroundColor: '#f0fdf4', padding: '20px', textAlign: 'center', minHeight: '100vh' }}>
      <h1 style={{ color: '#065f46' }}>🧭 Camino de Comandos</h1>
      <p>Ayuda a Lumi a llegar al 🌳 usando comandos</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 60px)',
        gridTemplateRows: 'repeat(5, 60px)',
        gap: '5px',
        justifyContent: 'center',
        margin: '20px auto'
      }}>
        {cells.map((cell, i) => (
          <div key={i} style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#d1fae5',
            border: '2px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            position: 'relative'
          }}>
            {i === lumiPos ? (
              <img
                src="/img/lumi_feliz.png"
                alt="Lumi"
                style={{ width: '50px', position: 'absolute' }}
              />
            ) : cell}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        {['↑', '↓', '←', '→'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => addCommand(cmd)}
            style={{
              padding: '10px 15px',
              margin: '5px',
              fontSize: '16px',
              backgroundColor: '#34d399',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {cmd}
          </button>
        ))}
        <button
          onClick={runCommands}
          style={{
            padding: '10px 15px',
            margin: '5px',
            fontSize: '16px',
            backgroundColor: '#065f46',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Ejecutar
        </button>
        <button
          onClick={reset}
          style={{
            padding: '10px 15px',
            margin: '5px',
            fontSize: '16px',
            backgroundColor: '#f87171',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reiniciar
        </button>
      </div>

      <div style={{ marginTop: '10px', fontSize: '18px' }}>
        Secuencia: {sequence.join(' ')}
      </div>
    </div>
  );
}
