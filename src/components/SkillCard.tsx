import Link from "next/link";
import { Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { SkillListItem } from "@/lib/skill-queries";

export function SkillCard({ skill }: { skill: SkillListItem }) {
  return (
    <Link href={`/skills/${skill.id}`}>
      <Card className="h-full transition-colors hover:border-primary">
        <CardContent className="flex h-full flex-col">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {skill.category}
            </span>
          </div>
          <h3 className="font-semibold leading-snug">{skill.title}</h3>
          {skill.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {skill.description}
            </p>
          )}
          <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Copy className="h-3.5 w-3.5" />
              {skill.copyCount}
            </span>
            <span className="ml-auto truncate">{skill.authorName}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
