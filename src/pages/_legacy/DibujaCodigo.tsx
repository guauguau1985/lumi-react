import { useState, useRef } from 'react';

export default function DibujaCodigo() {
  const [comandos, setComandos] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addCmd = (cmd: string) => {
    setComandos((prev) => [...prev, cmd]);
  };

  const ejecutar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x = 150, y = 150;
    let angulo = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(x, y);

    comandos.forEach(cmd => {
      if (cmd === 'adelante') {
        x += 30 * Math.cos(angulo * Math.PI / 180);
        y += 30 * Math.sin(angulo * Math.PI / 180);
        ctx.lineTo(x, y);
      } else if (cmd === 'girar') {
        angulo += 90;
      }
    });

    ctx.strokeStyle = "#db2777";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const reset = () => {
    setComandos([]);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.clearRect(0, 0, 300, 300);
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fdf2f8',
      textAlign: 'center',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#9d174d' }}>🎨 Dibuja con Código</h1>
      <p>Haz que Lumi dibuje una figura usando comandos</p>

      <canvas ref={canvasRef} width={300} height={300} style={{
        backgroundColor: '#fff1f2',
        border: '2px solid #f472b6',
        margin: '20px auto',
        display: 'block'
      }}></canvas>

      <div style={{ margin: '20px' }}>
        <button onClick={() => addCmd('adelante')} style={btnStyle}>Adelante</button>
        <button onClick={() => addCmd('girar')} style={btnStyle}>Girar</button>
        <button onClick={ejecutar} style={{ ...btnStyle, backgroundColor: '#7c3aed' }}>Ejecutar</button>
        <button onClick={reset} style={{ ...btnStyle, backgroundColor: '#f87171' }}>Reiniciar</button>
      </div>

      <div style={{ marginTop: '10px', fontSize: '18px' }}>
        Comandos: {comandos.join(', ')}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px 15px',
  margin: '5px',
  fontSize: '16px',
  backgroundColor: '#ec4899',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};
