import Link from "next/link";
import {
  Fingerprint,
  KeyRound,
  FileJson,
  CalendarClock,
  ArrowBigUp,
  Copy,
  Clock,
  Users,
  Shield,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSkillsList, type SkillListItem } from "@/lib/skill-queries";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const all = await getSkillsList({ sort: "votes" });
  const topVoted = all.slice(0, 3);
  const topCopied = [...all].sort((a, b) => b.copyCount - a.copyCount).slice(0, 3);
  const recent = [...all]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const userCount = isAdmin ? await prisma.user.count() : 0;

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

      {isAdmin && (
        <section className="mb-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/15 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{userCount}</div>
                  <div className="text-sm text-muted-foreground">
                    usuarios registrados
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex h-full items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Panel de administración
                  </span>
                </div>
                <Link href="/admin">
                  <Button size="sm" variant="outline">
                    Gestionar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

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
        <div className="grid gap-8 md:grid-cols-3">
          <SkillSection
            title="Más votadas"
            icon={<ArrowBigUp className="h-4 w-4" />}
            items={topVoted}
          />
          <SkillSection
            title="Más copiadas"
            icon={<Copy className="h-4 w-4" />}
            items={topCopied}
          />
          <SkillSection
            title="Más recientes"
            icon={<Clock className="h-4 w-4" />}
            items={recent}
          />
        </div>
      </section>
    </div>
  );
}
