import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy } from "lucide-react";
import { getSkillDetail } from "@/lib/skill-queries";
import { Card, CardContent } from "@/components/ui/Card";
import { Markdown } from "@/components/Markdown";
import { SkillActions } from "./SkillActions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const skill = await getSkillDetail(id);
  return { title: skill ? `${skill.title} — Skills` : "Skill no encontrada" };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skill = await getSkillDetail(id);
  if (!skill) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/skills"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a skills
      </Link>

      <div className="mb-4">
        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {skill.category}
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {skill.title}
        </h1>
        {skill.description && (
          <p className="mt-1 text-muted-foreground">{skill.description}</p>
        )}
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <span>por {skill.authorName}</span>
          <span className="flex items-center gap-1">
            <Copy className="h-3.5 w-3.5" />
            {skill.copyCount} copias
          </span>
        </div>
      </div>

      <div className="mb-4">
        <SkillActions
          skillId={skill.id}
          title={skill.title}
          content={skill.content}
        />
      </div>

      <Card>
        <CardContent>
          <Markdown>{skill.content}</Markdown>
        </CardContent>
      </Card>
    </div>
  );
}
