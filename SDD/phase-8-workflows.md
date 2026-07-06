# Fase 8 — Sección de workflows de GitHub Actions

## Objetivo
Una bóveda personal, análoga a la de variables de entorno, para guardar, ver, editar y compartir archivos de **workflows de GitHub Actions** (YAML). Ruta protegida.

## Diseño: bóveda generalizada

En lugar de duplicar el código de la Fase 5, se **generaliza** la bóveda de archivos:

- Se añade el campo **`kind`** (`ENV` | `WORKFLOW`) al modelo `EnvFile` (migración aditiva, sin pérdida de datos). El modelo pasa a representar un archivo cifrado genérico; los links de compartición (`EnvShareLink`) sirven para ambos tipos.
- Los módulos de código se renombran conceptualmente a "vault":
  - `src/actions/vault.ts` — CRUD + links, todas reciben/filtran por `kind` y `userId`.
  - `src/lib/vault-queries.ts` — `getUserFiles(userId, kind)`.
  - `src/lib/vault-share.ts` — resolución de link (kind-agnóstica; una sola ruta `/share/[token]` sirve env y workflows).
  - `src/components/vault/*` — `VaultManager`, `VaultFileItem`, `VaultFileForm`, `SharePanel` parametrizados por `kind`.
- Configuración por tipo (`src/lib/vault.ts`): título, descripción, placeholders, nombre de ejemplo y extensión de descarga.

| kind | ejemplo nombre | placeholder contenido |
|---|---|---|
| ENV | `.env.production` | `API_KEY=...` |
| WORKFLOW | `deploy.yml` | `name: CI\non: [push]\njobs: ...` |

## Páginas
- `/env` — bóveda de variables de entorno (kind ENV).
- `/workflows` — bóveda de workflows (kind WORKFLOW), protegida.
- Ambas comparten los mismos componentes; solo cambian etiquetas y `kind`.

## Seguridad
Idéntica a la Fase 5: contenido cifrado (AES-256-GCM), acceso filtrado por `userId`, compartición por link (EXPIRING/UNLIMITED) con correos autorizados y login requerido.

## Criterios de aceptación
- `/workflows` protegida; permite subir/crear/ver/editar/eliminar YAML cifrado.
- Compartir workflows funciona igual que env (mismas reglas y ruta `/share`).
- La bóveda de env sigue funcionando sin regresiones. `lint`/`build` limpios.
