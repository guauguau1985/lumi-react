import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Programacion from './pages/Programacion';
import Tablas from './pages/tablas';
import AtrapaError from './pages/AtrapaError';
import CaminoComandos from './pages/CaminoComandos';
import OrdenaCodigo from './pages/OrdenaCodigo';
import DibujaCodigo from './pages/DibujaCodigo';
import Matematicas from './pages/Matematicas';
import CarreraLumi from './pages/CarreraLumi';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/programacion" element={<Programacion />} />
        <Route path="/tablas" element={<Tablas />} />
        <Route path="/atrapa-error" element={<AtrapaError />} />
        <Route path="/camino-comandos" element={<CaminoComandos />} />
        <Route path="/ordena-codigo" element={<OrdenaCodigo />} />
        <Route path="/dibuja-codigo" element={<DibujaCodigo />} />
        <Route path="/matematicas" element={<Matematicas />} />
        <Route path="/carrera-lumi" element={<CarreraLumi />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
