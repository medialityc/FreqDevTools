import { describe, expect, it } from "vitest";
import { applyPrefix, generateApiKeys, generateKey } from "./apikey";

describe("generateKey", () => {
  it("hex produce 2 caracteres por byte", () => {
    const key = generateKey(128, "hex");
    expect(key).toHaveLength(32); // 128 bits = 16 bytes = 32 hex
    expect(key).toMatch(/^[0-9a-f]+$/);
  });

  it("base64url no contiene +, / ni padding", () => {
    const key = generateKey(256, "base64url");
    expect(key).not.toMatch(/[+/=]/);
    expect(key).toMatch(/^[A-Za-z0-9\-_]+$/);
  });
});

describe("applyPrefix", () => {
  it("aplica prefijo y separador", () => {
    expect(applyPrefix("abc", "sk", "_")).toBe("sk_abc");
    expect(applyPrefix("abc", "sk", "-")).toBe("sk-abc");
    expect(applyPrefix("abc", "sk", "+")).toBe("sk+abc");
  });
  it("sin prefijo devuelve la clave tal cual", () => {
    expect(applyPrefix("abc", "", "_")).toBe("abc");
    expect(applyPrefix("abc", "   ", "_")).toBe("abc");
  });
});

describe("generateApiKeys", () => {
  it("respeta cantidad y prefijo", () => {
    const keys = generateApiKeys({
      bits: 128,
      prefix: "live",
      separator: "_",
      encoding: "hex",
      count: 3,
    });
    expect(keys).toHaveLength(3);
    for (const k of keys) expect(k.startsWith("live_")).toBe(true);
    expect(new Set(keys).size).toBe(3);
  });
});
