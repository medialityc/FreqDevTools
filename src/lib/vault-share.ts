import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

export type ShareResolution =
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "login" }
  | { status: "forbidden" }
  | { status: "ok"; name: string; content: string };

/**
 * Resuelve un link compartido (kind-agnóstico) aplicando, en orden:
 * 1) token existe y no revocado; 2) si EXPIRING, no vencido;
 * 3) hay sesión; 4) correo autorizado o dueño del archivo.
 */
export async function resolveShareLink(
  token: string,
  session: { userId?: string; email?: string | null } | null,
): Promise<ShareResolution> {
  const link = await prisma.envShareLink.findUnique({
    where: { token },
    include: {
      envFile: {
        select: { name: true, contentEncrypted: true, userId: true },
      },
    },
  });

  if (!link || link.revoked) return { status: "invalid" };

  if (
    link.type === "EXPIRING" &&
    (!link.expiresAt || link.expiresAt.getTime() <= Date.now())
  ) {
    return { status: "expired" };
  }

  if (!session?.userId) return { status: "login" };

  const allowed: string[] = JSON.parse(link.allowedEmails);
  const email = session.email?.toLowerCase() ?? "";
  const isOwner = link.envFile.userId === session.userId;
  if (!isOwner && !allowed.includes(email)) return { status: "forbidden" };

  try {
    return {
      status: "ok",
      name: link.envFile.name,
      content: decrypt(link.envFile.contentEncrypted),
    };
  } catch {
    return { status: "invalid" };
  }
}
