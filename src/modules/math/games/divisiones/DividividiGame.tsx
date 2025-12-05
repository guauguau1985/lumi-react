import React, { useMemo, useState } from "react";

type Phase = "adding" | "answer" | "finished";

interface DiviDiviDiGameProps {
  dividend?: number;
  divisor?: number;
}

/**
 * Minijuego "Divi divi di"
 * Por defecto usa 54 ÷ 6, pero puedes pasar otros números vía props.
 */
const DividividiGame: React.FC<DiviDiviDiGameProps> = ({
  dividend = 54,
  divisor = 6,
}) => {
  const maxBags = dividend / divisor;

  const [bags, setBags] = useState(0);
  const [phase, setPhase] = useState<Phase>("adding");
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const options: number[] = useMemo(() => {
    const correct = maxBags;
    const set = new Set<number>();
    set.add(correct);
    if (correct - 1 > 0) set.add(correct - 1);
    set.add(correct + 1);
    set.add(correct + 2);
    return Array.from(set).sort(() => Math.random() - 0.5);
  }, [maxBags]);

  const currentTotal = bags * divisor;

  const handleAddBag = () => {
    if (phase !== "adding") return;
    setError(null);

    const nextBags = bags + 1;
    const nextTotal = nextBags * divisor;

    if (nextTotal > dividend) {
      setError(`Ups, me pasé del ${dividend}. Probemos de nuevo.`);
      return;
    }

    setBags(nextBags);

    if (nextTotal === dividend) {
      setPhase("answer");
    }
  };

  const handleReset = () => {
    setBags(0);
    setPhase("adding");
    setError(null);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  const handleAnswerClick = (option: number) => {
    if (phase !== "answer") return;

    setSelectedOption(option);
    const correct = option === maxBags;
    setIsCorrect(correct);

    if (correct) {
      setPhase("finished");
    }
  };

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-xl rounded-3xl bg-emerald-50/80 p-4 shadow-md md:p-6">

        {/* encabezado */}
        <div className="mb-4 flex items-start gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-emerald-200/70 flex items-center justify-center">
            {/* Cambia la ruta según tu proyecto */}
            <img
              src="/assets/lumi_feliz.png"
              alt="Lumi"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 md:text-xl">
              Divi divi di
            </h2>
            <p className="text-sm text-slate-600">
              Vamos a dividir jugando. Haremos bolsitas iguales.
            </p>
          </div>
        </div>

        {/* expresión principal */}
        <div className="mb-4 rounded-2xl bg-white/80 px-4 py-3 text-center">
          <p className="text-xl font-semibold text-slate-900 md:text-2xl">
            {dividend} ÷ {divisor} = ?
          </p>
          <p className="mt-1 text-xs text-slate-600 md:text-sm">
            Cada bolsita tendrá <span className="font-semibold">{divisor}</span>.
          </p>
        </div>

        {/* bolsitas */}
        <div className="mb-3">
          <div className="mb-1 flex justify-between gap-1">
            {Array.from({ length: maxBags }, (_, i) => {
              const index = i + 1;
              const value = index * divisor;
              const isFilled = index <= bags;
              const isTarget = isFilled && value === dividend;

              return (
                <div
                  key={index}
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm md:h-11 md:w-11",
                    isFilled
                      ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-300",
                    isTarget &&
                      "border-amber-400 ring-2 ring-amber-300/60 font-semibold",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isFilled ? value : "·"}
                </div>
              );
            })}
          </div>

          {/* índice de bolsitas */}
          <div className="flex justify-between gap-1 text-[10px] text-slate-400 md:text-xs">
            {Array.from({ length: maxBags }, (_, i) => {
              const index = i + 1;
              const isActive = index <= bags;
              return (
                <span
                  key={index}
                  className={
                    "flex-1 text-center " +
                    (isActive ? "font-semibold text-emerald-600" : "")
                  }
                >
                  {index}
                </span>
              );
            })}
          </div>

          <p className="mt-2 text-center text-xs text-slate-700 md:text-sm">
            {phase === "adding" && bags === 0 && "Pulsa el botón para hacer bolsitas de 6."}
            {phase === "adding" && bags > 0 &&
              `Voy sumando de ${divisor} en ${divisor}. Ahora tengo ${currentTotal}.`}
            {phase !== "adding" &&
              currentTotal === dividend &&
              `Aquí me detengo: llegué al número grande (${dividend}).`}
          </p>
        </div>

        {/* botones principales */}
        <div className="mb-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={handleAddBag}
            disabled={phase !== "adding"}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + 1 bolsita
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Reiniciar
          </button>
        </div>

        {error && (
          <p className="mb-2 text-center text-xs text-red-600 md:text-sm">
            {error}
          </p>
        )}

        {/* pregunta múltiple */}
        {phase !== "adding" && (
          <div className="mt-3 rounded-2xl bg-white/90 px-3 py-3">
            <p className="text-center text-sm font-medium text-slate-800 md:text-base">
              ¿Cuántas bolsitas hice para llegar a {dividend}?
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {options.map((option) => {
                const isSelected = selectedOption === option;
                const isCorrectOption =
                  phase === "finished" && option === maxBags;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAnswerClick(option)}
                    disabled={phase === "finished"}
                    className={[
                      "min-w-[3rem] rounded-full border px-3 py-1 text-sm font-semibold transition",
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
                      isCorrectOption && "border-emerald-500 bg-emerald-50",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {isCorrect === false && (
              <p className="mt-2 text-center text-xs text-red-600 md:text-sm">
                Casi… prueba con otro número.
              </p>
            )}
          </div>
        )}

        {/* resultado final */}
        {phase === "finished" && (
          <div className="mt-3 rounded-2xl bg-emerald-100/80 px-3 py-3 text-center">
            <p className="text-sm font-semibold text-emerald-700 md:text-base">
              🎉 ¡Muy bien! Hiciste {maxBags} bolsitas.
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-900 md:text-xl">
              {dividend} ÷ {divisor} = {maxBags}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DividividiGame;
