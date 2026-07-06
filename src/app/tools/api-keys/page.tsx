import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ApiKeyTool } from "./ApiKeyTool";

export const metadata: Metadata = {
  title: "Generador de API Keys — FreqDevTools",
};

export default function ApiKeysPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader
        title="Generador de API Keys / HMAC"
        description="Claves aleatorias con longitud en bits, prefijo, separador y salida en lista o JSON."
      />
      <ApiKeyTool />
    </div>
  );
}
