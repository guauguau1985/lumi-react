
import type { FeedbackState } from "../hooks/useFeedback";
import lumiFeliz       from "../assets/lumi_feliz.png";
import lumiConfundido  from "../assets/lumi_confundido.png";



export default function Feedback({
  state,
  successText = "¡Muy bien!",
  errorText = "Ups, inténtalo de nuevo",
}: {
  state: FeedbackState;
  successText?: string;
  errorText?: string;
}) {
  if (!state) return null;

  const isOk = state === "correct";
  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <p
        className={`font-bold text-xl ${
          isOk ? "text-green-600" : "text-red-600"
        }`}
      >
        {isOk ? `${successText} 🎉` : `${errorText} ❌`}
      </p>

      <img
        src={isOk ? lumiFeliz : lumiConfundido}
        alt={isOk ? "Lumi feliz" : "Lumi confundido"}
        className="w-28"
      />
    </div>
  );
}
