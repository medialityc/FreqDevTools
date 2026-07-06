import { describe, expect, it } from "vitest";
import { formatGuid, generateGuids, uuidV1, uuidV4, uuidV7 } from "./guid";

const CANONICAL =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("uuid versions", () => {
  it("v4 tiene el nibble de versión 4 y variante RFC", () => {
    const u = uuidV4();
    expect(u).toMatch(CANONICAL);
    expect(u[14]).toBe("4");
    expect("89ab").toContain(u[19]);
  });

  it("v7 tiene el nibble de versión 7", () => {
    const u = uuidV7();
    expect(u).toMatch(CANONICAL);
    expect(u[14]).toBe("7");
  });

  it("v1 tiene el nibble de versión 1", () => {
    const u = uuidV1();
    expect(u).toMatch(CANONICAL);
    expect(u[14]).toBe("1");
  });

  it("genera valores únicos", () => {
    const set = new Set(Array.from({ length: 100 }, () => uuidV4()));
    expect(set.size).toBe(100);
  });
});

describe("formatGuid", () => {
  const base = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  it("mayúsculas", () => {
    expect(formatGuid(base, { uppercase: true, hyphens: true, braces: false })).toBe(
      base.toUpperCase(),
    );
  });
  it("sin guiones", () => {
    expect(
      formatGuid(base, { uppercase: false, hyphens: false, braces: false }),
    ).toBe("3fa85f6457174562b3fc2c963f66afa6");
  });
  it("con llaves", () => {
    expect(
      formatGuid(base, { uppercase: false, hyphens: true, braces: true }),
    ).toBe(`{${base}}`);
  });
});

describe("generateGuids", () => {
  it("respeta la cantidad", () => {
    const list = generateGuids({
      version: "v4",
      count: 5,
      uppercase: false,
      hyphens: true,
      braces: false,
    });
    expect(list).toHaveLength(5);
    for (const g of list) expect(g).toMatch(CANONICAL);
  });

  it("limita la cantidad a un máximo razonable", () => {
    const list = generateGuids({
      version: "v4",
      count: 100000,
      uppercase: false,
      hyphens: true,
      braces: false,
    });
    expect(list.length).toBeLessThanOrEqual(1000);
  });
});
