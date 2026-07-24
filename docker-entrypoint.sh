#!/bin/sh
set -e

echo "[entrypoint] Aplicando migraciones pendientes..."
node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Ejecutando seed (idempotente)..."
if ! node_modules/.bin/tsx prisma/seed.ts; then
  echo "[entrypoint] ADVERTENCIA: el seed falló (revisa DATABASE_URL en el .env horneado). El servidor arrancará igual." >&2
fi

echo "[entrypoint] Iniciando servidor..."
exec node server.js
