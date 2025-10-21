import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function EcoHome() {
  const cards = [
    { to: "/eco/sorter", title: "Clasificador de Reciclaje", subtitle: "Arrastra cada objeto al contenedor correcto." },
    { to: "/eco/huella", title: "Quiz Huella Verde",        subtitle: "Elige la mejor opción para cuidar el planeta." },
    { to: "/eco/compost", title: "Laboratorio de Compost",  subtitle: "Aprende qué va y qué no va al compost." },
  ];

  return (
    <main className="min-h-svh p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-sky-50">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-700">Módulo Eco ♻️</h1>
      <p className="text-gray-600 mt-1">Reciclaje, ecología y sustentabilidad.</p>

      <div className="grid gap-4 sm:grid-cols-3 mt-6">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="focus:outline-none">
            <Card className="h-full">
              <CardHeader title={c.title} />
              <CardContent>
                <p className="text-sm text-gray-600">{c.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
