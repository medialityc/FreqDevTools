"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { createVaultFile, updateVaultFile } from "@/actions/vault";
import type { VaultConfig } from "@/lib/vault";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

export function VaultFileForm({
  config,
  fileId,
  initialName = "",
  initialContent = "",
  onSuccess,
  onCancel,
}: {
  config: VaultConfig;
  fileId?: string;
  initialName?: string;
  initialContent?: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!fileId;
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContent(text);
    if (!name) setName(file.name);
  }

  function submit() {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("content", content);
    start(async () => {
      const res = isEdit
        ? await updateVaultFile(fileId!, undefined, fd)
        : await createVaultFile(config.kind, undefined, fd);
      if (res?.error) setError(res.error);
      else onSuccess();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="vault-name">Nombre *</Label>
          <Input
            id="vault-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={config.namePlaceholder}
          />
        </div>
        <div>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            onChange={onFile}
          />
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => fileInput.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Subir archivo
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="vault-content">Contenido</Label>
        <Textarea
          id="vault-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-56 font-mono text-sm"
          placeholder={config.contentPlaceholder}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Guardar"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
