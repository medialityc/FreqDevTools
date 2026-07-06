# Fase 0 — Fundación e infraestructura

## Objetivo
Dejar el proyecto listo para construir features: dependencias, base de datos, cifrado, auth base, layout y primitivos de UI.

## Tareas

1. **Dependencias** (`pnpm add`):
   - Runtime: `@prisma/client`, `next-auth@beta`, `bcryptjs`, `zod`, `lucide-react`.
   - Dev: `prisma`, `@types/bcryptjs`, `tsx` (para el seed), `vitest` (tests de `src/tools`).
2. **Prisma**: crear `prisma/schema.prisma` (ver `data-model.md`), `pnpm prisma migrate dev --name init`, `pnpm prisma generate`.
3. **`src/lib/prisma.ts`**: singleton del PrismaClient (evitar múltiples instancias en dev/HMR).
4. **`src/lib/crypto.ts`**: `encrypt`/`decrypt` AES-256-GCM (ver `security.md`).
5. **`src/lib/auth.ts`** + **`src/app/api/auth/[...nextauth]/route.ts`**: NextAuth v5, Credentials provider, callbacks jwt/session con `id`/`role`/`isActive`.
6. **Variables de entorno**: `.env` (local) y `.env.example` con `DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_KEY`.
7. **`prisma/seed.ts`**: upsert del admin. Añadir `"prisma": { "seed": "tsx prisma/seed.ts" }` en package.json. Ejecutar `pnpm prisma db seed`.
8. **Layout base** (`src/app/layout.tsx`): nav global con enlaces a herramientas/skills/zonas privadas, `SessionProvider`, toggle de tema (dark/light por clase), metadata del sitio.
9. **Primitivos UI** (`src/components/ui/`): `Button`, `Input`, `Select`, `Card`, `Textarea`, `Toast`/feedback — con Tailwind v4.

## Criterios de aceptación
- `pnpm prisma migrate dev` crea `dev.db` sin errores.
- `pnpm prisma db seed` crea el admin (verificable con `prisma studio`).
- `encrypt`/`decrypt` round-trip correcto; `decrypt` de un valor manipulado lanza error.
- El layout renderiza con nav y toggle de tema; `pnpm dev` arranca sin errores.
