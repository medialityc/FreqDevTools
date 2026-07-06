// Configuración de la bóveda genérica de archivos cifrados.
// Un mismo modelo (EnvFile) almacena distintos tipos vía `kind`.

export type VaultKind = "ENV" | "WORKFLOW";

export interface VaultConfig {
  kind: VaultKind;
  route: string;
  title: string;
  description: string;
  newLabel: string;
  namePlaceholder: string;
  contentPlaceholder: string;
  emptyText: string;
}

export const VAULT_CONFIG: Record<VaultKind, VaultConfig> = {
  ENV: {
    kind: "ENV",
    route: "/env",
    title: "Variables de entorno",
    description:
      "Guarda tus archivos .env cifrados y compártelos por link con control de acceso.",
    newLabel: "Nuevo archivo",
    namePlaceholder: ".env.production",
    contentPlaceholder: "API_KEY=...\nDATABASE_URL=...",
    emptyText: "No tienes archivos .env guardados.",
  },
  WORKFLOW: {
    kind: "WORKFLOW",
    route: "/workflows",
    title: "Workflows de GitHub Actions",
    description:
      "Guarda tus workflows (YAML) cifrados y compártelos por link con control de acceso.",
    newLabel: "Nuevo workflow",
    namePlaceholder: "deploy.yml",
    contentPlaceholder:
      "name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4",
    emptyText: "No tienes workflows guardados.",
  },
};
