import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MathGame from "./pages/MathGame";
import Home from "./pages/Home";

function AppShell() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/math" element={<MathGame />} />
      </Routes>
    </Router>
  );
}

export default AppShell;