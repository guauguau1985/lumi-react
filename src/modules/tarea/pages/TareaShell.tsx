import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'lumy';
  text: string;
  time: string;
  cards?: { icon: string; title: string; text: string; color: string }[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1', role: 'lumy', time: '16:28',
    text: '¡Hola! Soy Lumy 🌱 Estoy aquí para ayudarte paso a paso.\n\nTu trabajo debe incluir:\n1. Portada\n2. Introducción\n3. Mapa de rutas de exploración\n4. Avances tecnológicos\n5. Conclusiones\n\n¿Empezamos?',
  },
  { id: '2', role: 'user', time: '16:29', text: 'Explícame primero el tema, por favor' },
  {
    id: '3', role: 'lumy', time: '16:30',
    text: '¡Claro! 🌍 Los viajes de exploración fueron expediciones marítimas entre los siglos XV y XVI para descubrir nuevas tierras y rutas comerciales.\n\nOcurrieron por estas causas:',
    cards: [
      { icon: '💰', title: 'Económicas', text: 'Buscaban nuevas rutas comerciales para traer especias y productos.', color: 'bg-amber-50 border-amber-200' },
      { icon: '⚙️', title: 'Tecnológicas', text: 'La brújula y el astrolabio permitieron viajes más seguros.', color: 'bg-blue-50 border-blue-200' },
      { icon: '✝️', title: 'Religiosas', text: 'Querían expandir el cristianismo a nuevos territorios.', color: 'bg-purple-50 border-purple-200' },
    ],
  },
];

export default function TareaShell() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      time: now,
    };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setTimeout(() => {
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        role: 'lumy',
        text: '¡Buena pregunta! 🌱 Déjame explicarte eso paso a paso...',
        time: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex-shrink-0 shadow-sm flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-xl">🌱</div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Lumy — Ayúdame con mi tarea</h1>
          <p className="text-xs text-green-500 font-medium">● En línea</p>
        </div>
      </header>

      {/* Área de chat */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'lumy' && (
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-base mr-2 flex-shrink-0 self-end">🌱</div>
            )}
            <div className={`max-w-[80%] sm:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
              {/* Cards informativas */}
              {msg.cards && (
                <div className="flex flex-col gap-2 mt-1 w-full">
                  {msg.cards.map(card => (
                    <div key={card.title} className={`flex items-start gap-3 rounded-xl border px-3 py-2 ${card.color}`}>
                      <span className="text-xl flex-shrink-0">{card.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-700">{card.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{card.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <span className="text-[10px] text-gray-400 px-1">{msg.time}</span>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-base ml-2 flex-shrink-0 self-end">👤</div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      {/* Input inferior */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-violet-400 focus-within:border-transparent transition">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-violet-700 transition flex-shrink-0"
            aria-label="Enviar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.903 6.23H13.5a.75.75 0 010 1.5H4.182l-1.903 6.23a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
