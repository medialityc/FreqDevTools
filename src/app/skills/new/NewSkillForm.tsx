"use client";

import { useActionState } from "react";
import { createSkill, type SkillFormState } from "@/actions/skills";
import { SKILL_CATEGORIES } from "@/lib/skills";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function NewSkillForm() {
  const [state, formAction, pending] = useActionState<SkillFormState, FormData>(
    createSkill,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input id="title" name="title" required maxLength={120} />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" name="description" maxLength={300} />
      </div>
      <div>
        <Label htmlFor="category">Categoría</Label>
        <Select id="category" name="category" defaultValue="General">
          {SKILL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="content">Contenido (Markdown) *</Label>
        <Textarea
          id="content"
          name="content"
          required
          className="min-h-80 font-mono text-sm"
          placeholder="# Mi skill&#10;&#10;Descripción en markdown..."
        />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Publicando..." : "Publicar"}
      </Button>
    </form>
  );
}
