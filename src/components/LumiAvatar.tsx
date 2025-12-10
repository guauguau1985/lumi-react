// src/components/LumiAvatar.tsx
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

// Prefijo correcto para assets públicos
const ASSET_BASE = `${import.meta.env.BASE_URL}img/`;

const LumiFeliz = `${ASSET_BASE}Lumi_feliz.png`;
const LumiConfundida = `${ASSET_BASE}Lumi_confundida.png`;
const LumiPensativa = `${ASSET_BASE}Lumi_pensativa.png`;

type Mood = "feliz" | "confundida" | "pensativa";

const srcByMood: Record<Mood, string> = {
  feliz: LumiFeliz,
  confundida: LumiConfundida,
  pensativa: LumiPensativa,
};

const moods: Mood[] = ["feliz", "confundida", "pensativa"];

interface Props {
  size?: number;
  interval?: number; // ms
}

export function LumiAvatar({
  size = 110, // un poco más grande porque ahora no tiene marco
  interval = 5000,
}: Props) {
  const [mood, setMood] = useState<Mood>("feliz");

  useEffect(() => {
    const id = setInterval(() => {
      setMood((prev) => {
        const index = moods.indexOf(prev);
        return moods[(index + 1) % moods.length];
      });
    }, interval);

    return () => clearInterval(id);
  }, [interval]);

  return (
    <div
      className="flex items-center justify-center overflow-visible"
      style={{
        width: size,
        height: size,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={mood} // Fuerza transición al cambiar de expresión
          src={srcByMood[mood]}
          alt={`Lumi ${mood}`}
          width={size}
          height={size}
          className="object-contain pointer-events-none select-none"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </AnimatePresence>
    </div>
  );
}
