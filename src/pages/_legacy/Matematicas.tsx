import { Link } from "react-router-dom";

export default function Matematicas() {
  const boton = {
    display: 'block',
    backgroundColor: '#34d399',
    color: 'white',
    padding: '20px 30px',
    fontSize: '20px',
    margin: '20px auto',
    border: 'none',
    borderRadius: '10px',
    width: '80%',
    maxWidth: '300px',
    textAlign: 'center',
    textDecoration: 'none',
  };

  const contenedor = {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0fdf4',
    textAlign: 'center' as const,
    padding: '40px',
    minHeight: '100vh'
  };

  return (
    <div style={contenedor}>
      <h1 style={{ color: '#065f46', marginBottom: '40px' }}>📐 Módulo de Matemáticas</h1>

      <Link to="/tablas" style={boton}>🧮 Juego de Tablas</Link>
      <Link to="/carrera-lumi" style={boton}>🎲 Carrera de Lumi</Link>
    </div>
  );
}
