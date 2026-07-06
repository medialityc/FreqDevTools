"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2, Globe, User } from "lucide-react";
import { deleteCredential, revealSecret } from "@/actions/credentials";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CopyButton } from "@/components/CopyButton";
import { CredentialForm, type CredentialView } from "./CredentialForm";

export function CredentialItem({ credential }: { credential: CredentialView }) {
  const router = useRouter();
  const [secret, setSecret] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggleReveal() {
    if (secret !== null) {
      setSecret(null);
      return;
    }
    start(async () => {
      const res = await revealSecret(credential.id);
      if (res.error) setError(res.error);
      else setSecret(res.secret ?? "");
    });
  }

  function remove() {
    if (!confirm(`¿Eliminar la credencial "${credential.name}"?`)) return;
    start(async () => {
      const res = await deleteCredential(credential.id);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  if (editing) {
    return (
      <Card>
        <CardContent>
          <CredentialForm
            credential={credential}
            onSuccess={() => {
              setEditing(false);
              router.refresh();
            }}
            onCancel={() => setEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium">{credential.name}</div>
            <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {credential.domain && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {credential.domain}
                </span>
              )}
              {credential.username && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {credential.username}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(true)}
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={remove}
              disabled={pending}
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-sm">
            {secret !== null ? secret || "(vacío)" : "••••••••••••"}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleReveal}
            disabled={pending}
          >
            {secret !== null ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {secret !== null ? "Ocultar" : "Revelar"}
          </Button>
          {secret !== null && <CopyButton text={secret} label="" />}
        </div>

        {credential.notes && (
          <p className="text-sm text-muted-foreground">{credential.notes}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
