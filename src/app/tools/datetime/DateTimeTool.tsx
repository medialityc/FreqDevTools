"use client";

import { useState } from "react";
import {
  computeFormats,
  parseDateTimeLocal,
  type DateTimeFormat,
} from "@/tools/datetime";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DateTimePicker } from "@/components/DateTimePicker";
import { CopyButton } from "@/components/CopyButton";

export function DateTimeTool() {
  const [formats, setFormats] = useState<DateTimeFormat[]>([]);

  function handleChange(value: string) {
    const parts = parseDateTimeLocal(value);
    setFormats(parts ? computeFormats(parts) : []);
  }

  function useNow() {
    const n = new Date();
    setFormats(
      computeFormats({
        y: n.getFullYear(),
        m: n.getMonth(),
        d: n.getDate(),
        h: n.getHours(),
        mi: n.getMinutes(),
        s: n.getSeconds(),
      }),
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[340px_1fr]">
      <Card>
        <CardContent className="space-y-3">
          <span className="text-sm font-medium">Fecha y hora</span>
          <DateTimePicker
            disablePast={false}
            withSeconds
            onChange={handleChange}
          />
          <Button variant="outline" size="sm" onClick={useNow} className="w-full">
            Usar ahora
          </Button>
          <p className="text-xs text-muted-foreground">
            La selección se interpreta como hora local; las conversiones UTC,
            Unix y ticks se calculan a partir de ella.
          </p>
        </CardContent>
      </Card>

      <div>
        {formats.length > 0 ? (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {formats.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">
                      {f.label}
                    </div>
                    <code className="block truncate font-mono text-sm">
                      {f.value}
                    </code>
                  </div>
                  <CopyButton text={f.value} label="" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-sm text-muted-foreground">
              Elige una fecha y hora (o pulsa <strong>Usar ahora</strong>) para
              ver las conversiones.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
