#!/bin/sh
set -e

echo "[entrypoint] Aplicando migraciones pendientes..."
node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Ejecutando seed (idempotente)..."
node_modules/.bin/tsx prisma/seed.ts

echo "[entrypoint] Iniciando servidor..."
exec node server.js
