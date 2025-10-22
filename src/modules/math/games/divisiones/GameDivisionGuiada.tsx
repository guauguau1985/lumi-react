import { useMemo, useState } from "react";

interface Step {
  title: string;
  explanation: string;
  highlight: string;
}

const problem = {
  dividend: 96,
  divisor: 4,
  steps: [
    {
      title: "Paso 1: observa los números",
      explanation: "¿Cuántas veces cabe el 4 en 9? Cabe 2 veces porque 2 × 4 = 8 y no podemos pasar el 9.",
      highlight: "Tomamos las dos primeras cifras: 9 ÷ 4 ≈ 2",
    },
    {
      title: "Paso 2: multiplica y resta",
      explanation: "Multiplicamos 2 × 4 = 8 y lo restamos del 9. Queda un resto parcial de 1.",
      highlight: "9 − 8 = 1",
    },
    {
      title: "Paso 3: baja la siguiente cifra",
      explanation: "Bajamos el 6 para formar 16. Ahora preguntamos cuántas veces cabe el 4 en 16.",
      highlight: "El nuevo número es 16",
    },
    {
      title: "Paso 4: repite",
      explanation: "El 4 cabe 4 veces en 16 porque 4 × 4 = 16. Restamos y obtenemos 0, por lo que no quedan más cifras por bajar.",
      highlight: "16 ÷ 4 = 4, resto 0",
    },
  ] satisfies Step[],
};

function buildLongDivisionLayout(step: number) {
  const showFirstDigit = step >= 0;
  const showFirstMultiplication = step >= 1;
  const showSecondDigit = step >= 2;
  const showSecondMultiplication = step >= 3;

  return (
    <div className="relative inline-block rounded-xl border border-amber-300 bg-white px-6 py-4 shadow-sm">
      <div className="text-sm text-amber-600">{problem.divisor} ⟌ {problem.dividend}</div>
      <div className="mt-2 grid grid-cols-[auto_auto] items-center gap-x-6 gap-y-1 font-mono text-lg">
        <span className="text-slate-500">{showFirstDigit ? 9 : ""}</span>
        <span className="row-span-2 text-emerald-700">{showFirstDigit ? 2 : ""}</span>
        <span className="text-slate-500">{showSecondDigit ? 16 : ""}</span>
        <span className="text-emerald-700">{showSecondDigit ? 4 : ""}</span>
        <span className="text-slate-400">{showFirstMultiplication ? 8 : ""}</span>
        <span className="text-slate-400">{showSecondMultiplication ? 16 : ""}</span>
      </div>
    </div>
  );
}

const GameDivisionGuiada = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const maxIndex = problem.steps.length - 1;

  const currentStep = problem.steps[stepIndex];
  const layout = useMemo(() => buildLongDivisionLayout(stepIndex), [stepIndex]);

  return (
    <div className="flex flex-col gap-6 text-slate-700">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-amber-700">División guiada</h2>
            <p className="text-sm text-slate-500">Sigue cada paso y observa cómo se construye el cociente.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
            Paso {stepIndex + 1} de {problem.steps.length}
          </div>
        </header>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {layout}
          <div className="max-w-md rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <h3 className="text-base font-semibold text-amber-700">{currentStep.title}</h3>
            <p className="mt-2 text-sm leading-relaxed">{currentStep.explanation}</p>
            <p className="mt-3 rounded-lg bg-white/70 p-3 text-sm font-medium text-amber-800">{currentStep.highlight}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
            className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
            disabled={stepIndex === 0}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setStepIndex((value) => Math.min(maxIndex, value + 1))}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-600"
            disabled={stepIndex === maxIndex}
          >
            Siguiente
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Consejo: después de terminar una división, multiplica el cociente ({problem.dividend / problem.divisor}) por el divisor
        ({problem.divisor}) y comprueba que recuperas el dividendo ({problem.dividend}). Si obtienes otro número, revisa el paso en el que te equivocaste.
      </p>
    </div>
  );
};

export default GameDivisionGuiada;