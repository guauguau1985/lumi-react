import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import lumiFeliz from "../assets/lumi_feliz.png";
import lumiConfundido from "../assets/lumi_confundido.png";
import lumiConfeti from "../assets/lumi_confeti.png";
import lumiPensativo from "../assets/lumi_pensativo.png";

type Mood = "feliz" | "confundido" | "confeti" | "pensativo";

const srcByMood: Record<Mood, string> = {
  feliz: lumiFeliz,
  confundido: lumiConfundido,
  confeti: lumiConfeti,
  pensativo: lumiPensativo,
};

const moods: Mood[] = ["feliz", "confundido", "confeti", "pensativo"];

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
