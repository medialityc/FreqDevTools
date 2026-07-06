import { z } from "zod";
import { SKILL_CATEGORIES } from "@/lib/skills";

export const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    name: z.string().trim().max(80).optional(),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const skillSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(120),
  description: z.string().trim().max(300).optional(),
  content: z.string().trim().min(1, "El contenido es obligatorio"),
  category: z.enum(SKILL_CATEGORIES),
});

export const credentialSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  domain: z.string().trim().max(200).optional(),
  username: z.string().trim().max(200).optional(),
  secret: z.string().min(1, "El secreto es obligatorio"),
  notes: z.string().trim().max(1000).optional(),
});

export const envFileSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  content: z.string().max(100_000, "El archivo es demasiado grande"),
});

export const changePasswordSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
