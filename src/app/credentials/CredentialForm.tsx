"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createCredential, updateCredential } from "@/actions/credentials";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

export interface CredentialView {
  id: string;
  name: string;
  domain: string | null;
  username: string | null;
  notes: string | null;
  createdAt: string;
}

export function CredentialForm({
  credential,
  onSuccess,
  onCancel,
}: {
  credential?: CredentialView;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!credential;
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = isEdit
        ? await updateCredential(credential!.id, undefined, fd)
        : await createCredential(undefined, fd);
      if (res?.error) setError(res.error);
      else onSuccess();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" defaultValue={credential?.name} required />
        </div>
        <div>
          <Label htmlFor="domain">Dominio</Label>
          <Input
            id="domain"
            name="domain"
            defaultValue={credential?.domain ?? ""}
            placeholder="ej. github.com"
          />
        </div>
        <div>
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            name="username"
            defaultValue={credential?.username ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="secret">Secreto *</Label>
          <Input
            id="secret"
            name="secret"
            type="password"
            placeholder={isEdit ? "Reescribe el secreto" : ""}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" defaultValue={credential?.notes ?? ""} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
