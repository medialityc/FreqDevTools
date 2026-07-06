// Serializa una o varias clases C# a un JSON de ejemplo estilo Swagger.
// Parseo por regex + emparejado de llaves. No es un compilador completo:
// cubre propiedades auto-implementadas, nullables, colecciones, tipos
// anidados y enums.

interface Property {
  name: string;
  type: string;
}

interface ParsedSource {
  classes: Map<string, Property[]>;
  enums: Map<string, string[]>;
  order: string[]; // orden de aparición de las clases
}

const EXAMPLE_GUID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const EXAMPLE_DATE = "2024-01-01T00:00:00Z";

/** Encuentra bloques `class|struct|record Name { ... }` con llaves balanceadas. */
function extractBlocks(
  source: string,
  keyword: "class" | "struct" | "record" | "enum",
): Array<{ name: string; body: string }> {
  const blocks: Array<{ name: string; body: string }> = [];
  const re = new RegExp(
    `\\b${keyword}\\b\\s+([A-Za-z_][A-Za-z0-9_]*)`,
    "g",
  );
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    const name = m[1];
    // Buscar la primera llave de apertura tras el nombre.
    let i = re.lastIndex;
    while (i < source.length && source[i] !== "{" && source[i] !== ";") i++;
    if (source[i] !== "{") continue; // p.ej. record posicional o forward decl
    let depth = 0;
    const start = i;
    for (; i < source.length; i++) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
    }
    blocks.push({ name, body: source.slice(start + 1, i - 1) });
  }
  return blocks;
}

/** Extrae propiedades auto-implementadas de un cuerpo de clase. */
function parseProperties(body: string): Property[] {
  const props: Property[] = [];
  const re =
    /public\s+(?:virtual\s+|override\s+|required\s+|static\s+|readonly\s+|sealed\s+)*([A-Za-z_][A-Za-z0-9_.]*(?:\s*<[^{};]*?>)?(?:\s*\[\s*\])?\s*\??)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\{\s*get\s*;|=>|\{\s*init\s*;)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const type = m[1].replace(/\s+/g, "");
    const name = m[2];
    props.push({ name, type });
  }
  return props;
}

export function parseCSharp(source: string): ParsedSource {
  const classes = new Map<string, Property[]>();
  const enums = new Map<string, string[]>();
  const order: string[] = [];

  for (const kw of ["class", "struct", "record"] as const) {
    for (const { name, body } of extractBlocks(source, kw)) {
      if (!classes.has(name)) order.push(name);
      classes.set(name, parseProperties(body));
    }
  }

  for (const { name, body } of extractBlocks(source, "enum")) {
    const members = body
      .split(",")
      .map((s) => s.trim().split("=")[0].trim())
      .filter((s) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(s));
    enums.set(name, members);
  }

  return { classes, enums, order };
}

const SCALAR_DEFAULTS: Record<string, unknown> = {
  string: "string",
  char: "s",
  bool: true,
  boolean: true,
  byte: 0,
  sbyte: 0,
  short: 0,
  ushort: 0,
  int: 0,
  uint: 0,
  long: 0,
  ulong: 0,
  float: 0,
  double: 0,
  decimal: 0,
  datetime: EXAMPLE_DATE,
  datetimeoffset: EXAMPLE_DATE,
  dateonly: "2024-01-01",
  timeonly: "00:00:00",
  timespan: "00:00:00",
  guid: EXAMPLE_GUID,
  object: {},
  dynamic: {},
};

function stripNullable(type: string): string {
  return type.endsWith("?") ? type.slice(0, -1) : type;
}

/** Devuelve el valor de ejemplo para un tipo, resolviendo clases/enums. */
function defaultForType(
  rawType: string,
  parsed: ParsedSource,
  visited: Set<string>,
): unknown {
  const type = stripNullable(rawType);

  // Arrays: T[]
  if (type.endsWith("[]")) {
    const inner = type.slice(0, -2);
    return [defaultForType(inner, parsed, visited)];
  }

  // Genéricos: Name<...>
  const generic = type.match(/^([A-Za-z_][A-Za-z0-9_.]*)<(.+)>$/);
  if (generic) {
    const container = generic[1].split(".").pop()!;
    const args = splitGenericArgs(generic[2]);
    const collections = [
      "List",
      "IList",
      "IEnumerable",
      "ICollection",
      "IReadOnlyList",
      "IReadOnlyCollection",
      "HashSet",
      "ISet",
      "Collection",
      "Queue",
      "Stack",
    ];
    if (collections.includes(container)) {
      return [defaultForType(args[0], parsed, visited)];
    }
    if (
      container === "Dictionary" ||
      container === "IDictionary" ||
      container === "IReadOnlyDictionary"
    ) {
      return {};
    }
    if (container === "Nullable") {
      return defaultForType(args[0], parsed, visited);
    }
    if (container === "Task" || container === "ValueTask") {
      return args[0] ? defaultForType(args[0], parsed, visited) : null;
    }
    // Contenedor genérico desconocido: usa el primer argumento.
    return defaultForType(args[0], parsed, visited);
  }

  const simpleName = type.split(".").pop()!;
  const key = simpleName.toLowerCase();

  if (key in SCALAR_DEFAULTS) return SCALAR_DEFAULTS[key];

  if (parsed.enums.has(simpleName)) {
    return parsed.enums.get(simpleName)![0] ?? 0;
  }

  if (parsed.classes.has(simpleName)) {
    if (visited.has(simpleName)) return {}; // corta la recursión
    return buildObject(simpleName, parsed, new Set(visited).add(simpleName));
  }

  // Tipo desconocido: objeto vacío.
  return {};
}

/** Divide argumentos genéricos respetando anidamiento de <>. */
function splitGenericArgs(inner: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of inner) {
    if (ch === "<") depth++;
    if (ch === ">") depth--;
    if (ch === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

function buildObject(
  className: string,
  parsed: ParsedSource,
  visited: Set<string>,
): Record<string, unknown> {
  const props = parsed.classes.get(className) ?? [];
  const obj: Record<string, unknown> = {};
  for (const p of props) {
    obj[p.name] = defaultForType(p.type, parsed, visited);
  }
  return obj;
}

/**
 * Convierte código C# en un JSON de ejemplo (string formateado).
 * Usa la primera clase como raíz, salvo que se indique `rootClass`.
 */
export function csharpToJsonExample(
  source: string,
  rootClass?: string,
): string {
  const parsed = parseCSharp(source);
  if (parsed.order.length === 0) {
    throw new Error("No se encontró ninguna clase/struct/record en el código.");
  }
  const root = rootClass && parsed.classes.has(rootClass)
    ? rootClass
    : parsed.order[0];
  const example = buildObject(root, parsed, new Set([root]));
  return JSON.stringify(example, null, 2);
}
