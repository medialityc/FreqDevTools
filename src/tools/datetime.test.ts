import { describe, expect, it } from "vitest";
import { computeFormats, parseDateTimeLocal } from "./datetime";

const parts = { y: 2024, m: 0, d: 15, h: 14, mi: 30, s: 45 };

function get(label: string): string {
  return computeFormats(parts).find((f) => f.label === label)!.value;
}

describe("computeFormats", () => {
  it("genera el constructor C# DateTime (independiente de zona)", () => {
    expect(get("C# new DateTime(...)")).toBe(
      "new DateTime(2024, 1, 15, 14, 30, 45)",
    );
  });

  it("genera el formato sortable (reloj de pared)", () => {
    expect(get("Sortable 's'")).toBe("2024-01-15T14:30:45");
  });

  it("ticks y unix ms son consistentes entre sí", () => {
    const ms = BigInt(get("Unix (milisegundos)"));
    const ticks = BigInt(get("Ticks (.NET)"));
    expect(ticks).toBe((ms + 62135596800000n) * 10000n);
  });

  it("unix segundos = floor(ms/1000)", () => {
    const ms = Number(get("Unix (milisegundos)"));
    const s = Number(get("Unix (segundos)"));
    expect(s).toBe(Math.floor(ms / 1000));
  });

  it("ISO UTC termina en Z sin milisegundos", () => {
    expect(get("ISO 8601 UTC (Z)")).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});

describe("parseDateTimeLocal", () => {
  it("parsea con segundos", () => {
    expect(parseDateTimeLocal("2024-01-15T14:30:45")).toEqual(parts);
  });
  it("parsea sin segundos (s=0)", () => {
    expect(parseDateTimeLocal("2024-01-15T14:30")).toEqual({ ...parts, s: 0 });
  });
  it("rechaza formato inválido", () => {
    expect(parseDateTimeLocal("no-fecha")).toBeNull();
  });
});
