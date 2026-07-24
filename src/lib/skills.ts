// Constantes y utilidades compartidas para skills.

export const SKILL_CATEGORIES = [
  "General",
  "Frontend",
  "Backend",
  "DevOps",
  "Base de datos",
  "Testing",
  "IA",
  "Otros",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export type SkillSort = "copies" | "recent";

export const SKILL_SORTS: { value: SkillSort; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "copies", label: "Más copiadas" },
];
