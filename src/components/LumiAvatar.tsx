import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LumiFeliz, LumiContenta, LumiPensativa } from "@/icons";

type Mood = "feliz" | "contenta" | "pensativa";
const componentsByMood = { feliz: LumiFeliz, contenta: LumiContenta, pensativa: LumiPensativa };
const moods: Mood[] = ["feliz", "contenta", "pensativa"];

export function LumiAvatar({ size = 96, interval = 5000 }: { size?: number; interval?: number }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % moods.length), interval);
    return () => clearInterval(id);
  }, [interval]);

  const mood = moods[index];
  const Lumi = componentsByMood[mood];

  return (
    <motion.div
      key={mood}
      initial={{ scale: 0, rotate: -15, opacity: 0 }}
      animate={{ scale: [1, 1.1, 1], rotate: [0, -10, 0], opacity: 1 }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      style={{ width: size, height: size }}
      className="select-none"
    >
      <Lumi width="100%" height="100%" />
    </motion.div>
  );
}
