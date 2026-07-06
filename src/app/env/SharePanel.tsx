"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Link2, Trash2 } from "lucide-react";
import { createShareLink, revokeShareLink } from "@/actions/env";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { DateTimePicker } from "@/components/DateTimePicker";
import type { ShareLinkView } from "./types";

function ShareLinkRow({ link }: { link: ShareLinkView }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const active = !link.revoked && !link.expired;

  function copy() {
    const url = `${window.location.origin}/share/${link.token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  function revoke() {
    start(async () => {
      await revokeShareLink(link.id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border p-2 text-sm">
      <div className="flex items-center gap-2">
        <span
          className={
            active
              ? "rounded bg-success/15 px-1.5 py-0.5 text-xs text-success"
              : "rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
          }
        >
          {link.revoked ? "Revocado" : link.expired ? "Vencido" : "Activo"}
        </span>
        <span className="text-xs text-muted-foreground">
          {link.type === "UNLIMITED"
            ? "Sin vencimiento"
            : `Vence: ${link.expiresAt ? new Date(link.expiresAt).toLocaleString() : "-"}`}
        </span>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="sm" onClick={copy} disabled={!active}>
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          {!link.revoked && (
            <Button
              variant="ghost"
              size="sm"
              onClick={revoke}
              disabled={pending}
              aria-label="Revocar"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
      <div className="mt-1 truncate text-xs text-muted-foreground">
        /share/{link.token}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Autorizados: {link.allowedEmails.join(", ")}
      </div>
    </div>
  );
}

export function SharePanel({
  fileId,
  links,
}: {
  fileId: string;
  links: ShareLinkView[];
}) {
  const router = useRouter();
  const [type, setType] = useState<"UNLIMITED" | "EXPIRING">("UNLIMITED");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await createShareLink(fileId, undefined, fd);
      if (res?.error) setError(res.error);
      else {
        setError(null);
        (e.target as HTMLFormElement).reset();
        setType("UNLIMITED");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg bg-muted/40 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Link2 className="h-4 w-4" />
        Compartir
      </div>

      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((l) => (
            <ShareLinkRow key={l.id} link={l} />
          ))}
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <input type="hidden" name="type" value={type} />
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setType("UNLIMITED")}
            className={
              type === "UNLIMITED"
                ? "rounded-lg bg-primary px-3 py-1 text-primary-foreground"
                : "rounded-lg border border-border px-3 py-1"
            }
          >
            Hasta revocación
          </button>
          <button
            type="button"
            onClick={() => setType("EXPIRING")}
            className={
              type === "EXPIRING"
                ? "rounded-lg bg-primary px-3 py-1 text-primary-foreground"
                : "rounded-lg border border-border px-3 py-1"
            }
          >
            Con vencimiento
          </button>
        </div>

        {type === "EXPIRING" && (
          <div>
            <Label>Fecha de vencimiento</Label>
            <DateTimePicker name="expiresAt" />
          </div>
        )}

        <div>
          <Label htmlFor={`emails-${fileId}`}>Correos autorizados</Label>
          <Textarea
            id={`emails-${fileId}`}
            name="allowedEmails"
            className="min-h-16 text-sm"
            placeholder="ana@ejemplo.com, juan@ejemplo.com"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Creando..." : "Crear link"}
        </Button>
      </form>
    </div>
  );
}
