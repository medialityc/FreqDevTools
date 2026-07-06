import { defineConfig, env } from "prisma/config";

// Prisma 7 ya no auto-carga .env cuando existe prisma.config.ts.
try {
  process.loadEnvFile();
} catch {
  // .env ausente (p.ej. en CI con variables ya inyectadas): se ignora.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Las migraciones usan la conexión directa (puerto 5432) si está
    // definida; si no, caen a DATABASE_URL.
    url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
  },
});
