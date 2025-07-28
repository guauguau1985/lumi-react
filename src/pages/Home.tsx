import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={styles.contenedor}>
      <h1 style={styles.titulo}>🌱 Bienvenido a Lumi App</h1>

      <Link to="/matematicas" style={styles.boton}>
        📐 Matemáticas
      </Link>
      <Link to="/programacion" style={styles.boton}>
        💻 Programación
      </Link>
      <Link to="/ia" style={styles.boton}>
        🤖 Inteligencia Artificial
      </Link>
    </div>
  );
};

export default Home;

const styles = {
  contenedor: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ecfdf5',
    textAlign: 'center' as const,
    padding: '40px',
    minHeight: '100vh',
  },
  titulo: {
    color: '#065f46',
    fontSize: '36px',
    marginBottom: '40px',
  },
  boton: {
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
    cursor: 'pointer',
    textDecoration: 'none',
  },
};
