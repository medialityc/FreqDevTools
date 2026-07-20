"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { keyValueToAppSettingsJson } from "@/tools/appsettings-parser";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent } from "@/components/ui/Card";
import { CopyButton } from "@/components/CopyButton";

const SAMPLE = `BaseUrl=https://api.zas.com
Logging:LogLevel:Default=Information
Logging:LogLevel:System=Warning
ConnectionStrings:logs = Host=srv-captain--pro-contacts-sync-logs-db;Port=5432;Database=zascontactsynclogs`;

function download(json: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "appsettings.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function AppSettingsTool() {
  const [source, setSource] = useState(SAMPLE);
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);

  function convert() {
    try {
      setJson(keyValueToAppSettingsJson(source));
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
          <span className="text-sm font-medium">
            Texto clave=valor (usa &quot;:&quot; para anidar)
          </span>
          <Textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="min-h-96 font-mono text-sm"
            spellCheck={false}
          />
          <Button onClick={convert} className="w-full">
            Convertir a appsettings.json
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">appsettings.json</span>
            {json && (
              <div className="flex gap-2">
                <CopyButton text={json} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => download(json)}
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
              {json || "El resultado aparecerá aquí."}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
