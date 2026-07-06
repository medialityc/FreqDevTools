"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { VaultConfig } from "@/lib/vault";
import type { VaultFileView } from "@/lib/vault-types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { SearchBox } from "@/components/SearchBox";
import { VaultFileForm } from "./VaultFileForm";
import { VaultFileItem } from "./VaultFileItem";

export function VaultManager({
  config,
  files,
}: {
  config: VaultConfig;
  files: VaultFileView[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre..."
          className="max-w-xs flex-1"
        />
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            {config.newLabel}
          </Button>
        )}
      </div>

      {adding && (
        <Card>
          <CardContent>
            <VaultFileForm
              config={config}
              onSuccess={() => {
                setAdding(false);
                router.refresh();
              }}
              onCancel={() => setAdding(false)}
            />
          </CardContent>
        </Card>
      )}

      {files.length === 0 && !adding ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            {config.emptyText} Crea uno con <strong>{config.newLabel}</strong>.
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            Sin resultados para “{query}”.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((f) => (
            <VaultFileItem key={f.id} config={config} file={f} />
          ))}
        </div>
      )}
    </div>
  );
}
