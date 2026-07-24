"use client";

import { useState } from "react";
import { ArrowLeftRight, Download } from "lucide-react";
import {
  appSettingsJsonToKeyValue,
  keyValueToAppSettingsJson,
} from "@/tools/appsettings-parser";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent } from "@/components/ui/Card";
import { CopyButton } from "@/components/CopyButton";

type Direction = "kv-to-json" | "json-to-kv";

const SAMPLE_KV = `BaseUrl=https://api.example.com
Logging:LogLevel:Default=Information
Logging:LogLevel:System=Warning
ConnectionStrings:logs = Host=host-db;Port=5432;Database=dbname`;

const SAMPLE_JSON = `{
  "BaseUrl": "https://api.example.com",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "System": "Warning"
    }
  }
}`;

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AppSettingsTool() {
  const [direction, setDirection] = useState<Direction>("kv-to-json");
  const [source, setSource] = useState(SAMPLE_KV);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isKvToJson = direction === "kv-to-json";

  function convert() {
    try {
      setResult(
        isKvToJson
          ? keyValueToAppSettingsJson(source)
          : appSettingsJsonToKeyValue(source),
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al parsear");
      setResult("");
    }
  }

  function toggleDirection() {
    const next: Direction = isKvToJson ? "json-to-kv" : "kv-to-json";
    setDirection(next);
    setSource(next === "kv-to-json" ? SAMPLE_KV : SAMPLE_JSON);
    setResult("");
    setError(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={toggleDirection}>
          <ArrowLeftRight className="h-4 w-4" />
          {isKvToJson
            ? 'Cambiar a "appsettings.json → clave=valor"'
            : 'Cambiar a "clave=valor → appsettings.json"'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3">
            <span className="text-sm font-medium">
              {isKvToJson
                ? 'Texto clave=valor (usa ":" para anidar)'
                : "appsettings.json"}
            </span>
            <Textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="min-h-96 font-mono text-sm"
              spellCheck={false}
            />
            <Button onClick={convert} className="w-full">
              {isKvToJson
                ? "Convertir a appsettings.json"
                : "Convertir a clave=valor"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isKvToJson ? "appsettings.json" : "Texto clave=valor"}
              </span>
              {result && (
                <div className="flex gap-2">
                  <CopyButton text={result} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      download(
                        result,
                        isKvToJson ? "appsettings.json" : "config.env",
                        isKvToJson ? "application/json" : "text/plain",
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              )}
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <pre className="min-h-96 overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-sm">
                {result || "El resultado aparecerá aquí."}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
