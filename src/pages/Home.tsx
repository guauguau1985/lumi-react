import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LumiAvatar } from "@/components/LumiAvatar";
import { Link } from "react-router-dom";

// Animaciones
const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 18 } },
};

export default function Home() {
  const [progress, setProgress] = useState(40);

  return (
    <motion.div
      className="rounded-2xl bg-[#E8F3EC] min-h-screen border-4 border-indigo-300 shadow hover:shadow-md transition-transform hover:scale-[1.02] p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="w-full max-w-xl mx-auto space-y-6" variants={item}>
        {/* Header */}
        <motion.div className="flex items-center gap-4" variants={item}>
          <LumiAvatar size={96} />
          <div>
            <h1 className="text-2xl font-bold">¡Bienvenido a Lumi!</h1>
            <p className="text-gray-600">Elige tu módulo para comenzar</p>
          </div>
        </motion.div>

        {/* Progreso */}
        <motion.div variants={item}>
          <Card>
            <CardHeader title="Progreso de hoy" subtitle="Sigue practicando 💪" />
            <CardContent>
              <ProgressBar value={progress} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setProgress((p) => Math.max(0, p - 10))}
                  className="px-3 py-1 rounded-lg bg-gray-100"
                >
                  −10%
                </button>
                <button
                  onClick={() => setProgress((p) => Math.min(100, p + 10))}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white"
                >
                  +10%
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Módulos (tarjetas con borde grueso) */}
        <motion.div className="grid gap-3" variants={item}>
          {/* Matemáticas */}
          <motion.div variants={item}>
            <Link
              to="/math"
              className="block rounded-2xl bg-white border-4 border-indigo-300 shadow hover:shadow-md transition-transform hover:scale-[1.02] px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                <span className="font-semibold text-indigo-700">🧮 Matemáticas</span>
              </div>
            </Link>
          </motion.div>

          {/* Ecología */}
          <motion.div variants={item}>
            <Link
              to="/eco"
              className="block rounded-2xl bg-white border-4 border-emerald-300 shadow hover:shadow-md transition-transform hover:scale-[1.02] px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-700">🌿 Ecología</span>
              </div>
            </Link>
          </motion.div>

          {/* Programación (puede quedar “Pronto”) */}
          <motion.div variants={item}>
            <button
              onClick={() => alert("Pronto 😉")}
              className="w-full rounded-2xl bg-white border-4 border-amber-300 shadow hover:shadow-md transition-transform hover:scale-[1.02] px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-semibold text-amber-700">💻 Programación</span>
              </div>
            </button>
          </motion.div>

          {/* IA (Pronto) */}
          <motion.div variants={item}>
            <button
              onClick={() => alert("Pronto 😉")}
              className="w-full rounded-2xl bg-white border-4 border-fuchsia-300 shadow hover:shadow-md transition-transform hover:scale-[1.02] px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-500" />
                <span className="font-semibold text-fuchsia-700">🤖 Inteligencia Artificial</span>
              </div>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
