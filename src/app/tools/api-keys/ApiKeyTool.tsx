"use client";

import { useState } from "react";
import {
  generateApiKeys,
  type KeyEncoding,
  type KeySeparator,
} from "@/tools/apikey";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { ListResult } from "@/components/ListResult";

export function ApiKeyTool() {
  const [bits, setBits] = useState(256);
  const [prefix, setPrefix] = useState("sk");
  const [separator, setSeparator] = useState<KeySeparator>("_");
  const [encoding, setEncoding] = useState<KeyEncoding>("base64url");
  const [count, setCount] = useState(3);
  const [items, setItems] = useState<string[]>([]);

  function generate() {
    setItems(generateApiKeys({ bits, prefix, separator, encoding, count }));
  }

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bits">Longitud (bits)</Label>
            <Select
              id="bits"
              value={bits}
              onChange={(e) => setBits(Number(e.target.value))}
            >
              <option value={128}>128</option>
              <option value={192}>192</option>
              <option value={256}>256</option>
              <option value={512}>512</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="prefix">Prefijo</Label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="sk"
            />
          </div>
          <div>
            <Label htmlFor="separator">Separador del prefijo</Label>
            <Select
              id="separator"
              value={separator}
              onChange={(e) => setSeparator(e.target.value as KeySeparator)}
            >
              <option value="-">Guion (-)</option>
              <option value="_">Guion bajo (_)</option>
              <option value="+">Más (+)</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="encoding">Codificación</Label>
            <Select
              id="encoding"
              value={encoding}
              onChange={(e) => setEncoding(e.target.value as KeyEncoding)}
            >
              <option value="base64url">base64url</option>
              <option value="hex">hex</option>
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
