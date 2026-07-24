import { describe, expect, it } from "vitest";
import { generatePasswords, type PasswordOptions } from "./password";

const BASE: PasswordOptions = {
  length: 8,
  lettersOnly: false,
  numbersOnly: false,
  requireSpecial: true,
  requireUppercase: false,
  count: 5,
};

const SPECIAL_RE = /[!@#$%^&*()\-_=+[\]{};:,.?]/;

describe("generatePasswords", () => {
  it("respeta la longitud pedida", () => {
    const list = generatePasswords({ ...BASE, length: 12 });
    for (const p of list) expect(p).toHaveLength(12);
  });

  it("respeta la cantidad", () => {
    expect(generatePasswords({ ...BASE, count: 5 })).toHaveLength(5);
  });

  it("limita la cantidad a un máximo razonable", () => {
    const list = generatePasswords({ ...BASE, count: 100000 });
    expect(list.length).toBeLessThanOrEqual(1000);
  });

  it("con defaults incluye un carácter especial en cada contraseña", () => {
    const list = generatePasswords(BASE);
    expect(list).toHaveLength(5);
    for (const p of list) {
      expect(p).toHaveLength(8);
      expect(p).toMatch(SPECIAL_RE);
    }
  });

  it("solo letras produce únicamente [a-zA-Z]", () => {
    const list = generatePasswords({
      ...BASE,
      lettersOnly: true,
      requireSpecial: false,
      requireUppercase: true,
      count: 20,
    });
    for (const p of list) {
      expect(p).toMatch(/^[a-zA-Z]+$/);
      expect(p).toMatch(/[A-Z]/); // al menos una mayúscula garantizada
    }
  });

  it("solo números produce únicamente [0-9]", () => {
    const list = generatePasswords({
      ...BASE,
      numbersOnly: true,
      requireSpecial: false,
      count: 20,
    });
    for (const p of list) expect(p).toMatch(/^[0-9]+$/);
  });

  it("al menos un carácter especial se cumple en cada contraseña", () => {
    const list = generatePasswords({
      ...BASE,
      requireSpecial: true,
      length: 6,
      count: 50,
    });
    for (const p of list) expect(p).toMatch(SPECIAL_RE);
  });

  it("al menos una mayúscula se cumple en cada contraseña", () => {
    const list = generatePasswords({
      ...BASE,
      requireUppercase: true,
      count: 50,
    });
    for (const p of list) expect(p).toMatch(/[A-Z]/);
  });
});
