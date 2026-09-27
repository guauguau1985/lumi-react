// Contenido de Lenguaje: reglas de acentuación y uso de C, S y Z.
// Fuente: guía de estudio de Lenguaje del colegio (septiembre 2026).
// En los textos, **palabra** se muestra en negrita.

export type TemaLenguaje =
  | "Agudas, graves y esdrújulas"
  | "¿Dónde va la tilde?"
  | "¿Por qué lleva tilde?"
  | "Acento dierético"
  | "Acento diacrítico"
  | "Uso de C, S y Z";

export interface InfoTema {
  tema: TemaLenguaje;
  emoji: string;
  descripcion: string;
  colores: string;
}

export const TEMAS_LENGUAJE: InfoTema[] = [
  {
    tema: "Agudas, graves y esdrújulas",
    emoji: "🔊",
    descripcion: "Descubre dónde está la fuerza de voz.",
    colores: "border-sky-200 bg-sky-50 text-sky-800",
  },
  {
    tema: "¿Dónde va la tilde?",
    emoji: "✍️",
    descripcion: "Elige la palabra bien escrita.",
    colores: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    tema: "¿Por qué lleva tilde?",
    emoji: "🤔",
    descripcion: "Explica la regla detrás de cada tilde.",
    colores: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    tema: "Acento dierético",
    emoji: "✂️",
    descripcion: "Separa vocales: Ma-rí-a, pa-ís, rí-o.",
    colores: "border-violet-200 bg-violet-50 text-violet-800",
  },
  {
    tema: "Acento diacrítico",
    emoji: "🔍",
    descripcion: "tú o tu, él o el, sí o si…",
    colores: "border-rose-200 bg-rose-50 text-rose-800",
  },
  {
    tema: "Uso de C, S y Z",
    emoji: "🔤",
    descripcion: "Completa palabras y forma plurales.",
    colores: "border-orange-200 bg-orange-50 text-orange-800",
  },
];

export interface FichaLenguaje {
  id: string;
  emoji: string;
  titulo: string;
  puntos: string[];
  clave?: string;
}

export const FICHAS_LENGUAJE: FichaLenguaje[] = [
  {
    id: "agudas",
    emoji: "1️⃣",
    titulo: "Palabras agudas",
    puntos: [
      "Tienen la fuerza de voz en la **última** sílaba.",
      "Llevan tilde cuando terminan en **vocal, N o S**.",
      "Ejemplos: can-**CIÓN**, ca-**FÉ**, com-**PÁS**.",
    ],
    clave: "papel es aguda, pero termina en L: no lleva tilde.",
  },
  {
    id: "graves",
    emoji: "2️⃣",
    titulo: "Palabras graves",
    puntos: [
      "Tienen la fuerza de voz en la **penúltima** sílaba.",
      "Llevan tilde cuando **NO** terminan en vocal, N o S.",
      "Ejemplos: **ÁR**-bol, **LÁ**-piz, di-**FÍ**-cil.",
    ],
    clave: "Es al revés que las agudas.",
  },
  {
    id: "esdrujulas",
    emoji: "3️⃣",
    titulo: "Palabras esdrújulas",
    puntos: [
      "Tienen la fuerza de voz en la **antepenúltima** sílaba.",
      "**Siempre** llevan tilde.",
      "Ejemplos: **MÚ**-si-ca, te-**LÉ**-fo-no, **MÉ**-di-co.",
    ],
  },
  {
    id: "dieretico",
    emoji: "✂️",
    titulo: "Acento dierético",
    puntos: [
      "**Diptongo**: dos vocales diferentes que se pronuncian en la misma sílaba.",
      "El acento dierético **separa** dos vocales que normalmente formarían un diptongo.",
      "Pasa cuando la vocal débil (**i, u**) lleva tilde.",
      "Ejemplos: Ma-**rí**-a, pa-**ís**, **rí**-o, **dí**-a, ma-**íz**.",
    ],
    clave: "Si la i o la u necesita separarse de la otra vocal, puede llevar tilde.",
  },
  {
    id: "diacritico",
    emoji: "🔍",
    titulo: "Acento diacrítico",
    puntos: [
      "Sirve para diferenciar palabras que se escriben igual pero significan algo distinto.",
      "**tú** = persona · **tu** = posesivo",
      "**él** = persona · **el** = artículo",
      "**mí** = persona · **mi** = posesivo",
      "**sí** = afirmación · **si** = condición",
      "**té** = bebida · **te** = pronombre",
      "**dé** = verbo dar · **de** = preposición",
      "**sé** = saber/ser · **se** = pronombre",
      "**más** = cantidad · **mas** = pero",
    ],
  },
  {
    id: "csz",
    emoji: "🔤",
    titulo: "Uso de C, S y Z",
    puntos: [
      "**-ción**: canción, educación, celebración.",
      "**-oso / -osa**: hermoso, peligrosa.",
      "**-ez / -eza**: belleza, naturaleza, rapidez.",
      "**-encia**: paciencia, diferencia, experiencia.",
      "Plural de palabras con Z: lápiz → lápi**c**es, pez → pe**c**es, voz → vo**c**es.",
    ],
    clave: "Algunas palabras siguen reglas; otras se aprenden de memoria.",
  },
];

