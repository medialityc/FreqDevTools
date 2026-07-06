"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SKILL_CATEGORIES, SKILL_SORTS } from "@/lib/skills";
import { Select } from "@/components/ui/Select";
import { SearchBox } from "@/components/SearchBox";

export function SkillFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "votes";
  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushWith(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/skills?${next.toString()}`);
  }

  function onSearch(value: string) {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => pushWith("q", value.trim()), 300);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <SearchBox
        value={q}
        onChange={onSearch}
        placeholder="Buscar skills..."
        className="w-full sm:w-64"
      />
      <div className="w-48">
        <Select
          value={category}
          onChange={(e) => pushWith("category", e.target.value)}
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
          onChange={(e) => pushWith("sort", e.target.value)}
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
