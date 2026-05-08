import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const ASSET_BASE = `${import.meta.env.BASE_URL}img/lumi/`;

const srcByMood = {
  feliz:     `${ASSET_BASE}feliz.png`,
  confundida:`${ASSET_BASE}confundida.png`,
  pensativa: `${ASSET_BASE}pensativa.png`,
} as const;

type Mood = keyof typeof srcByMood;
const moods: Mood[] = ["feliz", "confundida", "pensativa"];

interface Props {
  size?: number;
  interval?: number;
}

export function LumiAvatar({ size = 110, interval = 5000 }: Props) {
  const [mood, setMood] = useState<Mood>("feliz");

  useEffect(() => {
    const id = setInterval(() => {
      setMood((prev) => moods[(moods.indexOf(prev) + 1) % moods.length]);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <div
      className="relative rounded-full overflow-hidden bg-white shadow-sm flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={mood}
          src={srcByMood[mood]}
          alt={`Lumi ${mood}`}
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </AnimatePresence>
    </div>
  );
}
