# Seguridad

## Contraseñas

- Hasheadas con **bcryptjs** (cost 12). Nunca se guardan ni transmiten en texto plano.
- El registro y el cambio de contraseña (admin) hashean antes de persistir.
- Login: `bcrypt.compare` en el `authorize` del Credentials provider.

## Cifrado en reposo (`src/lib/crypto.ts`)

Credenciales (`Credential.secretEncrypted`) y contenido de `.env` (`EnvFile.contentEncrypted`) se cifran con **AES-256-GCM**.

- Clave maestra: `ENCRYPTION_KEY` (32 bytes, en base64) desde variable de entorno. Se valida al arrancar.
- Formato almacenado: `base64(iv).base64(authTag).base64(ciphertext)` (iv de 12 bytes aleatorio por operación).
- API:
  ```ts
  encrypt(plaintext: string): string   // -> "iv.tag.ct"
  decrypt(stored: string): string      // valida authTag; lanza si fue manipulado
  ```
- El descifrado ocurre **solo en servidor** (server actions / route handlers). La clave nunca llega al cliente.

## Autenticación (`src/lib/auth.ts`)

- **NextAuth v5**, Credentials provider (email + password), estrategia de sesión **JWT** (cookie httpOnly, firmada con `AUTH_SECRET`).
- El callback `jwt`/`session` incluye `id`, `role` e `isActive` en el token/sesión para autorizar sin ir a la DB en cada request.
- Login rechazado si `isActive === false`.

## Autorización

- **`middleware.ts`** protege rutas que exigen sesión:
  - Requieren login: `/credentials/*`, `/env/*`, `/skills/new`.
  - Requieren `role === ADMIN`: `/admin/*`.
  - Sin sesión → redirección a `/login?callbackUrl=...`.
- Las **server actions** revalidan la sesión (no confían solo en el middleware) y filtran **siempre** por `userId` de la sesión para acceder a credenciales/env (previene IDOR).
- **Votar / publicar skills** exige sesión (verificado en la action).

## Compartición de `.env` (`/share/[token]`)

Un link se resuelve solo si **todas** se cumplen:

1. El `token` existe y `revoked === false`.
2. Si `type === EXPIRING`: `expiresAt > ahora`.
3. Hay sesión iniciada.
4. El correo de la sesión está en `allowedEmails` **o** es el dueño del `EnvFile`.

Si falla (1)/(2) → 404/"link inválido o expirado". Si falta (3) → redirección a login. Si falla (4) → 403.

## Otras consideraciones

- Inputs validados con **zod** en cada action (longitudes, formato de email, categorías permitidas).
- `.env` git-ignored (ya en `.gitignore`); se provee `.env.example` sin secretos.
- Tokens de compartición generados con `crypto.randomBytes` (base64url, ~32 bytes) — no adivinables.
