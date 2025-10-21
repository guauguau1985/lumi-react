import { useState } from "react";
import Feedback from "@/components/Feedback";
import { useFeedback } from "@/hooks/useFeedback";

const GOOD = ["Cáscaras de verduras", "Hojas secas", "Yerba usada", "Café molido"];
const BAD  = ["Pilas", "Vidrios", "Plástico", "Aceite usado"];
const ALL = [...GOOD.map((t) => ({ t, good: true })), ...BAD.map((t) => ({ t, good: false }))].sort(
  () => Math.random() - 0.5
);

export default function CompostLab() {
  const [idx, setIdx] = useState(0);
  const [ok, setOk] = useState(0);
  const [done, setDone] = useState(false);
  const { feedback, markCorrect, markWrong } = useFeedback();

  const card = ALL[idx];

  function answer(isGood: boolean) {
    if (card.good === isGood) {
      setOk((s) => s + 1);
      markCorrect();
    } else {
      markWrong();
    }
    const next = idx + 1;
    window.setTimeout(() => {
      if (next < ALL.length) setIdx(next);
      else setDone(true);
    }, 650);
  }

  return (
    <main className="min-h-svh p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-sky-50">
      <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-700">Laboratorio de Compost</h1>

      {!done ? (
        <section className="mt-4 bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-gray-800 text-lg font-semibold">{card.t}</p>
          <div className="mt-5 flex gap-3 justify-center">
            <button onClick={() => answer(true)} className="px-4 py-3 rounded-xl bg-emerald-100 hover:bg-emerald-200">
              ✅ Va al compost
            </button>
            <button onClick={() => answer(false)} className="px-4 py-3 rounded-xl bg-rose-100 hover:bg-rose-200">
              ❌ No va al compost
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">Elemento {idx + 1} de {ALL.length}</p>
        </section>
      ) : (
        <section className="mt-4 bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-gray-800 font-semibold">¡Terminaste! Correctas: {ok} / {ALL.length}</p>
          <img src="/src/assets/eco/badge_compost.svg" alt="Badge Compost" className="w-24 mx-auto mt-3" />
          <p className="text-emerald-700 font-bold mt-2">¡Insignia Compost!</p>
        </section>
      )}

      <Feedback state={feedback} />
    </main>
  );
}
    