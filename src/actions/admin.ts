"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session.user;
}

export type ActionResult = { error?: string; success?: string };

export async function setUserActive(
  userId: string,
  active: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { error: "No puedes desactivar tu propia cuenta." };
  }
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: active },
  });
  revalidatePath("/admin");
  return { success: active ? "Usuario activado." : "Usuario desactivado." };
}

export async function changeUserPassword(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = changePasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash },
  });
  revalidatePath("/admin");
  return { success: "Contraseña actualizada." };
}
