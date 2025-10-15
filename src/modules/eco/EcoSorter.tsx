import { useMemo, useState } from "react";
import { BINS, SORTER_ITEMS, type EcoItem, type Bin } from "@/data/ecoData";
import ProgressBar from "@/components/ui/ProgressBar";
import Feedback from "@/components/Feedback";
import { useFeedback } from "@/hooks/useFeedback";

function Draggable({ item, onDragStart }: { item: EcoItem; onDragStart: (id: string) => void }) {
  return (
    <button
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
        onDragStart(item.id);
      }}
      onTouchStart={() => onDragStart(item.id)}
      className="bg-white rounded-2xl shadow p-3 w-full flex items-center gap-3"
    >
      <img src={item.img} alt={item.name} className="w-10 h-10" />
      <span className="font-medium text-gray-800">{item.name}</span>
    </button>
  );
}

export default function EcoSorter() {
  const pool = useMemo(() => [...SORTER_ITEMS], []);
  const [remaining, setRemaining] = useState(pool);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const total = pool.length;
  const { feedback, markCorrect, markWrong } = useFeedback();
  const [done, setDone] = useState(false);

  function handleDrop(bin: Bin) {
    if (!draggingId) return;
    const item = remaining.find((i) => i.id === draggingId);
    if (!item) return;

    if (item.bin === bin) {
      setRemaining((r) => r.filter((i) => i.id !== item.id));
      setScore((s) => s + 1);
      markCorrect();
      if (remaining.length - 1 === 0) setDone(true);
    } else {
      markWrong();
    }
    setDraggingId(null);
  }

  return (
    <main className="min-h-svh p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-sky-50">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-700">Clasificador de Reciclaje</h1>
        <div className="w-40"><ProgressBar value={score} total={total} /></div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 mt-4">
        <div className="grid gap-3 content-start">
          {remaining.map((it) => (
            <Draggable key={it.id} item={it} onDragStart={setDraggingId} />
          ))}
          {remaining.length === 0 && <p className="text-gray-600">¡No quedan objetos por clasificar!</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BINS.map((b) => (
            <div
              key={b.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(b.key)}
              onTouchEnd={() => handleDrop(b.key)}
              className="rounded-2xl bg-white shadow p-3 text-center border border-transparent hover:border-emerald-300"
            >
              <img src={b.img} alt={b.label} className="w-20 mx-auto" />
              <p className="mt-1 font-semibold text-gray-700">{b.label}</p>
            </div>
          ))}
        </div>
      </section>

      {done && (
        <div className="mt-6 p-4 bg-white rounded-2xl shadow border text-center">
          <p className="font-bold text-emerald-700">¡Excelente! Clasificaste todo 🎉</p>
          <img src="/src/assets/eco/badge_reciclaje.svg" alt="Insignia Reciclaje" className="w-24 mx-auto mt-2" />
        </div>
      )}

      <Feedback state={feedback} />
    </main>
  );
}
