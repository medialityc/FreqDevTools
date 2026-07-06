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
  score: number;
}

/** Mapa skillId -> suma de votos. */
async function getVoteScores(
  skillIds?: string[],
): Promise<Map<string, number>> {
  const groups = await prisma.skillVote.groupBy({
    by: ["skillId"],
    _sum: { value: true },
    where: skillIds ? { skillId: { in: skillIds } } : undefined,
  });
  const map = new Map<string, number>();
  for (const g of groups) map.set(g.skillId, g._sum.value ?? 0);
  return map;
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
  const scores = await getVoteScores();

  const items: SkillListItem[] = skills.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category,
    copyCount: s.copyCount,
    createdAt: s.createdAt.toISOString(),
    authorName: authorLabel(s.author),
    score: scores.get(s.id) ?? 0,
  }));

  switch (opts.sort) {
    case "copies":
      items.sort((a, b) => b.copyCount - a.copyCount);
      break;
    case "recent":
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "votes":
    default:
      items.sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt));
      break;
  }
  return items;
}

export interface SkillDetail extends SkillListItem {
  content: string;
  userVote: number; // -1, 0, 1
}

export async function getSkillDetail(
  id: string,
  userId?: string,
): Promise<SkillDetail | null> {
  const skill = await prisma.skill.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });
  if (!skill) return null;

  const scores = await getVoteScores([id]);
  let userVote = 0;
  if (userId) {
    const vote = await prisma.skillVote.findUnique({
      where: { skillId_userId: { skillId: id, userId } },
    });
    userVote = vote?.value ?? 0;
  }

  return {
    id: skill.id,
    title: skill.title,
    description: skill.description,
    category: skill.category,
    copyCount: skill.copyCount,
    createdAt: skill.createdAt.toISOString(),
    authorName: authorLabel(skill.author),
    score: scores.get(id) ?? 0,
    content: skill.content,
    userVote,
  };
}
