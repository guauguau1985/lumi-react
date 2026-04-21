import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LumiAvatar } from "@/components/LumiAvatar";
import { Link } from "react-router-dom";

// Animaciones
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 18 },
  },
};

export default function Home() {
  const [progress, setProgress] = useState(40);

  return (
    <motion.div
      className="
        min-h-screen p-6 rounded-2xl shadow transition-transform hover:scale-[1.02] hover:shadow-md
        bg-[var(--color-background)] text-[var(--color-foreground)]
        border-4 border-[var(--color-shell-border)]
      "
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="w-full max-w-xl mx-auto space-y-6" variants={item}>
        {/* Header */}
        <motion.div className="flex items-center gap-4" variants={item}>
          <LumiAvatar size={96} />
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
              ¡Bienvenido a Lumi!
            </h1>
            <p className="text-[var(--color-muted-foreground)]">
              Elige tu módulo para comenzar
            </p>
          </div>
        </motion.div>

        {/* Progreso */}
        <motion.div variants={item}>
          <Card>
            <CardHeader
              title="Progreso de hoy"
              subtitle="Sigue practicando 💪"
            />
            <CardContent>
              <ProgressBar value={progress} />

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setProgress((p) => Math.max(0, p - 10))}
                  className="
                    px-3 py-1 rounded-lg transition
                    bg-[var(--color-muted)]
                    text-[var(--color-foreground)]
                    border border-[var(--color-card-border)]
                  "
                >
                  −10%
                </button>

                <button
                  onClick={() => setProgress((p) => Math.min(100, p + 10))}
                  className="
                    px-3 py-1 rounded-lg transition
                    bg-[var(--color-primary)]
                    text-[var(--color-primary-foreground)]
                  "
                >
                  +10%
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Módulos */}
        <motion.div className="grid gap-3" variants={item}>
          {/* Matemáticas */}
          <motion.div variants={item}>
            <Link
              to="/math"
              className="
                block rounded-2xl px-4 py-4 shadow transition-transform hover:scale-[1.02] hover:shadow-md
                bg-[var(--color-surface)] border-4 border-[var(--color-math-border)]
              "
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-math-dot)]" />
                <span className="font-semibold text-[var(--color-math-text)]">
                  🧮 Matemáticas
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Ecología */}
          <motion.div variants={item}>
            <Link
              to="/eco"
              className="
                block rounded-2xl px-4 py-3 shadow transition-transform hover:scale-[1.02] hover:shadow-md
                bg-[var(--color-surface)] border-4 border-[var(--color-eco-border)]
              "
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-eco-dot)]" />
                <span className="font-semibold text-[var(--color-eco-text)]">
                  🌿 Ecología
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Programación */}
          <motion.div variants={item}>
            <Link
              to="/coder"
              className="
                block rounded-2xl px-4 py-3 shadow transition-transform hover:scale-[1.02] hover:shadow-md
                bg-[var(--color-surface)] border-4 border-[var(--color-coder-border)]
              "
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-coder-dot)]" />
                <span className="font-semibold text-[var(--color-coder-text)]">
                  💻 Programación
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Inglés */}
          <motion.div variants={item}>
            <Link
              to="/english"
              className="
                block rounded-2xl px-4 py-3 shadow transition-transform hover:scale-[1.02] hover:shadow-md
                bg-[var(--color-surface)] border-4 border-[var(--color-english-border)]
              "
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-english-dot)]" />
                <span className="font-semibold text-[var(--color-english-text)]">
                  🇬🇧 Inglés
                </span>
              </div>
            </Link>
          </motion.div>

          {/* IA */}
          <motion.div variants={item}>
            <button
              onClick={() => alert("Pronto 😉")}
              className="
                w-full rounded-2xl px-4 py-3 text-left shadow transition-transform hover:scale-[1.02] hover:shadow-md
                bg-[var(--color-surface)] border-4 border-[var(--color-ai-border)]
              "
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-ai-dot)]" />
                <span className="font-semibold text-[var(--color-ai-text)]">
                  🤖 Inteligencia Artificial
                </span>
              </div>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}