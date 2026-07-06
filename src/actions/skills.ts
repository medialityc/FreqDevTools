"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { skillSchema } from "@/lib/validators";

const COPIER_COOKIE = "fdt_cid";

/**
 * Devuelve una clave estable para identificar a quien copia/descarga:
 * el userId si hay sesión, o un id anónimo persistido en cookie httpOnly.
 */
async function getCopierKey(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return `user:${session.user.id}`;

  const store = await cookies();
  let cid = store.get(COPIER_COOKIE)?.value;
  if (!cid) {
    cid = randomBytes(16).toString("hex");
    store.set(COPIER_COOKIE, cid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return `anon:${cid}`;
}

export type SkillFormState = { error?: string } | undefined;

export async function createSkill(
  _prev: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para publicar." };
  }

  const parsed = skillSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    content: formData.get("content"),
    category: formData.get("category"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const skill = await prisma.skill.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description?.trim() || null,
      content: parsed.data.content,
      category: parsed.data.category,
      authorId: session.user.id,
    },
  });

  revalidatePath("/skills");
  redirect(`/skills/${skill.id}`);
}

export async function voteSkill(skillId: string, value: 1 | -1) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para votar." };
  }
  const userId = session.user.id;

  const existing = await prisma.skillVote.findUnique({
    where: { skillId_userId: { skillId, userId } },
  });

  if (existing && existing.value === value) {
    // Mismo voto: se retira.
    await prisma.skillVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.skillVote.upsert({
      where: { skillId_userId: { skillId, userId } },
      update: { value },
      create: { skillId, userId, value },
    });
  }

  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  return { success: true };
}

export async function incrementCopyCount(
  skillId: string,
): Promise<{ counted: boolean }> {
  const copierKey = await getCopierKey();

  // Registro único por (skill, copier): si ya existe, no se vuelve a contar.
  try {
    await prisma.skillCopy.create({ data: { skillId, copierKey } });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return { counted: false }; // ya contado por este user/sesión
    }
    throw e;
  }

  await prisma.skill.update({
    where: { id: skillId },
    data: { copyCount: { increment: 1 } },
  });
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  return { counted: true };
}
