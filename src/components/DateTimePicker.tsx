"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/Select";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

const pad = (n: number) => n.toString().padStart(2, "0");

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y: number, m: number): number {
  return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
}

/** Día de la semana (0=Domingo..6=Sábado) sin usar Date, vía Zeller. */
function dayOfWeek(y: number, m: number, d: number): number {
  let mm = m + 1;
  let yy = y;
  if (mm < 3) {
    mm += 12;
    yy -= 1;
  }
  const K = yy % 100;
  const J = Math.floor(yy / 100);
  const h =
    (d +
      Math.floor((13 * (mm + 1)) / 5) +
      K +
      Math.floor(K / 4) +
      Math.floor(J / 4) +
      5 * J) %
    7;
  return (h + 6) % 7;
}

interface Ymd {
  y: number;
  m: number;
  d: number;
}

function beforeToday(cell: Ymd, today: Ymd | null): boolean {
  if (!today) return false;
  if (cell.y !== today.y) return cell.y < today.y;
  if (cell.m !== today.m) return cell.m < today.m;
  return cell.d < today.d;
}

export function DateTimePicker({
  name,
  disablePast = true,
  withSeconds = false,
  onChange,
}: {
  name?: string;
  disablePast?: boolean;
  withSeconds?: boolean;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<Ymd | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [selected, setSelected] = useState<Ymd | null>(null);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function buildValue(sel: Ymd | null, h: number, mi: number, se: number): string {
    if (!sel) return "";
    const base = `${sel.y}-${pad(sel.m + 1)}-${pad(sel.d)}T${pad(h)}:${pad(mi)}`;
    return withSeconds ? `${base}:${pad(se)}` : base;
  }

  function emit(sel: Ymd | null, h: number, mi: number, se: number) {
    onChange?.(buildValue(sel, h, mi, se));
  }

  function ensureInit() {
    if (!today) {
      const n = new Date();
      const t = { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() };
      setToday(t);
      if (!view) setView({ y: t.y, m: t.m });
    }
  }

  function toggle() {
    ensureInit();
    setOpen((o) => !o);
  }

  function shiftMonth(delta: number) {
    setView((v) => {
      if (!v) return v;
      const total = v.y * 12 + v.m + delta;
      return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 };
    });
  }

  function pick(cell: Ymd) {
    setSelected(cell);
    emit(cell, hour, minute, second);
  }

  const value = buildValue(selected, hour, minute, second);
  const label = selected
    ? `${pad(selected.d)}/${pad(selected.m + 1)}/${selected.y} ${pad(hour)}:${pad(minute)}${withSeconds ? ":" + pad(second) : ""}`
    : "Selecciona fecha y hora";

  const leadingBlanks = view ? dayOfWeek(view.y, view.m, 1) : 0;
  const totalDays = view ? daysInMonth(view.y, view.m) : 0;
  const minuteStep = withSeconds ? 1 : 5;
  const minuteCount = 60 / minuteStep;

  return (
    <div className="relative" ref={ref}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-card px-3 text-left text-sm",
          !selected && "text-muted-foreground",
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        {label}
      </button>

      {open && view && (
        <div className="absolute z-50 mt-1 w-72 rounded-xl border border-border bg-card p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg p-1 hover:bg-muted"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">
              {MONTHS[view.m]} {view.y}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-lg p-1 hover:bg-muted"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <span key={`b${i}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = i + 1;
              const cell = { y: view.y, m: view.m, d };
              const disabled = disablePast && beforeToday(cell, today);
              const isSelected =
                selected?.y === cell.y &&
                selected?.m === cell.m &&
                selected?.d === d;
              const isToday =
                today?.y === cell.y && today?.m === cell.m && today?.d === d;
              return (
                <button
                  key={d}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(cell)}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-lg text-sm transition-colors",
                    disabled && "cursor-not-allowed text-muted-foreground/40",
                    !disabled && !isSelected && "hover:bg-muted",
                    isSelected && "bg-primary text-primary-foreground",
                    !isSelected && isToday && "border border-primary",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Hora</span>
            <Select
              value={hour}
              onChange={(e) => {
                const h = Number(e.target.value);
                setHour(h);
                emit(selected, h, minute, second);
              }}
              className="h-9 w-16"
              aria-label="Hora"
            >
              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={h}>
                  {pad(h)}
                </option>
              ))}
            </Select>
            <span>:</span>
            <Select
              value={minute}
              onChange={(e) => {
                const mi = Number(e.target.value);
                setMinute(mi);
                emit(selected, hour, mi, second);
              }}
              className="h-9 w-16"
              aria-label="Minutos"
            >
              {Array.from({ length: minuteCount }).map((_, i) => (
                <option key={i} value={i * minuteStep}>
                  {pad(i * minuteStep)}
                </option>
              ))}
            </Select>
            {withSeconds && (
              <>
                <span>:</span>
                <Select
                  value={second}
                  onChange={(e) => {
                    const se = Number(e.target.value);
                    setSecond(se);
                    emit(selected, hour, minute, se);
                  }}
                  className="h-9 w-16"
                  aria-label="Segundos"
                >
                  {Array.from({ length: 60 }).map((_, s) => (
                    <option key={s} value={s}>
                      {pad(s)}
                    </option>
                  ))}
                </Select>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
