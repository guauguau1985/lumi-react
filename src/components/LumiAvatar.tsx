import { motion } from "framer-motion";
import lumiFeliz from "../assets/lumi_feliz.png";
import lumiConfundida from "../assets/lumi_confundido.png";
import lumiPensativa from "../assets/lumi_pensativa.png";

type Mood = "feliz" | "confundida" | "pensativa";

const srcByMood: Record<Mood, string> = {
  feliz: lumiFeliz,
  confundida: lumiConfundida,
  pensativa: lumiPensativa,
};

export function LumiAvatar({
  mood = "feliz",
  size = 96,
}: {
  mood?: Mood;
  size?: number;
}) {
  return (
    <motion.img
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
