import type { FC } from "react";

interface ConceptCard {
  title: string;
  description: string;
  examples: string[];
}

const conceptCards: ConceptCard[] = [
  {
    title: "¿Qué es dividir?",
    description:
      "La división reparte un total en grupos iguales. También nos ayuda a saber cuántas veces cabe un número en otro.",
    examples: [
      "12 ÷ 3 = 4 porque 12 caramelos repartidos entre 3 niños dan 4 para cada uno.",
      "20 ÷ 5 = 4 porque el 5 cabe cuatro veces en el 20.",
    ],
  },
  {
    title: "Partes de la división",
    description:
      "Una división tiene dividendo, divisor, cociente y, a veces, un resto. Conocer sus nombres facilita seguir los pasos.",
    examples: [
      "En 84 ÷ 4 = 21: 84 es el dividendo, 4 es el divisor, 21 el cociente y el resto es 0.",
      "Si 17 ÷ 3 = 5 y sobran 2, entonces el resto es 2 porque 3×5 + 2 = 17.",
    ],
  },
  {
    title: "Comprueba tu respuesta",
    description:
      "Multiplica el cociente por el divisor y suma el resto. Si obtienes el dividendo, la división está correcta.",
    examples: [
      "21×4 = 84, coincide con el dividendo.",
      "5×3 + 2 = 17, coincide con el dividendo.",
    ],
  },
];

const GameDivisionIntro: FC = () => {
  return (
    <div className="space-y-6 text-slate-700">
      <header className="rounded-2xl bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-50 p-6 shadow-md">
        <h2 className="text-2xl font-extrabold text-amber-800">División paso a paso</h2>
        <p className="mt-2 max-w-3xl text-sm md:text-base">
          Explora las ideas clave antes de practicar. Lee cada tarjeta y trata de explicar el concepto con tus propias palabras.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {conceptCards.map((card) => (
          <article
            key={card.title}
            className="flex h-full flex-col rounded-2xl border border-amber-200 bg-white/90 p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-amber-700">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed">{card.description}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {card.examples.map((example) => (
                <li key={example} className="rounded-lg bg-amber-50/70 p-2 text-amber-900">
                  {example}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold text-amber-700">Truco mental</h3>
        <p className="mt-2 text-sm leading-relaxed">
          La división es la operación inversa de la multiplicación. Si te cuesta, piensa en la tabla del divisor y busca el
          número más cercano al dividendo sin pasarte. Ese será el cociente parcial.
        </p>
      </section>
    </div>
  );
};

export default GameDivisionIntro;