import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import lumiFeliz from "../assets/lumi_feliz.png";
import lumiConfundida from "../assets/lumi_confundido.png";
import lumiPensativa from "../assets/lumi_pensativa.png";
import lumiPreocupada from "../assets/lumi_preocupado.png";

type Mood = "feliz" | "confundida" | "pensativa" | "preocupada";

const srcByMood: Record<Mood, string> = {
  feliz: lumiFeliz,
  confundida: lumiConfundida,
  pensativa: lumiPensativa,
  preocupada: lumiPreocupada,
};

const moods: Mood[] = ["feliz", "pensativa", "confundida", "preocupada"];

export function LumiAvatar({
  size = 96,
  interval = 5000, // ms → cada 5 segundos cambia
}: {
  size?: number;
  interval?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % moods.length);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  const mood = moods[index];

  return (
    <motion.img
      key={mood} // para que se anime en cada cambio
      src={srcByMood[mood]}
      alt={`Lumi ${mood}`}
      width={size}
      height={size}
      className="select-none"
      draggable={false}
      initial={{ scale: 0, rotate: -15, opacity: 0 }}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, -10, 0],
        opacity: 1,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
      }}
    />
  );
}
