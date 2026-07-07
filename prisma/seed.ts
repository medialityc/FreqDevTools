import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

try {
  process.loadEnvFile();
} catch {
  // .env ausente: se asume que las variables ya están inyectadas.
}

const ADMIN_EMAIL = "admin@freqdevtools.com";
const ADMIN_PASSWORD = "admin_devtools";

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL");

  const adapter = new PrismaPg({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "ADMIN", isActive: true },
    create: {
      email: ADMIN_EMAIL,
      name: "Administrador",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`Admin listo: ${admin.email} (rol ${admin.role})`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
