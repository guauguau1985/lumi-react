import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LumiAvatar } from "@/components/LumiAvatar";
import { useState } from "react";
import { motion } from "framer-motion";

// Variants del contenedor: fade-in general + stagger de hijos
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// Variants de cada ítem: slide-up + spring suave
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 18 } },
};

// Efectos de interacción para botones
const buttonWhile = { whileHover: { scale: 1.04, y: -1 }, whileTap: { scale: 0.96, y: 0 } };

export default function Home() {
  const [progress, setProgress] = useState(40);

  // helper para navegar con hash (coincide con tu AppShell)
  const go = (seg: string) => {
    window.location.hash = seg ? `#/${seg}` : "#/";
  };

  return (
    <motion.div className="min-h-dvh grid place-items-center p-6" variants={container} initial="hidden" animate="show">
      <motion.div className="w-full max-w-xl space-y-6" variants={item}>
        <motion.div className="flex items-center gap-4" variants={item}>
          <LumiAvatar size={96} />
          <div>
            <h1 className="text-2xl font-bold">¡Bienvenido a Lumi App!</h1>
            <p className="text-gray-600">Elige tu módulo para comenzar</p>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader title="Progreso de hoy" subtitle="Sigue practicando 💪" />
            <CardContent>
              <ProgressBar value={progress} />
              <div className="mt-3 flex gap-2">
                <Button onClick={() => setProgress((p) => Math.max(0, p - 10))} variant="secondary" size="sm">
                  −10%
                </Button>
                <Button onClick={() => setProgress((p) => Math.min(100, p + 10))} size="sm">
                  +10%
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="grid gap-3" variants={item}>
          <motion.div variants={item}>
            <motion.div {...buttonWhile}>
              <Button onClick={() => go("WorldsMap")} size="lg">
                🧮 Matemáticas
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={item}>
            <motion.div {...buttonWhile}>
              <Button onClick={() => alert("Pronto 😄")} variant="secondary" size="lg">
                💻 Programación
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={item}>
            <motion.div {...buttonWhile}>
              <Button onClick={() => alert("Pronto 🤖")} variant="ghost" size="lg">
                🤖 Inteligencia Artificial
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
