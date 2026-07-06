import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // El driver de Postgres no debe empaquetarse por el bundler.
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
};

export default nextConfig;
