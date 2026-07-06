"use client";

import { useRef, useState, useTransition } from "react";
import { Check, Copy, Download } from "lucide-react";
import { incrementCopyCount } from "@/actions/skills";
import { Button } from "@/components/ui/Button";

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "skill"
  );
}

export function SkillActions({
  skillId,
  title,
  content,
}: {
  skillId: string;
  title: string;
  content: string;
}) {
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();
  // El servidor ya deduplica por user/sesión; esto evita reenvíos redundantes.
  const reported = useRef(false);

  function registerCopy() {
    if (reported.current) return;
    reported.current = true;
    startTransition(async () => {
      await incrementCopyCount(skillId);
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      registerCopy();
    } catch {
      // clipboard no disponible
    }
  }

  function download() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(title)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    registerCopy();
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        Copiar
      </Button>
      <Button variant="outline" size="sm" onClick={download}>
        <Download className="h-4 w-4" />
        Descargar .md
      </Button>
    </div>
  );
}
