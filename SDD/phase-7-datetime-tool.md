# Fase 7 — Herramienta DateTime → C#

## Objetivo
Herramienta pública que permite elegir una fecha y hora mediante un calendario y convertirla a múltiples formatos usados en C#/.NET y de intercambio.

## Componentes

1. **`src/components/DateTimePicker.tsx`** (ya existente, extendido)
   - Nuevas props:
     - `disablePast?: boolean` — si `false`, permite seleccionar fechas pasadas (necesario para esta tool). Por defecto `true` en el link de compartir.
     - `withSeconds?: boolean` — añade selector de segundos.
     - `onChange?(value: string)` — callback con el valor `YYYY-MM-DDTHH:mm[:ss]` cuando cambia la selección.
   - Sigue exponiendo `name` para un `<input hidden>` (compatibilidad con formularios).

2. **`src/app/tools/datetime/page.tsx`** + `DateTimeTool.tsx` (cliente)
   - Calendario + hora (+ segundos) y botón **Ahora**.
   - Los formatos se calculan en el handler `onChange` (no en render) para cumplir la regla de pureza del React Compiler.

## Formatos de salida (con copiado)

Interpretando la selección como hora local:

| Formato | Ejemplo |
|---|---|
| C# `DateTime` "O" (round-trip) | `2024-01-15T14:30:00.0000000` |
| ISO 8601 UTC (Z) | `2024-01-15T20:30:00Z` |
| C# `new DateTime(...)` | `new DateTime(2024, 1, 15, 14, 30, 0)` |
| C# `DateTimeOffset` | `new DateTimeOffset(2024, 1, 15, 14, 30, 0, TimeSpan.FromHours(-6))` |
| Ticks (.NET) | `638409...` |
| Unix (segundos) | `1705343400` |
| Unix (milisegundos) | `1705343400000` |
| Formato "s" (sortable) | `2024-01-15T14:30:00` |
| Formato "u" (universal) | `2024-01-15 20:30:00Z` |

Ticks se calcula como `(unixMs + 62135596800000) * 10000` (100ns desde 0001-01-01 UTC).

## Criterios de aceptación
- Elegir fecha/hora produce todos los formatos correctos y copiables.
- Botón "Ahora" rellena con el instante actual.
- Página accesible sin login. `lint`/`build` limpios.
