"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SKILL_CATEGORIES, SKILL_SORTS } from "@/lib/skills";
import { Select } from "@/components/ui/Select";

export function SkillFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "votes";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/skills?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-48">
        <Select
          value={category}
          onChange={(e) => update("category", e.target.value)}
          aria-label="Categoría"
        >
          <option value="">Todas las categorías</option>
          {SKILL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-48">
        <Select
          value={sort}
          onChange={(e) => update("sort", e.target.value)}
          aria-label="Ordenar"
        >
          {SKILL_SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
