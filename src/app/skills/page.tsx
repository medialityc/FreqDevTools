import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getSkillsList } from "@/lib/skill-queries";
import type { SkillSort } from "@/lib/skills";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/PageHeader";
import { SkillCard } from "@/components/SkillCard";
import { SkillFilters } from "./SkillFilters";

export const metadata: Metadata = {
  title: "Skills — FreqDevTools",
};

export const dynamic = "force-dynamic";

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const sort: SkillSort =
    sp.sort === "copies" || sp.sort === "recent" ? sp.sort : "votes";
  const skills = await getSkillsList({ category: sp.category, sort, q: sp.q });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Skills"
          description="Publica y descarga skills .md de la comunidad."
        />
        <Link href="/skills/new">
          <Button>
            <Plus className="h-4 w-4" />
            Publicar skill
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <SkillFilters />
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            No hay skills todavía. ¡Sé el primero en publicar una!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      )}
    </div>
  );
}
