"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CredentialForm, type CredentialView } from "./CredentialForm";
import { CredentialItem } from "./CredentialItem";

type GroupBy = "domain" | "name";

export function CredentialsManager({
  credentials,
}: {
  credentials: CredentialView[];
}) {
  const router = useRouter();
  const [groupBy, setGroupBy] = useState<GroupBy>("domain");
  const [adding, setAdding] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<string, CredentialView[]>();
    for (const c of credentials) {
      const key =
        groupBy === "domain"
          ? c.domain?.trim() || "Sin dominio"
          : (c.name.trim()[0]?.toUpperCase() ?? "#");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [credentials, groupBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Agrupar por:</span>
          <div className="inline-flex overflow-hidden rounded-lg border border-border">
            {(["domain", "name"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={
                  groupBy === g
                    ? "bg-primary px-3 py-1 text-primary-foreground"
                    : "px-3 py-1 hover:bg-muted"
                }
              >
                {g === "domain" ? "Dominio" : "Nombre"}
              </button>
            ))}
          </div>
        </div>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Nueva credencial
          </Button>
        )}
      </div>

      {adding && (
        <Card>
          <CardContent>
            <CredentialForm
              onSuccess={() => {
                setAdding(false);
                router.refresh();
              }}
              onCancel={() => setAdding(false)}
            />
          </CardContent>
        </Card>
      )}

      {credentials.length === 0 && !adding ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            No tienes credenciales guardadas. Crea la primera con{" "}
            <strong>Nueva credencial</strong>.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([groupName, items]) => (
            <section key={groupName}>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                {groupName}{" "}
                <span className="font-normal">({items.length})</span>
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((c) => (
                  <CredentialItem key={c.id} credential={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
