import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PasswordTool } from "./PasswordTool";

export const metadata: Metadata = {
  title: "Generador de contraseñas — FreqDevTools",
};

export default function PasswordPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader
        title="Generador de contraseñas"
        description="Contraseñas seguras y configurables: longitud, símbolos y mayúsculas."
      />
      <PasswordTool />
    </div>
  );
}
