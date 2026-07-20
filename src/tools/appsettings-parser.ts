// Convierte texto clave=valor (con anidación por ":") en el árbol de objetos
// que usa appsettings.json de .NET. Soporta comentarios, valores booleanos
// y secciones que representan arreglos (claves numéricas 0,1,2,...).

type ConfigNode = Record<string, unknown>;

function coerceValue(raw: string): unknown {
  if (/^(true|false)$/i.test(raw)) return raw.toLowerCase() === "true";
  return raw;
}

function setNested(
  root: ConfigNode,
  path: string[],
  value: unknown,
  line: number,
): void {
  let node = root;
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    const existing = node[segment];
    if (existing === undefined) {
      const next: ConfigNode = {};
      node[segment] = next;
      node = next;
    } else if (typeof existing === "object" && existing !== null) {
      node = existing as ConfigNode;
    } else {
      throw new Error(
        `Línea ${line}: la clave "${path.slice(0, i + 1).join(":")}" ya tiene un valor y no puede contener claves anidadas.`,
      );
    }
  }

  const lastKey = path[path.length - 1];
  if (typeof node[lastKey] === "object" && node[lastKey] !== null) {
    throw new Error(
      `Línea ${line}: la clave "${path.join(":")}" ya se usa como sección anidada.`,
    );
  }
  node[lastKey] = value;
}

/** Convierte objetos con claves "0","1","2",... en arreglos. */
function arrayify(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;

  const obj = value as ConfigNode;
  const keys = Object.keys(obj);
  const entries = keys.map((k) => [k, arrayify(obj[k])] as const);
  const isArrayLike =
    keys.length > 0 && keys.every((k, i) => k === String(i));

  if (isArrayLike) return entries.map(([, v]) => v);
  return Object.fromEntries(entries);
}

/** Parsea texto clave=valor (con anidación ":") a un árbol de objetos. */
export function parseKeyValueConfig(text: string): ConfigNode {
  const root: ConfigNode = {};
  let sawAny = false;

  text.split(/\r?\n/).forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) return;

    const eq = line.indexOf("=");
    if (eq === -1) {
      throw new Error(`Línea ${idx + 1}: falta "=" en "${line}".`);
    }

    const rawKey = line.slice(0, eq).trim();
    const rawValue = line.slice(eq + 1).trim();
    if (!rawKey) {
      throw new Error(`Línea ${idx + 1}: falta la clave antes de "=".`);
    }

    const path = rawKey
      .split(":")
      .map((s) => s.trim())
      .filter(Boolean);
    if (path.length === 0) {
      throw new Error(`Línea ${idx + 1}: clave inválida "${rawKey}".`);
    }

    setNested(root, path, coerceValue(rawValue), idx + 1);
    sawAny = true;
  });

  if (!sawAny) {
    throw new Error("No se encontraron pares clave=valor.");
  }

  return root;
}

/** Convierte texto clave=valor en un JSON compatible con appsettings.json. */
export function keyValueToAppSettingsJson(text: string): string {
  const root = parseKeyValueConfig(text);
  return JSON.stringify(arrayify(root), null, 2);
}
