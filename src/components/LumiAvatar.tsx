import { motion } from "framer-motion";

type Mood = "feliz" | "confundida" | "pensativa";

const srcByMood: Record<Mood, string> = {
  feliz: "/img/Lumi_feliz.png",
  confundida: "/img/Lumi_confundido.png",
  pensativa: "/img/Lumi_pensativa.png",
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