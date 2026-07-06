"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, FileText, Pencil, Share2, Trash2 } from "lucide-react";
import { deleteVaultFile, revealVaultContent } from "@/actions/vault";
import type { VaultConfig } from "@/lib/vault";
import type { VaultFileView } from "@/lib/vault-types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CopyButton } from "@/components/CopyButton";
import { VaultFileForm } from "./VaultFileForm";
import { SharePanel } from "./SharePanel";

function slugify(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_") || "archivo";
}

export function VaultFileItem({
  config,
  file,
}: {
  config: VaultConfig;
  file: VaultFileView;
}) {
  const router = useRouter();
  const [content, setContent] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggleView() {
    if (content !== null) {
      setContent(null);
      return;
    }
    start(async () => {
      const res = await revealVaultContent(file.id);
      if (res.error) setError(res.error);
      else setContent(res.content ?? "");
    });
  }

  function startEdit() {
    start(async () => {
      const res = await revealVaultContent(file.id);
      if (res.error) setError(res.error);
      else {
        setContent(res.content ?? "");
        setEditing(true);
      }
    });
  }

  function remove() {
    if (!confirm(`¿Eliminar "${file.name}" y sus links compartidos?`)) return;
    start(async () => {
      const res = await deleteVaultFile(file.id);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  function download() {
    if (content === null) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = slugify(file.name);
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeLinks = file.links.filter((l) => !l.revoked && !l.expired).length;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4 text-primary" />
              {file.name}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Actualizado {new Date(file.updatedAt).toLocaleString()}
              {activeLinks > 0 && ` · ${activeLinks} link(s) activos`}
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" onClick={toggleView} disabled={pending} aria-label="Ver">
              {content !== null && !editing ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={startEdit} disabled={pending} aria-label="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSharing((v) => !v)}
              aria-label="Compartir"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={remove} disabled={pending} aria-label="Eliminar">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {editing ? (
          <VaultFileForm
            config={config}
            fileId={file.id}
            initialName={file.name}
            initialContent={content ?? ""}
            onSuccess={() => {
              setEditing(false);
              setContent(null);
              router.refresh();
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          content !== null && (
            <div className="space-y-2">
              <pre className="max-h-72 overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-sm">
                {content || "(vacío)"}
              </pre>
              <div className="flex gap-2">
                <CopyButton text={content} />
                <Button variant="outline" size="sm" onClick={download}>
                  Descargar
                </Button>
              </div>
            </div>
          )
        )}

        {sharing && <SharePanel fileId={file.id} links={file.links} />}
      </CardContent>
    </Card>
  );
}
