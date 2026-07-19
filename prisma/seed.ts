import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

try {
  process.loadEnvFile();
} catch {
  // .env ausente: se asume que las variables ya están inyectadas.
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ---------------------------------------------------------------------------
// Datos de ejemplo
// ---------------------------------------------------------------------------

const SKILLS: { title: string; description: string; category: string; content: string }[] = [
  {
    title: "Revisar PR con checklist",
    description: "Guía paso a paso para revisar pull requests de forma consistente.",
    category: "General",
    content: `# Revisión de PR

1. Lee la descripción y entiende el objetivo del cambio.
2. Verifica que los tests cubran el caso nuevo.
3. Revisa nombres, tipos y manejo de errores.
4. Comprueba que no se filtren secretos ni credenciales.
5. Deja comentarios accionables, no opiniones vagas.`,
  },
  {
    title: "Componente accesible con Radix",
    description: "Patrón para construir componentes UI accesibles reutilizando primitivas de Radix.",
    category: "Frontend",
    content: `# Componentes accesibles

- Usa primitivas de Radix (Dialog, Popover, Select) como base.
- Nunca elimines el focus ring; personalízalo con Tailwind.
- Añade \`aria-label\` a botones que solo tienen icono.
- Prueba la navegación completa con teclado (Tab / Shift+Tab / Escape).`,
  },
  {
    title: "Endpoints idempotentes en Next.js",
    description: "Cómo diseñar server actions y route handlers seguros ante reintentos.",
    category: "Backend",
    content: `# Idempotencia

- Toda mutación debe poder ejecutarse dos veces sin efectos duplicados.
- Usa \`upsert\` con claves únicas en vez de \`create\` ciego.
- Valida la entrada con Zod antes de tocar la base de datos.
- Devuelve el mismo resultado ante la misma petición repetida.`,
  },
  {
    title: "Deploy con preview environments",
    description: "Flujo de despliegue con entornos de previsualización por rama.",
    category: "DevOps",
    content: `# Preview deployments

1. Cada PR genera un entorno efímero con su propia URL.
2. Las variables de entorno sensibles viven en el gestor del proveedor, no en el repo.
3. El entorno se destruye automáticamente al mergear o cerrar el PR.
4. Ejecuta smoke tests contra la URL de preview antes de aprobar.`,
  },
  {
    title: "Índices en PostgreSQL",
    description: "Criterios prácticos para decidir cuándo y cómo indexar una tabla.",
    category: "Base de datos",
    content: `# Índices

- Indexa las columnas que aparecen en WHERE, JOIN y ORDER BY frecuentes.
- Prefiere índices compuestos que cubran la consulta completa.
- Usa \`EXPLAIN ANALYZE\` para confirmar que el índice se usa.
- No indexes todo: cada índice encarece los INSERT/UPDATE.`,
  },
  {
    title: "Tests de integración con Prisma",
    description: "Estrategia para probar queries reales contra una base de datos de prueba.",
    category: "Testing",
    content: `# Tests de integración

- Levanta una base de datos desechable (Docker o esquema temporal).
- Ejecuta las migraciones antes de la suite y limpia entre tests.
- Prueba la query real, no un mock de Prisma.
- Cubre los casos límite: registros vacíos, duplicados y borrados en cascada.`,
  },
  {
    title: "Prompts efectivos para agentes de código",
    description: "Técnicas para escribir prompts que producen mejores resultados con LLMs.",
    category: "IA",
    content: `# Prompts para agentes

- Da contexto concreto: archivos, convenciones y objetivo final.
- Pide el formato de salida explícitamente.
- Divide tareas grandes en pasos verificables.
- Incluye ejemplos de entrada/salida cuando el formato importe.`,
  },
];

// ---------------------------------------------------------------------------

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL");
  if (!ADMIN_EMAIL) throw new Error("Falta ADMIN_EMAIL");
  if (!ADMIN_PASSWORD) throw new Error("Falta ADMIN_PASSWORD");

  const needsSsl = /supabase\.(co|com)/.test(url) || /sslmode=require/.test(url);
  const adapter = new PrismaPg({
    connectionString: url,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
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

  // Skills (idempotente por título + autor)
  let skillsCreated = 0;
  for (const s of SKILLS) {
    const exists = await prisma.skill.findFirst({
      where: { title: s.title, authorId: admin.id },
      select: { id: true },
    });
    if (exists) continue;
    await prisma.skill.create({
      data: { ...s, authorId: admin.id },
    });
    skillsCreated++;
  }
  console.log(`Skills: ${skillsCreated} creadas (${SKILLS.length - skillsCreated} ya existían)`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
