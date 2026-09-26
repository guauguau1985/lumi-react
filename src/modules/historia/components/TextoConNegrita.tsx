// Muestra un texto donde **palabra** va en negrita. Evita guardar JSX en los datos.
export default function TextoConNegrita({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {partes.map((parte, i) =>
        parte.startsWith('**') && parte.endsWith('**') ? (
          <b key={i} className="font-extrabold text-slate-900">
            {parte.slice(2, -2)}
          </b>
        ) : (
          <span key={i}>{parte}</span>
        ),
      )}
    </>
  )
}
