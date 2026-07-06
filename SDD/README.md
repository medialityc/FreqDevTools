# FreqDevTools — Software Design Document (SDD)

Sitio de herramientas para desarrolladores web, construido sobre **Next.js 16 (App Router) + React 19 + Tailwind v4 + TypeScript**, con **Prisma + SQLite** y **Auth.js (NextAuth v5)**.

## Visión

Una plataforma con herramientas de uso diario para desarrolladores, más zonas privadas para gestionar datos sensibles:

- **Herramientas públicas** (sin login): generador de GUID, generador de API keys/HMAC, serializador de clases C# a JSON de ejemplo.
- **Zonas privadas** (requieren login): publicar/gestionar skills, gestor de credenciales cifradas, bóveda de archivos `.env` con compartición por link.
- **Control de usuarios** con registro, roles (`USER`/`ADMIN`) y un admin fijo.
- **Dashboard** de inicio con skills destacadas y accesos directos a cada herramienta; panel extra para admin.
- **Cifrado en reposo** de todo lo sensible.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.10 (App Router, React Compiler) |
| UI | React 19, Tailwind CSS v4 (CSS-first), lucide-react |
| Lenguaje | TypeScript (strict), alias `@/*` → `src/*` |
| DB / ORM | SQLite + Prisma |
| Auth | Auth.js (NextAuth v5), Credentials provider, sesión JWT |
| Hash | bcryptjs |
| Cifrado | AES-256-GCM (módulo `crypto` nativo de Node) |
| Validación | zod |
| Package manager | pnpm |

## Decisiones de arquitectura

1. **SQLite + Prisma**: cero configuración, portable, ideal para herramienta auto-hospedada.
2. **NextAuth v5 con sesión JWT** (sin tablas de adapter): Credentials provider (email + password). Fallback a auth propia con `jose` si hay incompatibilidad con Next 16.
3. **Compartir `.env` solo por control de acceso** (sin envío de emails): el link exige login y valida que el correo esté autorizado.
4. **`.env` cifrados como blob en la DB**: portable, sin depender del sistema de archivos.
5. **Server Actions + zod** para todas las mutaciones; el descifrado ocurre solo en servidor.

## Documentos

- [`data-model.md`](./data-model.md) — esquema Prisma y entidades.
- [`security.md`](./security.md) — hashing, cifrado, autorización.
- [`phase-0-foundation.md`](./phase-0-foundation.md) — fundación e infraestructura.
- [`phase-1-auth-users.md`](./phase-1-auth-users.md) — auth y usuarios + admin.
- [`phase-2-tools.md`](./phase-2-tools.md) — herramientas públicas.
- [`phase-3-skills.md`](./phase-3-skills.md) — marketplace de skills.
- [`phase-4-credentials.md`](./phase-4-credentials.md) — gestor de credenciales.
- [`phase-5-env-vault.md`](./phase-5-env-vault.md) — bóveda `.env` + compartición.
- [`phase-6-dashboard.md`](./phase-6-dashboard.md) — dashboard y pulido.
- [`phase-7-datetime-tool.md`](./phase-7-datetime-tool.md) — herramienta DateTime → C#.
- [`phase-8-workflows.md`](./phase-8-workflows.md) — bóveda de workflows de GitHub Actions.
- [`phase-9-search.md`](./phase-9-search.md) — buscador en páginas de listado.

## Estructura de carpetas objetivo

```
src/
  app/
    layout.tsx                  nav global + SessionProvider
    page.tsx                    dashboard
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    tools/guid/page.tsx
    tools/api-keys/page.tsx
    tools/csharp-serializer/page.tsx
    tools/datetime/page.tsx     conversor de fecha a formatos C#
    skills/page.tsx             lista pública
    skills/[id]/page.tsx        detalle
    skills/new/page.tsx         publicar (protegido)
    credentials/page.tsx        protegido
    env/page.tsx                bóveda .env (protegido)
    workflows/page.tsx          bóveda de workflows (protegido)
    share/[token]/page.tsx      ver .env compartido (login + email)
    admin/page.tsx              protegido ADMIN
    api/auth/[...nextauth]/route.ts
  components/                   UI reutilizable
  lib/                          prisma.ts, auth.ts, crypto.ts, validators.ts
  actions/                      server actions por dominio
  tools/                        lógica pura: guid.ts, apikey.ts, csharp-parser.ts
prisma/
  schema.prisma
  seed.ts
```

## Variables de entorno

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<random 32+ chars>"
ENCRYPTION_KEY="<32 bytes en base64>"
```
