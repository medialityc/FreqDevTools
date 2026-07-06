import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Módulos nativos / de servidor que no deben empaquetarse por el bundler.
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
  ],
};

export default nextConfig;
