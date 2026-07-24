import Link from "next/link";
import {
  Fingerprint,
  KeyRound,
  FileJson,
  CalendarClock,
  Settings2,
  Lock,
  Copy,
  Clock,
} from "lucide-react";
import { getSkillsList, type SkillListItem } from "@/lib/skill-queries";
import { Card, CardContent } from "@/components/ui/Card";
import { SkillCard } from "@/components/SkillCard";

export const dynamic = "force-dynamic";

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
    href: "/tools/appsettings",
    title: "Generador de appsettings.json",
    description: "Texto clave=valor anidado con ':' a JSON de .NET.",
    icon: Settings2,
  },
  {
    href: "/tools/password",
    title: "Generador de contraseñas",
    description: "Contraseñas seguras: longitud, símbolos y mayúsculas.",
    icon: Lock,
  },
];

function SkillSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: SkillListItem[];
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        {icon}
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay skills.</p>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function Home() {
  const all = await getSkillsList({ sort: "recent" });
  const recent = all.slice(0, 3);
  const topCopied = [...all]
    .sort((a, b) => b.copyCount - a.copyCount)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          FreqDevTools
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Herramientas útiles para desarrolladores web.
        </p>
      </section>

      <section className="mb-12">
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

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Skills destacadas</h2>
          <Link
            href="/skills"
            className="text-sm text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <SkillSection
            title="Más recientes"
            icon={<Clock className="h-4 w-4" />}
            items={recent}
          />
          <SkillSection
            title="Más copiadas"
            icon={<Copy className="h-4 w-4" />}
            items={topCopied}
          />
        </div>
      </section>
    </div>
  );
}
