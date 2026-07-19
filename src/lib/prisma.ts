import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

// El pooler de Supabase exige SSL (con un certificado que node-postgres no
// valida contra las CA del sistema). Los hosts internos de CapRover
// (srv-captain--*) no tienen SSL habilitado, así que solo se activa cuando
// la URL apunta a Supabase o lo pide explícitamente vía sslmode=require.
const needsSsl = (url: string) =>
  /supabase\.(co|com)/.test(url) || /sslmode=require/.test(url);

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
    ssl: needsSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined,
  });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
