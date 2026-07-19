import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // El driver de Postgres no debe empaquetarse por el bundler.
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  // Bundle standalone (server.js + node_modules trazados) para la imagen Docker.
  output: "standalone",
};

export default nextConfig;