export interface PreguntaLenguaje {
  tema: TemaLenguaje;
  pregunta: string;
  emoji: string;
  // La primera opción es la correcta; el quiz las baraja.
  opciones: string[];
  explicacion: string;
}

const AGE = ["Aguda", "Grave", "Esdrújula"];
function clasificar(palabra: string, emoji: string, tipo: 0 | 1 | 2, explicacion: string): PreguntaLenguaje {
  return {
    tema: "Agudas, graves y esdrújulas",
    pregunta: `¿«${palabra}» es aguda, grave o esdrújula?`,
    emoji,
    opciones: [AGE[tipo], ...AGE.filter((_, i) => i !== tipo)],
    explicacion,
  };
}

function bienEscrita(emoji: string, opciones: string[], explicacion: string): PreguntaLenguaje {
  return { tema: "¿Dónde va la tilde?", pregunta: "Elige la palabra bien escrita:", emoji, opciones, explicacion };
}

function separar(palabra: string, emoji: string, opciones: string[], explicacion: string): PreguntaLenguaje {
  return {
    tema: "Acento dierético",
    pregunta: `¿Cómo se separa y escribe «${palabra}»?`,
    emoji,
    opciones,
    explicacion,
  };
}

function completar(frase: string, emoji: string, opciones: string[], explicacion: string): PreguntaLenguaje {
  return { tema: "Acento diacrítico", pregunta: frase, emoji, opciones, explicacion };
}

function letra(palabra: string, emoji: string, correcta: "C" | "S" | "Z", explicacion: string): PreguntaLenguaje {
  return {
    tema: "Uso de C, S y Z",
    pregunta: `Completa: ${palabra}`,
    emoji,
    opciones: [correcta, ...["C", "S", "Z"].filter((l) => l !== correcta)],
    explicacion,
  };
}

