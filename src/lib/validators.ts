import { z } from "zod";
import { SKILL_CATEGORIES } from "@/lib/skills";

export const skillSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(120),
  description: z.string().trim().max(300).optional(),
  content: z.string().trim().min(1, "El contenido es obligatorio"),
  category: z.enum(SKILL_CATEGORIES),
});
