"use client";

import { useState } from "react";
import { generateGuids, type GuidVersion } from "@/tools/guid";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { ListResult } from "@/components/ListResult";

export function GuidTool() {
  const [version, setVersion] = useState<GuidVersion>("v4");
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [braces, setBraces] = useState(false);
  const [items, setItems] = useState<string[]>([]);

  function generate() {
    setItems(generateGuids({ version, count, uppercase, hyphens, braces }));
  }

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="version">Versión</Label>
            <Select
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value as GuidVersion)}
            >
              <option value="v1">v1 (basado en tiempo)</option>
              <option value="v4">v4 (aleatorio)</option>
              <option value="v7">v7 (tiempo + aleatorio)</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="count">Cantidad</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
              />
              Mayúsculas
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={(e) => setHyphens(e.target.checked)}
              />
              Con guiones
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={braces}
                onChange={(e) => setBraces(e.target.checked)}
              />
              Entre llaves {"{ }"}
            </label>
          </div>
          <Button onClick={generate} className="w-full">
            Generar
          </Button>
        </CardContent>
      </Card>

      <div>
        {items.length > 0 ? (
          <ListResult items={items} />
        ) : (
          <Card>
            <CardContent className="text-sm text-muted-foreground">
              Configura las opciones y pulsa <strong>Generar</strong>.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
