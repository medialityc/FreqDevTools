"use client";

import { useState } from "react";
import { csharpToJsonExample } from "@/tools/csharp-parser";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent } from "@/components/ui/Card";
import { CopyButton } from "@/components/CopyButton";

const SAMPLE = `public class Customer
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Age { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> Tags { get; set; }
    public Address HomeAddress { get; set; }
}

public class Address
{
    public string Street { get; set; }
    public string City { get; set; }
}`;

export function CSharpTool() {
  const [source, setSource] = useState(SAMPLE);
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);

  function convert() {
    try {
      setJson(csharpToJsonExample(source));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al parsear");
      setJson("");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-3">
          <span className="text-sm font-medium">Clase C#</span>
          <Textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="min-h-96 font-mono text-sm"
            spellCheck={false}
          />
          <Button onClick={convert} className="w-full">
            Convertir a JSON
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">JSON de ejemplo</span>
            {json && <CopyButton text={json} />}
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <pre className="min-h-96 overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-sm">
              {json || "El resultado aparecerá aquí."}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
