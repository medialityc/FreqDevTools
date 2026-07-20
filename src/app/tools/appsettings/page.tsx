import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { AppSettingsTool } from "./AppSettingsTool";

export const metadata: Metadata = {
  title: "Generador de appsettings.json — FreqDevTools",
};

export default function AppSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader
        title="Generador de appsettings.json"
        description="Pega pares clave=valor (con ':' para anidar secciones) y conviértelos en JSON compatible con appsettings.json de .NET."
      />
      <AppSettingsTool />
    </div>
  );
}
