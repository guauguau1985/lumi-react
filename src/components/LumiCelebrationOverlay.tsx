import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useGamification } from "../gamification/GamificationContext";

const LumiCelebrationOverlay: React.FC = () => {
  const { celebration, clearCelebration } = useGamification();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // si no hay celebración, no dibujamos nada
  if (celebration === "none") return null;

  const numberOfPieces = celebration === "big" ? 400 : 120;
  const recycle = false; // explosión corta, no infinita

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={numberOfPieces}
        recycle={recycle}
        gravity={0.4}
        onConfettiComplete={clearCelebration}
      />
    </div>
  );
};

export default LumiCelebrationOverlay;
