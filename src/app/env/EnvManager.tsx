"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EnvFileForm } from "./EnvFileForm";
import { EnvFileItem } from "./EnvFileItem";
import type { EnvFileView } from "./types";

export function EnvManager({ files }: { files: EnvFileView[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Nuevo archivo
          </Button>
        )}
      </div>

      {adding && (
        <Card>
          <CardContent>
            <EnvFileForm
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
            No tienes archivos guardados. Sube o crea uno con{" "}
            <strong>Nuevo archivo</strong>.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {files.map((f) => (
            <EnvFileItem key={f.id} file={f} />
          ))}
        </div>
      )}
    </div>
  );
}