export const PREGUNTAS_LENGUAJE: PreguntaLenguaje[] = [
  // I. Agudas, graves y esdrújulas
  clasificar("canción", "🎤", 0, "can-CIÓN: la fuerza está en la última sílaba, por eso es aguda."),
  clasificar("árbol", "🌳", 1, "ÁR-bol: la fuerza está en la penúltima sílaba, por eso es grave."),
  clasificar("teléfono", "📞", 2, "te-LÉ-fo-no: la fuerza está en la antepenúltima sílaba, por eso es esdrújula."),
  clasificar("papel", "📄", 0, "pa-PEL: la fuerza está en la última sílaba, es aguda. No lleva tilde porque termina en L."),
  clasificar("lápiz", "✏️", 1, "LÁ-piz: la fuerza está en la penúltima sílaba, por eso es grave."),
  clasificar("rábano", "🥕", 2, "RÁ-ba-no: la fuerza está en la antepenúltima sílaba, por eso es esdrújula."),
  clasificar("camello", "🐫", 1, "ca-ME-llo: la fuerza está en la penúltima sílaba, es grave. No lleva tilde porque termina en vocal."),
  clasificar("tradición", "🎉", 0, "tra-di-CIÓN: la fuerza está en la última sílaba, por eso es aguda."),
  clasificar("palmera", "🌴", 1, "pal-ME-ra: la fuerza está en la penúltima sílaba, es grave. No lleva tilde porque termina en vocal."),
  clasificar("ofreció", "🎁", 0, "o-fre-CIÓ: la fuerza está en la última sílaba, por eso es aguda."),
  clasificar("cómelo", "🍽️", 2, "CÓ-me-lo: la fuerza está en la antepenúltima sílaba, por eso es esdrújula."),
  clasificar("amiga", "👭", 1, "a-MI-ga: la fuerza está en la penúltima sílaba, es grave. No lleva tilde porque termina en vocal."),
  clasificar("polinización", "🐝", 0, "po-li-ni-za-CIÓN: la fuerza está en la última sílaba, por eso es aguda."),
  {
    tema: "Agudas, graves y esdrújulas",
    pregunta: "¿Cuándo llevan tilde las palabras AGUDAS?",
    emoji: "📏",
    opciones: ["Cuando terminan en vocal, N o S", "Cuando NO terminan en vocal, N o S", "Siempre"],
    explicacion: "Las agudas llevan tilde cuando terminan en vocal, N o S: café, canción, compás.",
  },
  {
    tema: "Agudas, graves y esdrújulas",
    pregunta: "¿Cuándo llevan tilde las palabras GRAVES?",
    emoji: "📏",
    opciones: ["Cuando NO terminan en vocal, N o S", "Cuando terminan en vocal, N o S", "Nunca"],
    explicacion: "Las graves llevan tilde cuando NO terminan en vocal, N o S: árbol, lápiz, difícil.",
  },
  {
    tema: "Agudas, graves y esdrújulas",
    pregunta: "¿Qué palabras llevan tilde SIEMPRE?",
    emoji: "⭐",
    opciones: ["Las esdrújulas", "Las agudas", "Las graves"],
    explicacion: "Las esdrújulas siempre llevan tilde: música, teléfono, médico.",
  },

  // II. Coloca tilde donde corresponda
  bienEscrita("🦎", ["camaleón", "camaleon", "cámaleon"], "ca-ma-le-ÓN es aguda y termina en N, lleva tilde."),
  bienEscrita("🌳", ["árbol", "arbol", "arból"], "ÁR-bol es grave y termina en L, lleva tilde."),
  bienEscrita("🎵", ["música", "musica", "musíca"], "MÚ-si-ca es esdrújula, siempre lleva tilde."),
  bienEscrita("😓", ["difícil", "dificil", "díficil"], "di-FÍ-cil es grave y termina en L, lleva tilde."),
  bienEscrita("🧭", ["compás", "cómpas", "compas"], "com-PÁS es aguda y termina en S, lleva tilde."),
  bienEscrita("🤝", ["cómplice", "complice", "complíce"], "CÓM-pli-ce es esdrújula, siempre lleva tilde."),
  bienEscrita("☕", ["café", "cafe", "cáfe"], "ca-FÉ es aguda y termina en vocal, lleva tilde."),
  bienEscrita("💪", ["ánimo", "animo", "anímo"], "Á-ni-mo es esdrújula, siempre lleva tilde."),
  bienEscrita("➕", ["además", "ademas", "adémas"], "a-de-MÁS es aguda y termina en S, lleva tilde."),
  bienEscrita("🏃", ["rápido", "rapido", "rapído"], "RÁ-pi-do es esdrújula, siempre lleva tilde."),
  bienEscrita("🐛", ["ciempiés", "ciempies", "ciémpies"], "ciem-PIÉS es aguda y termina en S, lleva tilde."),
  bienEscrita("🌱", ["césped", "cesped", "cespéd"], "CÉS-ped es grave y termina en D, lleva tilde."),
  bienEscrita("🌲", ["álamo", "alamo", "alámo"], "Á-la-mo es esdrújula, siempre lleva tilde."),
  bienEscrita("🛋️", ["sillón", "síllon", "sillon"], "si-LLÓN es aguda y termina en N, lleva tilde."),
  bienEscrita("🌋", ["cráter", "crater", "cratér"], "CRÁ-ter es grave y termina en R, lleva tilde."),
  bienEscrita("🍌", ["plátano", "platano", "platáno"], "PLÁ-ta-no es esdrújula, siempre lleva tilde."),
  bienEscrita("🍬", ["azúcar", "azucar", "azucár"], "a-ZÚ-car es grave y termina en R, lleva tilde."),
  bienEscrita("📒", ["álbum", "album", "albúm"], "ÁL-bum es grave y termina en M, lleva tilde."),
  bienEscrita("🐹", ["hámster", "hamster", "hamstér"], "HÁMS-ter es grave y termina en R, lleva tilde."),

  // III. Explica por qué lleva tilde
  {
    tema: "¿Por qué lleva tilde?",
    pregunta: "¿Por qué «médico» lleva tilde?",
    emoji: "🩺",
    opciones: [
      "Porque es esdrújula y las esdrújulas siempre llevan tilde",
      "Porque es aguda y termina en vocal",
      "Porque es grave y termina en vocal",
    ],
    explicacion: "MÉ-di-co es esdrújula, y las esdrújulas siempre llevan tilde.",
  },
  {
    tema: "¿Por qué lleva tilde?",
    pregunta: "¿Por qué «canción» lleva tilde?",
    emoji: "🎤",
    opciones: ["Porque es aguda y termina en N", "Porque es grave y termina en N", "Porque es esdrújula"],
    explicacion: "can-CIÓN es aguda y termina en N, por eso lleva tilde.",
  },
  {
    tema: "¿Por qué lleva tilde?",
    pregunta: "¿Por qué «lápiz» lleva tilde?",
    emoji: "✏️",
    opciones: [
      "Porque es grave y no termina en vocal, N o S",
      "Porque es aguda y termina en Z",
      "Porque es esdrújula",
    ],
    explicacion: "LÁ-piz es grave y termina en Z (no en vocal, N o S), por eso lleva tilde.",
  },
  {
    tema: "¿Por qué lleva tilde?",
    pregunta: "¿Por qué «café» lleva tilde?",
    emoji: "☕",
    opciones: [
      "Porque es aguda y termina en vocal",
      "Porque es grave y termina en vocal",
      "Porque todas las palabras cortas llevan tilde",
    ],
    explicacion: "ca-FÉ es aguda y termina en vocal, por eso lleva tilde.",
  },
  {
    tema: "¿Por qué lleva tilde?",
    pregunta: "¿Por qué «árbol» lleva tilde?",
    emoji: "🌳",
    opciones: [
      "Porque es grave y no termina en vocal, N o S",
      "Porque es aguda y termina en L",
      "Porque es esdrújula",
    ],
    explicacion: "ÁR-bol es grave y termina en L (no en vocal, N o S), por eso lleva tilde.",
  },
  {
    tema: "¿Por qué lleva tilde?",
    pregunta: "¿Por qué «papel» NO lleva tilde?",
    emoji: "📄",
    opciones: ["Porque es aguda y termina en L", "Porque es grave y termina en L", "Porque es esdrújula"],
    explicacion: "pa-PEL es aguda, pero termina en L. Las agudas solo llevan tilde si terminan en vocal, N o S.",
  },
  {
    tema: "¿Por qué lleva tilde?",
    pregunta: "¿Por qué «camello» NO lleva tilde?",
    emoji: "🐫",
    opciones: ["Porque es grave y termina en vocal", "Porque es aguda y termina en vocal", "Porque es esdrújula"],
    explicacion: "ca-ME-llo es grave y termina en vocal. Las graves que terminan en vocal, N o S no llevan tilde.",
  },

  // IV y V. Acento dierético
  {
    tema: "Acento dierético",
    pregunta: "¿Para qué sirve el acento dierético?",
    emoji: "✂️",
    opciones: [
      "Para separar dos vocales que formarían un diptongo",
      "Para diferenciar palabras que se escriben igual",
      "Para marcar las palabras esdrújulas",
    ],
    explicacion: "Sirve para separar dos vocales que normalmente se pronunciarían juntas (diptongo).",
  },
  {
    tema: "Acento dierético",
    pregunta: "¿Qué es un diptongo?",
    emoji: "🔗",
    opciones: ["Dos vocales diferentes en la misma sílaba", "Dos consonantes juntas", "Una palabra con dos tildes"],
    explicacion: "Un diptongo es la unión de dos vocales diferentes que se pronuncian en la misma sílaba.",
  },
  separar("Maria", "👧", ["Ma-rí-a", "Ma-ria", "Má-ri-a"], "Ma-rí-a: la í lleva tilde para separarse de la a."),
  separar("pais", "🗺️", ["pa-ís", "pais", "pá-is"], "pa-ís: la í lleva tilde para separarse de la a."),
  separar("rio", "🏞️", ["rí-o", "ri-ó", "rio"], "rí-o: la í lleva tilde para separarse de la o."),
  separar("dia", "☀️", ["dí-a", "di-á", "dia"], "dí-a: la í lleva tilde para separarse de la a."),
  separar("frio", "🥶", ["frí-o", "frio", "fri-ó"], "frí-o: la í lleva tilde para separarse de la o."),
  separar("raiz", "🌱", ["ra-íz", "rá-iz", "raiz"], "ra-íz: la í lleva tilde para separarse de la a."),
  separar("leido", "📖", ["le-í-do", "lei-do", "lé-i-do"], "le-í-do: la í lleva tilde para separarse de la e."),
  separar("sonreir", "😊", ["son-re-ír", "son-reir", "són-re-ir"], "son-re-ír: la í lleva tilde para separarse de la e."),
  separar("fantasia", "🦄", ["fan-ta-sí-a", "fan-tá-si-a", "fan-ta-sia"], "fan-ta-sí-a: la í lleva tilde para separarse de la a."),
  separar("aulla", "🐺", ["a-ú-lla", "au-lla", "á-u-lla"], "a-ú-lla: la ú lleva tilde para separarse de la a."),
  separar("duo", "👯", ["dú-o", "duo", "du-ó"], "dú-o: la ú lleva tilde para separarse de la o."),
  separar("baul", "🧳", ["ba-úl", "bá-ul", "baul"], "ba-úl: la ú lleva tilde para separarse de la a."),
  {
    tema: "Acento dierético",
    pregunta: "¿Cuál de estas palabras tiene acento dierético?",
    emoji: "🌽",
    opciones: ["maíz", "canción", "árbol"],
    explicacion: "En maíz, la í se separa de la a: ma-íz.",
  },
  {
    tema: "Acento dierético",
    pregunta: "¿Cuál de estas palabras tiene acento dierético?",
    emoji: "🗺️",
    opciones: ["país", "camión", "árbol"],
    explicacion: "En país, la í se separa de la a: pa-ís. Camión lleva tilde por ser aguda terminada en N.",
  },
  {
    tema: "Acento dierético",
    pregunta: "¿Cuál de estas palabras NO tiene acento dierético?",
    emoji: "🚚",
    opciones: ["camión", "día", "río"],
    explicacion: "Camión lleva tilde porque es aguda y termina en N, no para separar vocales. Día y río sí tienen acento dierético.",
  },

  // VI. Acento diacrítico
  {
    tema: "Acento diacrítico",
    pregunta: "¿Para qué sirve el acento diacrítico?",
    emoji: "🔍",
    opciones: [
      "Para diferenciar palabras que se escriben igual",
      "Para separar dos vocales",
      "Para marcar las palabras agudas",
    ],
    explicacion: "Diferencia palabras que se escriben igual pero significan algo distinto, como tú y tu.",
  },
  completar("___ tienes un hermoso cuaderno.", "📓", ["Tú", "Tu"], "Tú = persona. Hablamos de la persona que tiene el cuaderno."),
  completar("¿Dónde está ___ mochila?", "🎒", ["tu", "tú"], "tu = posesivo. La mochila es tuya."),
  completar("___ fue al colegio temprano.", "🏫", ["Él", "El"], "Él = persona. Se refiere a un niño que fue al colegio."),
  completar("___ perro está jugando.", "🐶", ["El", "Él"], "El = artículo. Va antes del sustantivo «perro»."),
  completar("Este regalo es para ___.", "🎁", ["mí", "mi"], "mí = persona. El regalo es para mí (yo)."),
  completar("___ mamá preparó el almuerzo.", "🍲", ["Mi", "Mí"], "Mi = posesivo. Es mi mamá."),
  completar("___ quieres, podemos estudiar juntas.", "📚", ["Si", "Sí"], "Si = condición. «Si quieres…» pone una condición."),
  completar("Ella respondió que ___.", "👍", ["sí", "si"], "sí = afirmación. Ella dijo que sí."),
  completar("¿Quieres tomar ___?", "🍵", ["té", "te"], "té = bebida."),
  completar("Yo ___ ayudaré con la tarea.", "🤝", ["te", "té"], "te = pronombre. Yo te ayudaré (a ti)."),
  completar("Quiero ___ helado, por favor.", "🍦", ["más", "mas"], "más = cantidad. Quieres una cantidad mayor de helado."),
  completar("Yo no ___ la respuesta.", "🤔", ["sé", "se"], "sé = verbo saber. Yo no sé."),
  completar("Mi hermano ___ lava las manos.", "🧼", ["se", "sé"], "se = pronombre."),
  completar("Vengo ___ la escuela.", "🚶", ["de", "dé"], "de = preposición."),
  completar("Pídele que te ___ un lápiz.", "✏️", ["dé", "de"], "dé = verbo dar. Que te dé (entregue) un lápiz."),

  // VII. Uso de C, S y Z
  letra("cabe__a", "🙂", "Z", "Se escribe cabeza, con Z."),
  letra("belle__a", "🌸", "Z", "Belleza termina en -eza, que se escribe con Z."),
  letra("can__ión", "🎤", "C", "Canción termina en -ción, con C."),
  letra("cru__ero", "🚢", "C", "Se escribe crucero, con C."),
  letra("pe__", "🐟", "Z", "Se escribe pez, con Z. En plural cambia a C: peces."),
  letra("naturale__a", "🌿", "Z", "Naturaleza termina en -eza, con Z."),
  letra("lápi__", "✏️", "Z", "Se escribe lápiz, con Z. En plural: lápices."),
  letra("pa__iencia", "⏳", "C", "Paciencia termina en -encia, con C."),
  letra("dul__e", "🍭", "C", "Se escribe dulce, con C."),
  letra("televi__ión", "📺", "S", "Se escribe televisión, con S, igual que visión."),
  letra("jue__", "⚖️", "Z", "Se escribe juez, con Z. En plural: jueces."),
  letra("prince__a", "👸", "S", "Se escribe princesa, con S."),
  {
    tema: "Uso de C, S y Z",
    pregunta: "¿Cuál es el plural de «pez»?",
    emoji: "🐠",
    opciones: ["peces", "pezes", "peses"],
    explicacion: "Las palabras que terminan en Z cambian a C en plural: pez → peces.",
  },
  {
    tema: "Uso de C, S y Z",
    pregunta: "¿Cuál es el plural de «lápiz»?",
    emoji: "✏️",
    opciones: ["lápices", "lápizes", "lápises"],
    explicacion: "lápiz → lápices: la Z cambia a C.",
  },
  {
    tema: "Uso de C, S y Z",
    pregunta: "¿Cuál es el plural de «voz»?",
    emoji: "🗣️",
    opciones: ["voces", "vozes", "voses"],
    explicacion: "voz → voces: la Z cambia a C.",
  },
  {
    tema: "Uso de C, S y Z",
    pregunta: "¿Cuál está bien escrita?",
    emoji: "🌈",
    opciones: ["hermoso", "hermozo", "hermoco"],
    explicacion: "Hermoso termina en -oso, que se escribe con S.",
  },
  {
    tema: "Uso de C, S y Z",
    pregunta: "¿Cuál está bien escrita?",
    emoji: "🏎️",
    opciones: ["rapidez", "rapides", "rapidec"],
    explicacion: "Rapidez termina en -ez, que se escribe con Z.",
  },
  {
    tema: "Uso de C, S y Z",
    pregunta: "¿Cuál está bien escrita?",
    emoji: "🧪",
    opciones: ["experiencia", "experiensia", "experienzia"],
    explicacion: "Experiencia termina en -encia, que se escribe con C.",
  },
];
