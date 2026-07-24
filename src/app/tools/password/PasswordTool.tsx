"use client";

import { useState } from "react";
import { generatePasswords } from "@/tools/password";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { ListResult } from "@/components/ListResult";

const LENGTHS = [6, 8, 12, 16];

export function PasswordTool() {
  const [length, setLength] = useState(8);
  const [lettersOnly, setLettersOnly] = useState(false);
  const [numbersOnly, setNumbersOnly] = useState(false);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [requireUppercase, setRequireUppercase] = useState(false);
  const [count, setCount] = useState(1);
  const [items, setItems] = useState<string[]>([]);

  function toggleLettersOnly(checked: boolean) {
    setLettersOnly(checked);
    if (checked) {
      setNumbersOnly(false);
      setRequireSpecial(false); // solo letras no admite especiales
    }
  }

  function toggleNumbersOnly(checked: boolean) {
    setNumbersOnly(checked);
    if (checked) {
      setLettersOnly(false);
      setRequireSpecial(false);
      setRequireUppercase(false); // solo números no admite mayúsculas
    }
  }

  function generate() {
    setItems(
      generatePasswords({
        length,
        lettersOnly,
        numbersOnly,
        requireSpecial,
        requireUppercase,
        count,
      }),
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cantidad de caracteres</Label>
            <div className="flex flex-wrap gap-4">
              {LENGTHS.map((n) => (
                <label key={n} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="length"
                    checked={length === n}
                    onChange={() => setLength(n)}
                  />
                  {n}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={lettersOnly}
                disabled={numbersOnly}
                onChange={(e) => toggleLettersOnly(e.target.checked)}
              />
              Solo letras
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={numbersOnly}
                disabled={lettersOnly}
                onChange={(e) => toggleNumbersOnly(e.target.checked)}
              />
              Solo números
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={requireSpecial}
                disabled={lettersOnly || numbersOnly}
                onChange={(e) => setRequireSpecial(e.target.checked)}
              />
              Al menos un carácter especial
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={requireUppercase}
                disabled={numbersOnly}
                onChange={(e) => setRequireUppercase(e.target.checked)}
              />
              Al menos una mayúscula
            </label>
          </div>

          <div>
            <Label htmlFor="count">Cantidad de contraseñas</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
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
