"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { credentialSchema } from "@/lib/validators";

export type CredentialState = { error?: string; success?: boolean } | undefined;

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  return session.user.id;
}

function parse(formData: FormData) {
  return credentialSchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain") || undefined,
    username: formData.get("username") || undefined,
    secret: formData.get("secret"),
    notes: formData.get("notes") || undefined,
  });
}

export async function createCredential(
  _prev: CredentialState,
  formData: FormData,
): Promise<CredentialState> {
  const userId = await requireUserId();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.credential.create({
    data: {
      userId,
      name: parsed.data.name,
      domain: parsed.data.domain?.trim() || null,
      username: parsed.data.username?.trim() || null,
      secretEncrypted: encrypt(parsed.data.secret),
      notes: parsed.data.notes?.trim() || null,
    },
  });

  revalidatePath("/credentials");
  return { success: true };
}

export async function updateCredential(
  id: string,
  _prev: CredentialState,
  formData: FormData,
): Promise<CredentialState> {
  const userId = await requireUserId();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  // Verifica pertenencia antes de actualizar (evita IDOR).
  const owned = await prisma.credential.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!owned) return { error: "No encontrada." };

  await prisma.credential.update({
    where: { id },
    data: {
      name: parsed.data.name,
      domain: parsed.data.domain?.trim() || null,
      username: parsed.data.username?.trim() || null,
      secretEncrypted: encrypt(parsed.data.secret),
      notes: parsed.data.notes?.trim() || null,
    },
  });

  revalidatePath("/credentials");
  return { success: true };
}

export async function deleteCredential(id: string): Promise<CredentialState> {
  const userId = await requireUserId();
  // deleteMany con filtro por userId: no borra si no es del usuario.
  const res = await prisma.credential.deleteMany({ where: { id, userId } });
  if (res.count === 0) return { error: "No encontrada." };
  revalidatePath("/credentials");
  return { success: true };
}

/** Descifra y devuelve el secreto bajo demanda (solo si es del usuario). */
export async function revealSecret(
  id: string,
): Promise<{ secret?: string; error?: string }> {
  const userId = await requireUserId();
  const cred = await prisma.credential.findFirst({
    where: { id, userId },
    select: { secretEncrypted: true },
  });
  if (!cred) return { error: "No encontrada." };
  try {
    return { secret: decrypt(cred.secretEncrypted) };
  } catch {
    return { error: "No se pudo descifrar." };
  }
}
