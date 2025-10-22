import { useCallback, useMemo, useState } from "react";

interface DivisionProblem {
  dividend: number;
  divisor: number;
}

function createProblem(): DivisionProblem {
  const divisor = Math.floor(Math.random() * 6) + 3; // 3..8
  const quotient = Math.floor(Math.random() * 9) + 2; // 2..10
  const remainder = Math.floor(Math.random() * divisor);
  const dividend = divisor * quotient + remainder;
  return { dividend, divisor };
}

function solveProblem({ dividend, divisor }: DivisionProblem) {
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  return { quotient, remainder };
}

const GameDivisionConResto = () => {
  const [problem, setProblem] = useState(createProblem);
  const [quotientInput, setQuotientInput] = useState("");
  const [remainderInput, setRemainderInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const correctAnswer = useMemo(() => solveProblem(problem), [problem]);

  const resetRound = useCallback(() => {
    setProblem(createProblem());
    setQuotientInput("");
    setRemainderInput("");
    setFeedback(null);
  }, []);

  const verify = useCallback(() => {
    if (quotientInput.trim() === "" || remainderInput.trim() === "") {
      setFeedback("Completa ambos campos antes de comprobar.");
      return;
    }

    const quotientValue = Number(quotientInput);
    const remainderValue = Number(remainderInput);
    if (Number.isNaN(quotientValue) || Number.isNaN(remainderValue)) {
      setFeedback("Solo se aceptan números.");
      return;
    }

    const isCorrect =
      quotientValue === correctAnswer.quotient && remainderValue === correctAnswer.remainder;

    setFeedback(
      isCorrect
        ? "¡Excelente! Multiplica y suma para comprobar: divisor × cociente + resto = dividendo."
        : `Revisa tus cálculos. Recuerda que ${problem.divisor} × ${correctAnswer.quotient} + ${correctAnswer.remainder} = ${problem.dividend}.`,
    );

    if (isCorrect) {
      setTimeout(() => {
        resetRound();
      }, 800);
    }
  }, [correctAnswer, problem, quotientInput, remainderInput, resetRound]);

  return (
    <div className="flex flex-col gap-5 text-slate-700">
      <header className="rounded-2xl bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold text-amber-700">Práctica con resto</h2>
        <p className="mt-2 text-sm text-slate-500">
          Resuelve la división y escribe el cociente junto al resto. Recuerda que el resto siempre es menor que el divisor.
        </p>
      </header>

      <section className="flex flex-col gap-6 rounded-2xl border border-amber-100 bg-amber-50/60 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-sm uppercase tracking-wide text-amber-600">Problema</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">
            {problem.dividend} ÷ {problem.divisor}
          </p>
        </div>
        <div className="flex flex-col gap-4 md:w-80">
          <label className="text-sm font-medium text-amber-700">
            Cociente
            <input
              type="number"
              inputMode="numeric"
              value={quotientInput}
              onChange={(event) => setQuotientInput(event.currentTarget.value)}
              className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-base shadow focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <label className="text-sm font-medium text-amber-700">
            Resto
            <input
              type="number"
              inputMode="numeric"
              value={remainderInput}
              onChange={(event) => setRemainderInput(event.currentTarget.value)}
              className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-base shadow focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={verify}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-600"
            >
              Comprobar
            </button>
            <button
              type="button"
              onClick={resetRound}
              className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
            >
              Nuevo ejercicio
            </button>
          </div>
        </div>
      </section>

      {feedback && (
        <p
          role="status"
          className="rounded-xl bg-white p-4 text-sm font-medium text-amber-800 shadow"
        >
          {feedback}
        </p>
      )}
    </div>
  );
};

export default GameDivisionConResto;