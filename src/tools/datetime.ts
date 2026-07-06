// Conversión de una fecha/hora (interpretada como local) a formatos
// usados en C#/.NET y de intercambio. Lógica pura.

export interface DateTimeParts {
  y: number;
  m: number; // 0-11
  d: number;
  h: number;
  mi: number;
  s: number;
}

export interface DateTimeFormat {
  label: string;
  value: string;
}

const pad = (n: number, len = 2) => Math.abs(n).toString().padStart(len, "0");

// Ticks .NET = 100ns desde 0001-01-01 UTC. Offset a epoch Unix en ms.
const UNIX_TO_TICKS_MS = 62135596800000n;

export function computeFormats(p: DateTimeParts): DateTimeFormat[] {
  const date = new Date(p.y, p.m, p.d, p.h, p.mi, p.s, 0);
  const ms = date.getTime();

  // Reloj de pared local (independiente de zona horaria).
  const wall = `${p.y}-${pad(p.m + 1)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}:${pad(p.s)}`;

  // Offset local respecto a UTC.
  const offMin = -date.getTimezoneOffset();
  const offSign = offMin >= 0 ? "+" : "-";
  const offStr = `${offSign}${pad(Math.floor(Math.abs(offMin) / 60))}:${pad(Math.abs(offMin) % 60)}`;

  // ISO UTC (Z) sin milisegundos.
  const isoUtc = date.toISOString().replace(/\.\d{3}Z$/, "Z");
  // Formato "u" universal: "yyyy-MM-dd HH:mm:ssZ".
  const universal = isoUtc.replace("T", " ");

  const ticks = (BigInt(ms) + UNIX_TO_TICKS_MS) * 10000n;

  return [
    { label: "Round-trip 'O' (DateTimeOffset)", value: `${wall}.0000000${offStr}` },
    { label: "ISO 8601 UTC (Z)", value: isoUtc },
    { label: "Sortable 's'", value: wall },
    { label: "Universal 'u'", value: universal },
    {
      label: "C# new DateTime(...)",
      value: `new DateTime(${p.y}, ${p.m + 1}, ${p.d}, ${p.h}, ${p.mi}, ${p.s})`,
    },
    {
      label: "C# new DateTimeOffset(...)",
      value: `new DateTimeOffset(${p.y}, ${p.m + 1}, ${p.d}, ${p.h}, ${p.mi}, ${p.s}, TimeSpan.FromMinutes(${offMin}))`,
    },
    { label: "Ticks (.NET)", value: ticks.toString() },
    { label: "Unix (segundos)", value: Math.floor(ms / 1000).toString() },
    { label: "Unix (milisegundos)", value: ms.toString() },
  ];
}

/** Parsea "YYYY-MM-DDTHH:mm[:ss]" a partes. Devuelve null si es inválido. */
export function parseDateTimeLocal(value: string): DateTimeParts | null {
  const m = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!m) return null;
  return {
    y: Number(m[1]),
    m: Number(m[2]) - 1,
    d: Number(m[3]),
    h: Number(m[4]),
    mi: Number(m[5]),
    s: m[6] ? Number(m[6]) : 0,
  };
}
