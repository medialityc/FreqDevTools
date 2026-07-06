"use client";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/CopyButton";

function slugify(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_") || "archivo.env";
}

export function ShareView({ name, content }: { name: string; content: string }) {
  function download() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = slugify(name);
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <pre className="max-h-[28rem] overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-sm">
        {content || "(vacío)"}
      </pre>
      <div className="flex gap-2">
        <CopyButton text={content} />
        <Button variant="outline" size="sm" onClick={download}>
          Descargar
        </Button>
      </div>
    </div>
  );
}
