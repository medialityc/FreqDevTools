# Fase 9 — Buscador en páginas de listado

## Objetivo
Añadir un buscador en cada página de listado: **skills, credenciales, variables de entorno y workflows**.

## Componente
- `src/components/SearchBox.tsx` — input de búsqueda reutilizable con icono y limpieza.

## Estrategia por página

- **Skills** (`/skills`, server component): búsqueda server-side vía parámetro `q`. Filtra por `title`/`description` con `contains` (LIKE en SQLite, case-insensitive ASCII). Se integra en `SkillFilters` junto a categoría y orden.
- **Credenciales** (`/credentials`), **Env** (`/env`), **Workflows** (`/workflows`): listas renderizadas en cliente (los managers ya tienen la data en memoria). Filtro **en cliente** por nombre/dominio/usuario (credenciales) o nombre (archivos), sin round-trip al servidor.

## Criterios de aceptación
- Cada listado filtra en vivo según el texto buscado.
- La búsqueda de skills respeta los filtros de categoría/orden existentes.
- `lint`/`build` limpios.
