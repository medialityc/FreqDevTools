import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { CSharpTool } from "./CSharpTool";

export const metadata: Metadata = {
  title: "Serializar clase C# — FreqDevTools",
};

export default function CSharpSerializerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Serializar clase C#"
        description="Pega una o varias clases C# y obtén un JSON de ejemplo con valores por defecto estilo Swagger."
      />
      <CSharpTool />
    </div>
  );
}
