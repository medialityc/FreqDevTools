// Generación de contraseñas — lógica pura.

export interface PasswordOptions {
  length: number; // 6|8|12|16 desde el radio; por defecto 8
  lettersOnly: boolean; // solo letras
  numbersOnly: boolean; // solo números
  requireSpecial: boolean; // al menos un carácter especial
  requireUppercase: boolean; // al menos una mayúscula
  count: number; // cantidad de contraseñas a generar
}

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()-_=+[]{};:,.?";

/** Entero uniforme en [0, max) sin sesgo (rejection sampling con crypto). */
function randInt(max: number): number {
  if (max <= 0) return 0;
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    globalThis.crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % max;
}

/** Elige un carácter aleatorio de una cadena. */
function pick(chars: string): string {
  return chars[randInt(chars.length)];
}

/** Baraja un array in-place (Fisher–Yates) con aleatoriedad criptográfica. */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Genera una sola contraseña según las opciones dadas. */
function generateOnePassword(opts: PasswordOptions, length: number): string {
  let pool: string;
  const required: string[] = []; // grupos con al menos un carácter garantizado

  // Prioridad numbersOnly > lettersOnly (la UI ya evita el conflicto).
  if (opts.numbersOnly) {
    pool = DIGITS;
  } else if (opts.lettersOnly) {
    pool = LOWER + (opts.requireUppercase ? UPPER : "");
    if (opts.requireUppercase) required.push(UPPER);
  } else {
    pool = LOWER + DIGITS;
    if (opts.requireUppercase) {
      pool += UPPER;
      required.push(UPPER);
    }
    if (opts.requireSpecial) {
      pool += SPECIAL;
      required.push(SPECIAL);
    }
  }

  const chars: string[] = [];
  // Coloca un carácter garantizado por cada grupo requerido.
  for (const group of required) {
    if (chars.length >= length) break;
    chars.push(pick(group));
  }
  // Rellena el resto desde el pool completo.
  while (chars.length < length) {
    chars.push(pick(pool));
  }

  return shuffle(chars).join("");
}

/** Genera una lista de contraseñas con las opciones dadas. */
export function generatePasswords(opts: PasswordOptions): string[] {
  const length = Math.max(1, Math.min(opts.length || 8, 256));
  const count = Math.max(1, Math.min(opts.count || 1, 1000));
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(generateOnePassword(opts, length));
  }
  return result;
}
