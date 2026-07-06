# Fase 2 — Herramientas públicas

Herramientas sin login. Lógica pura en `src/tools/` (testeable con vitest), UI cliente en `src/app/tools/*`. Toda salida ofrece copiar y **array JSON**.

## 1. Generador de GUID (`src/tools/guid.ts`, `app/tools/guid/page.tsx`)
- Parámetros:
  - **versión**: v1, v4, v7.
  - **cantidad** (n).
  - **mayúsculas** / minúsculas.
  - **con/sin guiones**.
  - **con/sin llaves** `{...}`.
- Implementación: v4 con `crypto.randomUUID()`; v1 y v7 propias (timestamp + aleatorio, según RFC).
- Salida: lista + `["...","..."]` como JSON.
- Tests: formato válido por versión, respeta cantidad y opciones de formato.

## 2. Generador de API keys / HMAC (`src/tools/apikey.ts`, `app/tools/api-keys/page.tsx`)
- Parámetros:
  - **longitud en bits** (p.ej. 128/256/512, o libre).
  - **prefijo** (texto, p.ej. `sk`).
  - **separador** del prefijo: `-`, `_`, `+`.
  - **cantidad** (n).
- Implementación: `crypto.getRandomValues` → codificar (base64url/hex) → `prefijo + separador + key`.
- Salida: lista + array JSON.
- Tests: longitud en bits correcta, prefijo/separador aplicados, cantidad correcta.

## 3. Serializador de clase C# (`src/tools/csharp-parser.ts`, `app/tools/csharp-serializer/page.tsx`)
- Pegas una o varias clases C#; se parsean propiedades `public <tipo> <Nombre> { get; set; }` (también campos y `init`).
- Soporta: nullables (`?`), colecciones (`List<T>`, `IEnumerable<T>`, `T[]`), tipos anidados (clases pegadas), enums (primer valor).
- Genera JSON de ejemplo con **valor por defecto estilo Swagger**:
  | Tipo C# | Ejemplo |
  |---|---|
  | string | `"string"` |
  | int/long/short/byte | `0` |
  | double/float/decimal | `0` |
  | bool | `true` |
  | DateTime/DateTimeOffset | ISO fecha |
  | Guid | guid de ejemplo |
  | List/array | `[<elemento>]` |
  | clase conocida | objeto anidado recursivo |
  | desconocido | `{}` |
- Tests: propiedades primitivas, nullable, colección, clase anidada, enum.

## Criterios de aceptación
- Cada herramienta genera salida correcta y copiable, incluida la variante JSON.
- Tests de `src/tools/*` pasan (`pnpm test`).
- Páginas accesibles sin login.
