import { prisma } from "@/lib/prisma";

/**
 * Autor único al que se atribuyen todas las skills publicadas anónimamente.
 * Desde que se eliminó el login no hay cuentas de usuario reales: cada skill
 * queda a nombre de este usuario semilla "Anónimo".
 */
export const ANON_AUTHOR_EMAIL = "anonimo@freqdevtools.local";

/** Devuelve el id del autor anónimo, creándolo si aún no existe. */
export async function getAnonymousAuthorId(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: ANON_AUTHOR_EMAIL },
    update: {},
    create: {
      email: ANON_AUTHOR_EMAIL,
      name: "Anónimo",
      passwordHash: "-", // login deshabilitado; nunca se usa
      role: "USER",
      isActive: true,
    },
    select: { id: true },
  });
  return user.id;
}
