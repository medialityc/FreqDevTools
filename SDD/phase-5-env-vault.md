# Fase 5 — Bóveda `.env` + compartición

## Objetivo
Subir, ver y editar archivos `.env` cifrados, y compartirlos por link con control de acceso. Ruta protegida.

## Tareas

1. **Bóveda** (`src/app/env/page.tsx`, protegida):
   - Lista de archivos `.env` del usuario (filtrado por `userId`).
   - **Subir** (input file `.env`) o **crear/pegar** contenido; se guarda cifrado (`encrypt`).
   - **Ver/editar** contenido (descifrado en servidor) y **eliminar**.
2. **Crear link de compartición** (action en `src/actions/env.ts`):
   - Tipo **EXPIRING**: el usuario elige fecha/plazo de vencimiento (`expiresAt`).
   - Tipo **UNLIMITED**: vive hasta revocación.
   - Ambos: lista de **correos autorizados** (`allowedEmails`, JSON).
   - `token` generado con `crypto.randomBytes` (base64url). URL: `/share/<token>`.
   - Listar links de un archivo, con estado, y **revocar** (`revoked=true`).
3. **Vista compartida** (`src/app/share/[token]/page.tsx`):
   - Resolver el link aplicando las reglas de `security.md`:
     1. token existe y no revocado; 2. si EXPIRING no expirado; 3. sesión iniciada; 4. correo autorizado o dueño.
   - Si falta sesión → login con `callbackUrl`. Si no autorizado → 403. Si inválido/expirado → mensaje claro.
   - Muestra el contenido descifrado (solo lectura) con opción de copiar/descargar.

## Criterios de aceptación
- Subir/crear un `.env` lo guarda cifrado (no legible en DB) y se puede ver/editar descifrado.
- Link EXPIRING deja de funcionar tras su vencimiento.
- Link UNLIMITED funciona hasta revocarse; revocar bloquea el acceso.
- Solo usuarios logueados con correo autorizado (o el dueño) ven el contenido; otros reciben 403; sin sesión → login.
