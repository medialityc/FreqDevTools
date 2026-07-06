# Fase 4 — Gestor de credenciales

## Objetivo
CRUD de credenciales cifradas por usuario, agrupadas por dominio o por nombre. Ruta protegida.

## Tareas

1. **Página** (`src/app/credentials/page.tsx`, protegida, server component):
   - Lista las credenciales del usuario en sesión (filtrado por `userId`).
   - **Agrupación conmutable**: por `domain` o por `name`.
   - Secreto oculto por defecto; botón **Revelar** que descifra bajo demanda (action server).
2. **Crear/editar** (formulario + actions en `src/actions/credentials.ts`):
   - Campos: nombre*, dominio, usuario, secreto*, notas. Validación zod.
   - El secreto se cifra con `encrypt()` antes de persistir; se descifra solo en servidor.
3. **Eliminar** (action con confirmación).
4. **Seguridad**: todas las actions verifican sesión y que la credencial pertenece al usuario (`userId`).

## Criterios de aceptación
- Crear credencial la guarda con `secretEncrypted` cifrado (verificable en DB: no legible).
- Revelar muestra el valor original descifrado.
- Editar y eliminar funcionan y respetan pertenencia (un usuario no ve/edita las de otro).
- Agrupar por dominio y por nombre reorganiza la vista.
- Acceso sin sesión → redirección a login.
