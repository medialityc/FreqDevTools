"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { envFileSchema } from "@/lib/validators";
import type { VaultKind } from "@/lib/vault";

export type VaultState = { error?: string; success?: boolean } | undefined;

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  return session.user.id;
}

function revalidateVault() {
  revalidatePath("/env");
  revalidatePath("/workflows");
}

export async function createVaultFile(
  kind: VaultKind,
  _prev: VaultState,
  formData: FormData,
): Promise<VaultState> {
  const userId = await requireUserId();
  const parsed = envFileSchema.safeParse({
    name: formData.get("name"),
    content: formData.get("content") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.envFile.create({
    data: {
      userId,
      kind,
      name: parsed.data.name,
      contentEncrypted: encrypt(parsed.data.content),
    },
  });
  revalidateVault();
  return { success: true };
}

export async function updateVaultFile(
  id: string,
  _prev: VaultState,
  formData: FormData,
): Promise<VaultState> {
  const userId = await requireUserId();
  const parsed = envFileSchema.safeParse({
    name: formData.get("name"),
    content: formData.get("content") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const owned = await prisma.envFile.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!owned) return { error: "No encontrado." };

  await prisma.envFile.update({
    where: { id },
    data: {
      name: parsed.data.name,
      contentEncrypted: encrypt(parsed.data.content),
    },
  });
  revalidateVault();
  return { success: true };
}

export async function deleteVaultFile(id: string): Promise<VaultState> {
  const userId = await requireUserId();
  const res = await prisma.envFile.deleteMany({ where: { id, userId } });
  if (res.count === 0) return { error: "No encontrado." };
  revalidateVault();
  return { success: true };
}

export async function revealVaultContent(
  id: string,
): Promise<{ content?: string; error?: string }> {
  const userId = await requireUserId();
  const file = await prisma.envFile.findFirst({
    where: { id, userId },
    select: { contentEncrypted: true },
  });
  if (!file) return { error: "No encontrado." };
  try {
    return { content: decrypt(file.contentEncrypted) };
  } catch {
    return { error: "No se pudo descifrar." };
  }
}

function parseEmails(raw: string): string[] {
  const parts = raw
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const valid = parts.filter((e) => z.string().email().safeParse(e).success);
  return [...new Set(valid)];
}

export async function createVaultShareLink(
  fileId: string,
  _prev: VaultState,
  formData: FormData,
): Promise<VaultState> {
  const userId = await requireUserId();
  const owned = await prisma.envFile.findFirst({
    where: { id: fileId, userId },
    select: { id: true },
  });
  if (!owned) return { error: "No encontrado." };

  const type = formData.get("type") === "EXPIRING" ? "EXPIRING" : "UNLIMITED";
  const emails = parseEmails((formData.get("allowedEmails") as string) ?? "");
  if (emails.length === 0) {
    return { error: "Indica al menos un correo autorizado válido." };
  }

  let expiresAt: Date | null = null;
  if (type === "EXPIRING") {
    const raw = (formData.get("expiresAt") as string) || "";
    const date = raw ? new Date(raw) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return { error: "Fecha de vencimiento inválida." };
    }
    if (date.getTime() <= Date.now()) {
      return { error: "La fecha de vencimiento debe ser futura." };
    }
    expiresAt = date;
  }

  await prisma.envShareLink.create({
    data: {
      envFileId: fileId,
      token: randomBytes(24).toString("base64url"),
      type,
      expiresAt,
      allowedEmails: JSON.stringify(emails),
    },
  });
  revalidateVault();
  return { success: true };
}

export async function revokeVaultShareLink(
  linkId: string,
): Promise<VaultState> {
  const userId = await requireUserId();
  const res = await prisma.envShareLink.updateMany({
    where: { id: linkId, envFile: { userId } },
    data: { revoked: true },
  });
  if (res.count === 0) return { error: "No encontrado." };
  revalidateVault();
  return { success: true };
}
