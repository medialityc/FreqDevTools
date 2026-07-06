import { prisma } from "@/lib/prisma";
import type { EnvFileView } from "@/app/env/types";

/** Archivos .env del usuario con sus links (estado de vencimiento incluido). */
export async function getUserEnvFiles(userId: string): Promise<EnvFileView[]> {
  const rows = await prisma.envFile.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      shareLinks: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          token: true,
          type: true,
          expiresAt: true,
          revoked: true,
          allowedEmails: true,
          createdAt: true,
        },
      },
    },
  });

  const now = Date.now();
  return rows.map((f) => ({
    id: f.id,
    name: f.name,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
    links: f.shareLinks.map((l) => ({
      id: l.id,
      token: l.token,
      type: l.type,
      expiresAt: l.expiresAt ? l.expiresAt.toISOString() : null,
      revoked: l.revoked,
      expired:
        l.type === "EXPIRING" &&
        (!l.expiresAt || l.expiresAt.getTime() <= now),
      allowedEmails: JSON.parse(l.allowedEmails) as string[],
      createdAt: l.createdAt.toISOString(),
    })),
  }));
}
