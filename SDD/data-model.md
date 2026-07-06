# Modelo de datos

Base de datos SQLite gestionada con Prisma. Archivo `prisma/schema.prisma`.

## Esquema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  role         Role     @default(USER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  skills       Skill[]
  votes        SkillVote[]
  credentials  Credential[]
  envFiles     EnvFile[]
}

model Skill {
  id          String   @id @default(cuid())
  title       String
  description String?
  content     String                  // markdown (.md)
  category    String
  copyCount   Int      @default(0)    // copias/descargas
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  votes       SkillVote[]
  createdAt   DateTime @default(now())

  @@index([category])
  @@index([createdAt])
}

model SkillVote {
  id      String @id @default(cuid())
  skillId String
  userId  String
  value   Int                          // +1 / -1
  skill   Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([skillId, userId])
}

model SkillCopy {
  id        String   @id @default(cuid())
  skillId   String
  copierKey String   // "user:<id>" o "anon:<cookie>"
  createdAt DateTime @default(now())
  skill     Skill    @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@unique([skillId, copierKey])   // copyCount solo sube una vez por user/sesión
}

model Credential {
  id              String   @id @default(cuid())
  userId          String
  name            String
  domain          String?
  username        String?
  secretEncrypted String                // AES-256-GCM
  notes           String?
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}

model EnvFile {
  id               String   @id @default(cuid())
  userId           String
  name             String
  kind             VaultKind @default(ENV)   // ENV | WORKFLOW (bóveda genérica)
  contentEncrypted String                // AES-256-GCM
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  shareLinks       EnvShareLink[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([userId, kind])
}

model EnvShareLink {
  id            String    @id @default(cuid())
  envFileId     String
  token         String    @unique         // parte del URL público
  type          ShareType
  expiresAt     DateTime?                  // solo EXPIRING
  revoked       Boolean   @default(false)
  allowedEmails String                     // JSON array de correos autorizados
  envFile       EnvFile   @relation(fields: [envFileId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
}

enum Role      { USER ADMIN }
enum ShareType { EXPIRING UNLIMITED }
enum VaultKind { ENV WORKFLOW }
```

> **Bóveda genérica:** `EnvFile` almacena tanto archivos `.env` (`kind=ENV`) como
> workflows de GitHub Actions (`kind=WORKFLOW`). Ambos comparten cifrado, links de
> compartición (`EnvShareLink`) y la ruta pública `/share/[token]`.

## Entidades

- **User** — cuenta. `role` distingue admin. `isActive=false` bloquea el login. `passwordHash` con bcrypt.
- **Skill** — publicación `.md` de un usuario. `copyCount` cuenta copias/descargas. El puntaje = suma de `votes.value`.
- **SkillVote** — voto único por (skill, usuario); `value` +1 o -1. Cambiar el voto actualiza el registro existente.
- **Credential** — secreto cifrado del usuario, agrupable por `domain` o `name`.
- **EnvFile** — archivo `.env` cuyo contenido se guarda cifrado.
- **EnvShareLink** — link de compartición. `EXPIRING` usa `expiresAt`; `UNLIMITED` vive hasta `revoked=true`. `allowedEmails` es un JSON array; el visitante debe estar logueado con un correo de esa lista (o ser dueño).

## Consultas derivadas

- **Skills más votadas**: ordenar por `sum(votes.value)` desc (agregación en el server component).
- **Skills más copiadas**: `orderBy copyCount desc`.
- **Skills recientes**: `orderBy createdAt desc`.
- **Conteo de usuarios (admin)**: `user.count()`.

## Seed

`prisma/seed.ts` crea el admin idempotentemente (`upsert` por email):

```
email:        admin@freqdevtools.com
password:     admin_devtools   (guardado como bcrypt hash)
role:         ADMIN
isActive:     true
```
