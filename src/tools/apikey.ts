// Generación de API keys / secretos HMAC — lógica pura.

export type KeyEncoding = "base64url" | "hex";
export type KeySeparator = "-" | "_" | "+";

export interface ApiKeyOptions {
  bits: number;
  prefix: string;
  separator: KeySeparator;
  encoding: KeyEncoding;
  count: number;
}

function randomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function toBase64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const base64 = btoa(bin);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeBytes(bytes: Uint8Array, encoding: KeyEncoding): string {
  return encoding === "hex" ? toHex(bytes) : toBase64url(bytes);
}

/** Genera una sola clave (sin prefijo) con la entropía indicada. */
export function generateKey(bits: number, encoding: KeyEncoding): string {
  const byteLen = Math.max(1, Math.ceil(bits / 8));
  return encodeBytes(randomBytes(byteLen), encoding);
}

/** Antepone el prefijo con su separador si hay prefijo. */
export function applyPrefix(
  key: string,
  prefix: string,
  separator: KeySeparator,
): string {
  const p = prefix.trim();
  return p ? `${p}${separator}${key}` : key;
}

/** Genera una lista de API keys con las opciones dadas. */
export function generateApiKeys(opts: ApiKeyOptions): string[] {
  const count = Math.max(1, Math.min(opts.count || 1, 1000));
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const key = generateKey(opts.bits, opts.encoding);
    result.push(applyPrefix(key, opts.prefix, opts.separator));
  }
  return result;
}
