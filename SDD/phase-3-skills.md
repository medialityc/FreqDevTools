# Fase 3 — Marketplace de skills

## Objetivo
Publicar, explorar, votar y descargar skills `.md`. Explorar es público; publicar y votar requieren login.

## Tareas

1. **Lista pública** (`src/app/skills/page.tsx`, server component):
   - Cards con título, descripción, categoría, autor, puntaje (sum votos), copias.
   - **Filtro por categoría** y **orden**: más votadas / más copiadas / más recientes.
2. **Detalle** (`src/app/skills/[id]/page.tsx`):
   - Render del markdown (`content`).
   - Botón **Copiar** y **Descargar `.md`** → incrementa `copyCount` (action).
   - Controles de **voto** up/down (solo con sesión).
   - Muestra el **autor** que la publicó.
3. **Publicar** (`src/app/skills/new/page.tsx`, protegido):
   - Campos: **título*** (requerido), descripción, contenido (markdown), categoría (select de categorías predefinidas). Validación zod.
   - Action crea `Skill` con `authorId` = usuario en sesión.
4. **Votar** (action):
   - Upsert de `SkillVote` (único por skill+usuario); permite cambiar/retirar el voto.
5. **Actions** en `src/actions/skills.ts`; `revalidatePath` tras mutaciones.

## Criterios de aceptación
- Usuario logueado publica una skill y aparece en la lista con su autor.
- Otro usuario vota (up/down) y el puntaje se actualiza; no puede votar dos veces (se reemplaza).
- Copiar/descargar incrementa `copyCount`.
- Ordenar por votadas/copiadas/recientes devuelve el orden correcto.
- Publicar/votar sin sesión redirige a login.
