import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";

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
  return (
    <motion.div
      className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Banner */}
      <motion.div variants={item} className="relative w-full h-48 md:h-56 overflow-hidden">
        <img
          src="/img/banner/banner.png"
          alt=""
          className="w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h2 className="text-white text-xl md:text-2xl font-semibold drop-shadow">¡Bienvenido a Lumi!</h2>
          <p className="text-white/80 text-sm">Elige tu módulo para comenzar</p>
        </div>
      </motion.div>

      <div className="w-full max-w-2xl mx-auto px-4 py-5 space-y-3">
        {/* Módulos */}
        <motion.div className="grid gap-3 md:grid-cols-2" variants={item}>
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

          {/* Ciencias Naturales */}
          <motion.div variants={item}>
            <Link
              to="/naturales"
              className="
                block rounded-2xl px-4 py-3 shadow transition-transform hover:scale-[1.02] hover:shadow-md
                bg-[var(--color-surface)] border-4 border-sky-300
              "
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-500" />
                <span className="font-semibold text-sky-700">
                  🔬 Ciencias Naturales
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
            <Link
              to="/ai"
              className="
                block rounded-2xl px-4 py-3 shadow transition-transform hover:scale-[1.02] hover:shadow-md
                bg-[var(--color-surface)] border-4 border-[var(--color-ai-border)]
              "
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-ai-dot)]" />
                <span className="font-semibold text-[var(--color-ai-text)]">
                  🤖 Lumi Tutora IA
                </span>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Reporte de padres */}
        <motion.div variants={item}>
          <Link
            to="/reporte-padres"
            className="
              flex items-center justify-between rounded-2xl px-4 py-3 shadow
              bg-[var(--color-surface)] border border-[var(--color-card-border)]
              text-[var(--color-muted-foreground)]
              transition-colors hover:border-[var(--color-ai-border)]
            "
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span className="text-sm font-medium">Reporte de aprendizaje</span>
            </div>
            <span className="text-xs opacity-60">Para padres →</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}