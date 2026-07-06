// Generación de GUID/UUID (v1, v4, v7) — lógica pura, sin dependencias.
// Usa globalThis.crypto (disponible en navegador y Node 18+).

export type GuidVersion = "v1" | "v4" | "v7";

export interface GuidOptions {
  version: GuidVersion;
  count: number;
  uppercase: boolean;
  hyphens: boolean;
  braces: boolean;
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

/** Compone la representación canónica 8-4-4-4-12 a partir de 16 bytes. */
function bytesToUuid(bytes: Uint8Array): string {
  const h = toHex(bytes);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

/** UUID v4: 122 bits aleatorios. */
export function uuidV4(): string {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // versión 4
  b[8] = (b[8] & 0x3f) | 0x80; // variante RFC 4122
  return bytesToUuid(b);
}

/** UUID v7: timestamp de 48 bits (ms) + aleatorio (RFC 9562). */
export function uuidV7(): string {
  const b = randomBytes(16);
  const ts = Date.now();
  b[0] = (ts / 2 ** 40) & 0xff;
  b[1] = (ts / 2 ** 32) & 0xff;
  b[2] = (ts / 2 ** 24) & 0xff;
  b[3] = (ts / 2 ** 16) & 0xff;
  b[4] = (ts / 2 ** 8) & 0xff;
  b[5] = ts & 0xff;
  b[6] = (b[6] & 0x0f) | 0x70; // versión 7
  b[8] = (b[8] & 0x3f) | 0x80; // variante
  return bytesToUuid(b);
}

// Estado para el contador monotónico de v1 (clock sequence).
let v1ClockSeq = randomBytes(2)[0] & 0x3f;
const v1Node = (() => {
  const n = randomBytes(6);
  n[0] |= 0x01; // bit multicast: nodo aleatorio, no MAC real
  return n;
})();

/** UUID v1: basado en tiempo (100ns desde 1582-10-15). */
export function uuidV1(): string {
  // Intervalos de 100ns entre el epoch Gregoriano (1582) y el Unix (1970).
  const GREGORIAN_OFFSET = 122192928000000000n;
  const now = BigInt(Date.now()) * 10000n + GREGORIAN_OFFSET;

  const timeLow = Number(now & 0xffffffffn);
  const timeMid = Number((now >> 32n) & 0xffffn);
  const timeHi = Number((now >> 48n) & 0x0fffn) | 0x1000; // versión 1

  v1ClockSeq = (v1ClockSeq + 1) & 0x3f;
  const clockSeq = v1ClockSeq | 0x80; // variante en el byte alto

  const b = new Uint8Array(16);
  b[0] = (timeLow >>> 24) & 0xff;
  b[1] = (timeLow >>> 16) & 0xff;
  b[2] = (timeLow >>> 8) & 0xff;
  b[3] = timeLow & 0xff;
  b[4] = (timeMid >>> 8) & 0xff;
  b[5] = timeMid & 0xff;
  b[6] = (timeHi >>> 8) & 0xff;
  b[7] = timeHi & 0xff;
  b[8] = clockSeq & 0xff;
  b[9] = v1ClockSeq & 0xff;
  b.set(v1Node, 10);
  return bytesToUuid(b);
}

function generateOne(version: GuidVersion): string {
  switch (version) {
    case "v1":
      return uuidV1();
    case "v7":
      return uuidV7();
    case "v4":
    default:
      return uuidV4();
  }
}

/** Aplica formato (mayúsculas, guiones, llaves) a un UUID canónico. */
export function formatGuid(
  uuid: string,
  opts: Pick<GuidOptions, "uppercase" | "hyphens" | "braces">,
): string {
  let out = uuid;
  if (!opts.hyphens) out = out.replace(/-/g, "");
  if (opts.uppercase) out = out.toUpperCase();
  if (opts.braces) out = `{${out}}`;
  return out;
}

/** Genera una lista de GUIDs con las opciones dadas. */
export function generateGuids(opts: GuidOptions): string[] {
  const count = Math.max(1, Math.min(opts.count || 1, 1000));
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(formatGuid(generateOne(opts.version), opts));
  }
  return result;
}
