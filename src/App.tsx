import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Programacion from "./pages/Programacion";
import Tablas from "./pages/tablas";
import AtrapaError from "./pages/AtrapaError";
import CaminoComandos from "./pages/CaminoComandos";
import OrdenaCodigo from "./pages/OrdenaCodigo";
import DibujaCodigo from "./pages/DibujaCodigo";
import Matematicas from "./pages/Matematicas";
import CarreraLumi from "./pages/CarreraLumi";

// 👇 importamos el nuevo shell con gamificación y mapa de mundos
import { AppShell } from "./app/AppShell";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas que ya tienes */}
        <Route path="/" element={<Home />} />
        <Route path="/programacion" element={<Programacion />} />
        <Route path="/tablas" element={<Tablas />} />
        <Route path="/atrapa-error" element={<AtrapaError />} />
        <Route path="/camino-comandos" element={<CaminoComandos />} />
        <Route path="/ordena-codigo" element={<OrdenaCodigo />} />
        <Route path="/dibuja-codigo" element={<DibujaCodigo />} />
        <Route path="/matematicas" element={<Matematicas />} />
        <Route path="/carrera-lumi" element={<CarreraLumi />} />

        {/* Nueva ruta para el sistema gamificado con mapa de mundos */}
        <Route path="/lumi-mapas" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
