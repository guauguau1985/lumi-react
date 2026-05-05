import { useState, useEffect } from 'react';

const correcto = ['mover adelante', 'mover adelante', 'girar derecha', 'mover adelante'];

export default function OrdenaCodigo() {
  const [bloques, setBloques] = useState<string[]>([]);

  useEffect(() => {
    reiniciar();
  }, []);

  const reiniciar = () => {
    setBloques([...correcto].sort(() => Math.random() - 0.5));
  };

  const intercambiar = (desde: number, hacia: number) => {
    const copia = [...bloques];
    const temp = copia[desde];
    copia[desde] = copia[hacia];
    copia[hacia] = temp;
    setBloques(copia);
  };

  const verificar = () => {
    const esCorrecto = JSON.stringify(bloques) === JSON.stringify(correcto);
    alert(esCorrecto
      ? '✅ ¡Perfecto! El código está en orden.'
      : '❌ Algo no está en orden. Intenta de nuevo.');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#eef2ff', textAlign: 'center', padding: '20px', minHeight: '100vh' }}>
      <h1 style={{ color: '#3730a3' }}>🧩 Ordena el Código</h1>
      <p>Arrastra las instrucciones para que Lumi llegue al árbol 🌳</p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: '20px',
      }}>
        {bloques.map((text, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const desde = parseInt(e.dataTransfer.getData('text/plain'));
              intercambiar(desde, index);
            }}
            style={{
              padding: '12px 18px',
              margin: '8px',
              backgroundColor: '#c7d2fe',
              border: '2px solid #818cf8',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'grab',
            }}
          >
            {text}
          </div>
        ))}
      </div>

      <button
        onClick={verificar}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          fontSize: '16px',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Verificar
      </button>
    </div>
  );
}
