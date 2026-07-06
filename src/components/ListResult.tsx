"use client";

import { CopyButton } from "@/components/CopyButton";

export function ListResult({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const asText = items.join("\n");
  const asJson = JSON.stringify(items, null, 2);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Lista ({items.length})</span>
          <CopyButton text={asText} />
        </div>
        <pre className="max-h-72 overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-sm">
          {asText}
        </pre>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">JSON</span>
          <CopyButton text={asJson} />
        </div>
        <pre className="max-h-72 overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-sm">
          {asJson}
        </pre>
      </div>
    </div>
  );
}
