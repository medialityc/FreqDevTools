import Link from "next/link";
import { Fingerprint, KeyRound, FileJson, BookOpen, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

const tools = [
  {
    href: "/tools/guid",
    title: "Generador de GUID",
    description: "GUIDs v1/v4/v7 con formato y salida JSON.",
    icon: Fingerprint,
  },
  {
    href: "/tools/api-keys",
    title: "API Keys / HMAC",
    description: "Claves con longitud, prefijo y separador.",
    icon: KeyRound,
  },
  {
    href: "/tools/csharp-serializer",
    title: "Serializar clase C#",
    description: "Convierte una clase C# en JSON de ejemplo.",
    icon: FileJson,
  },
  {
    href: "/tools/datetime",
    title: "Conversor de fecha",
    description: "Fecha/hora a DateTime C#, ISO, Unix y ticks.",
    icon: CalendarClock,
  },
  {
    href: "/skills",
    title: "Skills",
    description: "Publica y descarga skills de la comunidad.",
    icon: BookOpen,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          FreqDevTools
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Herramientas útiles para desarrolladores web, más gestión segura de
          credenciales y variables de entorno.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Herramientas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.href} href={t.href}>
                <Card className="h-full transition-colors hover:border-primary">
                  <CardContent>
                    <Icon className="mb-3 h-6 w-6 text-primary" />
                    <h3 className="font-semibold">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
