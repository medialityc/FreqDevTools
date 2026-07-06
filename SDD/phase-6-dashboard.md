# Fase 6 — Dashboard y pulido

## Objetivo
Home con contenido destacado y accesos directos; extras para admin; pulido final.

## Tareas

1. **Dashboard** (`src/app/page.tsx`, server component):
   - Sección **skills mejor votadas** (top N por suma de votos).
   - Sección **más copiadas/descargadas** (top N por `copyCount`).
   - Sección **más recientes** (top N por `createdAt`).
   - **Accesos directos** a cada herramienta (GUID, API keys, serializador C#) y a skills.
2. **Extras admin** (si sesión ADMIN):
   - Tarjeta con **conteo total de usuarios** y enlace a `/admin` (gestión).
3. **Pulido**:
   - Dark mode consistente, responsive.
   - Estados vacíos (sin skills, sin credenciales, sin env).
   - Manejo de errores en actions (mensajes al usuario).
   - Metadata/SEO básica del sitio.
4. **Verificación final**: `pnpm lint` y `pnpm build` sin errores; recorrido end-to-end (ver `README` del plan).

## Criterios de aceptación
- El dashboard muestra las tres secciones con datos reales y en el orden correcto.
- Los accesos directos navegan a cada herramienta.
- El admin ve el conteo de usuarios y el enlace de gestión; un usuario normal no.
- `pnpm lint` y `pnpm build` pasan.
