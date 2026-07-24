import { prisma } from "@/lib/prisma";
import type { SkillSort } from "@/lib/skills";

export interface SkillListItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  copyCount: number;
  createdAt: string;
  authorName: string;
}

function authorLabel(author: { name: string | null; email: string }): string {
  return author.name?.trim() || author.email;
}

export async function getSkillsList(opts: {
  category?: string;
  sort: SkillSort;
  q?: string;
}): Promise<SkillListItem[]> {
  const q = opts.q?.trim();
  const skills = await prisma.skill.findMany({
    where: {
      ...(opts.category ? { category: opts.category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    include: { author: { select: { name: true, email: true } } },
  });

  const items: SkillListItem[] = skills.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category,
    copyCount: s.copyCount,
    createdAt: s.createdAt.toISOString(),
    authorName: authorLabel(s.author),
  }));

  switch (opts.sort) {
    case "copies":
      items.sort((a, b) => b.copyCount - a.copyCount);
      break;
    case "recent":
    default:
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
  }
  return items;
}

export interface SkillDetail extends SkillListItem {
  content: string;
}

export async function getSkillDetail(id: string): Promise<SkillDetail | null> {
  const skill = await prisma.skill.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });
  if (!skill) return null;

  return {
    id: skill.id,
    title: skill.title,
    description: skill.description,
    category: skill.category,
    copyCount: skill.copyCount,
    createdAt: skill.createdAt.toISOString(),
    authorName: authorLabel(skill.author),
    content: skill.content,
  };
}
