# Fase 1 — Auth y usuarios

## Objetivo
Registro, login/logout, protección de rutas y panel de administración de usuarios.

## Tareas

1. **Registro** (`src/app/(auth)/register/page.tsx` + action):
   - Formulario email, nombre (opcional), password + confirmación. Validación zod (email válido, password mín. 8).
   - Action: verifica email único, hashea con bcrypt, crea `User` (role USER, isActive true), inicia sesión.
2. **Login** (`src/app/(auth)/login/page.tsx`):
   - Formulario email + password → `signIn("credentials")`. Soporta `callbackUrl`.
   - Mensaje claro si credenciales inválidas o cuenta desactivada.
3. **Logout**: botón en el nav → `signOut`.
4. **`middleware.ts`**: proteger `/credentials`, `/env`, `/skills/new` (sesión) y `/admin` (role ADMIN). Redirigir a `/login?callbackUrl=`.
5. **Panel admin** (`src/app/admin/page.tsx`, server component, solo ADMIN):
   - Tarjeta con **conteo total de usuarios**.
   - Tabla de usuarios (email, nombre, rol, estado, fecha) con acciones:
     - **Activar/Desactivar** (`isActive`) — action.
     - **Cambiar contraseña manualmente** — action que hashea el nuevo valor.
   - El admin no puede desactivarse a sí mismo.
6. **Validación NextAuth v5 ↔ Next 16**: confirmar que login/session/middleware funcionan; si no, aplicar fallback (auth propia con `jose`) manteniendo la misma API de `auth()`.

## Criterios de aceptación
- Registro crea usuario y deja sesión iniciada.
- Login/logout funcionan; una cuenta con `isActive=false` no puede loguear.
- Acceso a `/admin` sin ser ADMIN → redirección; con ADMIN → panel visible.
- Admin puede desactivar/reactivar y cambiar la contraseña de un usuario (verificable logueando con la nueva).
